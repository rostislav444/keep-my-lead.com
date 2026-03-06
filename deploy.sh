#!/bin/bash
set -e

SERVER="root@178.104.10.59"
REMOTE_DIR="/var/www/leadbot"
DOMAIN="keep-my-lead.com"

echo "=== Keep My Lead Deploy ==="

# 1. Sync files to server
echo "[1/7] Syncing files..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='postgres_data' \
  --exclude='.env' \
  ./ $SERVER:$REMOTE_DIR/

# 2. Copy prod env as .env on server (for docker-compose variable substitution)
echo "[2/7] Setting up environment..."
ssh $SERVER "cp $REMOTE_DIR/.env.prod $REMOTE_DIR/.env"

# 3. Build containers
echo "[3/7] Building containers..."
ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml build"

# 4. Bootstrap SSL — create dummy cert so nginx can start, then get real cert
echo "[4/7] Setting up SSL with Let's Encrypt..."
ssh $SERVER "cd $REMOTE_DIR && \
  CERT_PATH=\$(docker volume inspect leadbot_certbot_conf -f '{{.Mountpoint}}' 2>/dev/null || echo '') && \
  if [ -z \"\$CERT_PATH\" ] || [ ! -f \"\$CERT_PATH/live/$DOMAIN/fullchain.pem\" ]; then \
    echo 'Creating dummy certificate for initial nginx start...' && \
    docker compose -f docker-compose.prod.yml up -d nginx || true && \
    docker compose -f docker-compose.prod.yml stop nginx && \
    mkdir -p /tmp/certbot-dummy/$DOMAIN && \
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
      -keyout /tmp/certbot-dummy/$DOMAIN/privkey.pem \
      -out /tmp/certbot-dummy/$DOMAIN/fullchain.pem \
      -subj '/CN=$DOMAIN' && \
    CERT_VOL=\$(docker volume inspect leadbot_certbot_conf -f '{{.Mountpoint}}') && \
    mkdir -p \$CERT_VOL/live/$DOMAIN && \
    cp /tmp/certbot-dummy/$DOMAIN/* \$CERT_VOL/live/$DOMAIN/ && \
    rm -rf /tmp/certbot-dummy && \
    docker compose -f docker-compose.prod.yml up -d nginx && \
    echo 'Requesting real certificate from Let'\''s Encrypt...' && \
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
      --webroot -w /var/www/certbot \
      -d $DOMAIN -d www.$DOMAIN \
      --email admin@$DOMAIN \
      --agree-tos --no-eff-email --force-renewal && \
    docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload && \
    echo 'SSL certificate obtained!'; \
  else \
    echo 'Certificate already exists, skipping...'; \
  fi"

# 5. Start all services
echo "[5/7] Starting services..."
ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d"

# 6. Run migrations and collect static
echo "[6/7] Running migrations..."
ssh $SERVER "cd $REMOTE_DIR && \
  docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate && \
  docker compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput && \
  docker compose -f docker-compose.prod.yml exec -T backend python manage.py seed_demo"

# 7. Set up certbot auto-renewal cron
echo "[7/7] Setting up SSL auto-renewal..."
ssh $SERVER "CRON_CMD='0 3 * * * cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload' && \
  (crontab -l 2>/dev/null | grep -v certbot; echo \"\$CRON_CMD\") | crontab -"

echo ""
echo "=== Deploy complete ==="
echo "Site: https://$DOMAIN"
echo ""
