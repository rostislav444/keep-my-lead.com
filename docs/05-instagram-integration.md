# 05 - Instagram Integration

## OAuth Flow (подключение аккаунта)

### Шаги:
1. Пользователь нажимает "Подключить Instagram" в дашборде
2. Редирект на Meta OAuth:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?
     client_id={APP_ID}
     &redirect_uri={CALLBACK_URL}
     &scope=instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_manage_metadata
     &response_type=code
   ```
3. Пользователь авторизует приложение
4. Meta редиректит обратно с `code`
5. Backend обменивает `code` на access_token
6. Backend получает Instagram user ID и username
7. Создаётся InstagramAccount, привязанный к tenant

### Обновление токена
- Short-lived token → Long-lived token (60 дней)
- Celery задача обновляет токены до истечения

## Webhook Setup

### Регистрация в Meta Dashboard:
- Callback URL: `https://leadbot.app/api/webhooks/instagram/`
- Verify token: из настроек
- Подписка на: `messages`, `comments`

### Verification endpoint:
```python
# GET /api/webhooks/instagram/
def verify_webhook(request):
    mode = request.GET.get('hub.mode')
    token = request.GET.get('hub.verify_token')
    challenge = request.GET.get('hub.challenge')
    if mode == 'subscribe' and token == settings.META_VERIFY_TOKEN:
        return HttpResponse(challenge)
    return HttpResponse(status=403)
```

### Webhook handler:
```python
# POST /api/webhooks/instagram/
async def handle_webhook(request):
    payload = json.loads(request.body)

    for entry in payload.get('entry', []):
        # Direct Messages
        for messaging in entry.get('messaging', []):
            sender_id = messaging['sender']['id']
            text = messaging.get('message', {}).get('text', '')
            ig_account_id = entry['id']
            await process_incoming_dm(ig_account_id, sender_id, text)

        # Comments
        for change in entry.get('changes', []):
            if change['field'] == 'comments':
                comment = change['value']
                await process_incoming_comment(
                    ig_account_id=entry['id'],
                    comment_id=comment['id'],
                    user_id=comment['from']['id'],
                    text=comment['text'],
                    post_id=comment.get('media', {}).get('id'),
                )

    return HttpResponse('OK')
```

## Отправка сообщений

### DM через Meta API:
```python
async def send_dm(instagram_account, recipient_id, text):
    url = f"https://graph.facebook.com/v18.0/{instagram_account.instagram_user_id}/messages"
    response = requests.post(url, json={
        "recipient": {"id": recipient_id},
        "message": {"text": text},
    }, headers={
        "Authorization": f"Bearer {instagram_account.access_token}"
    })
    return response.json()
```

## Rate Limits (Meta API)
- 200 вызовов в час на аккаунт (стандартный доступ)
- Нужно учитывать при массовых ответах
- Redis rate limiter в webhook handler
