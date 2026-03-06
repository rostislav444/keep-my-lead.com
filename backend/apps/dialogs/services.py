from apps.bot.instagram import send_dm
from .models import Dialog, Message


def handoff_dialog(dialog):
    """Hand off dialog from bot to human manager."""
    dialog.is_bot_active = False
    dialog.status = Dialog.Status.HANDED_OFF
    dialog.save(update_fields=['is_bot_active', 'status'])


def return_dialog_to_bot(dialog):
    """Return dialog control back to the bot."""
    dialog.is_bot_active = True
    dialog.status = Dialog.Status.ACTIVE
    dialog.save(update_fields=['is_bot_active', 'status'])


def send_manager_message(dialog, text):
    """Send a message as manager and deliver it via Instagram DM."""
    message = Message.objects.create(
        dialog=dialog, role=Message.Role.MANAGER, text=text
    )
    send_dm(dialog.instagram_account, dialog.instagram_user_id, text)
    return message
