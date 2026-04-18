#!/usr/bin/env bash
# Одноразовый скрипт первичной настройки Ubuntu 24.04 VPS для cd-agency.ru.
# Запускать под root: bash bootstrap.sh <repo-url>
# Пример: bash bootstrap.sh https://github.com/your/cd-agency.git
set -euo pipefail

REPO_URL="${1:?укажите URL git-репозитория первым аргументом}"
APP_USER="cdagency"
APP_DIR="/srv/cd-agency"
DOMAIN="cd-agency.ru"

echo "==> Обновление системы"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx ufw ca-certificates

echo "==> Установка Node.js 22 LTS"
if ! command -v node >/dev/null || [[ "$(node -v | cut -c2-3)" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Пользователь приложения"
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi

echo "==> Клонирование репозитория"
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
if [[ ! -d "$APP_DIR/.git" ]]; then
  # Чистим старое содержимое, но сам каталог сохраняем с правильным владельцем
  find "$APP_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR"
else
  sudo -u "$APP_USER" git -C "$APP_DIR" pull --ff-only
fi

mkdir -p "$APP_DIR/data" "$APP_DIR/public/uploads"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> .env.local"
if [[ ! -f "$APP_DIR/.env.local" ]]; then
  AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  ADMIN_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(12).toString('base64url'))")
  cat > "$APP_DIR/.env.local" <<EOF
AUTH_SECRET=${AUTH_SECRET}
ADMIN_EMAIL=admin@${DOMAIN}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
DATABASE_PATH=./data/cd.db
AUTH_URL=https://${DOMAIN}
EOF
  chmod 600 "$APP_DIR/.env.local"
  chown "$APP_USER:$APP_USER" "$APP_DIR/.env.local"
  echo ""
  echo "!!! СОХРАНИТЕ ПАРОЛЬ АДМИНА: ${ADMIN_PASSWORD}"
  echo "!!! Email: admin@${DOMAIN}"
  echo ""
fi

echo "==> npm ci && build"
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm ci && npm run build"

echo "==> systemd unit"
cp "$APP_DIR/deploy/cd-agency.service" /etc/systemd/system/cd-agency.service
systemctl daemon-reload
systemctl enable --now cd-agency.service

echo "==> nginx"
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/${DOMAIN}
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Фаервол"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Certbot (HTTPS)"
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect

echo ""
echo "✓ Готово. Сайт: https://${DOMAIN}"
echo "  Логи:        journalctl -u cd-agency -f"
echo "  Обновление:  bash $APP_DIR/deploy/update.sh"
