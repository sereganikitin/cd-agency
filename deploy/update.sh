#!/usr/bin/env bash
# Обновление сайта: git pull → npm ci → build → restart.
# Запускать под root: bash /srv/cd-agency/deploy/update.sh
set -euo pipefail

APP_USER="cdagency"
APP_DIR="/srv/cd-agency"

cd "$APP_DIR"
git config --global --add safe.directory "$APP_DIR" || true
git pull --ff-only
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm ci && npm run build"
systemctl restart cd-agency
systemctl status cd-agency --no-pager | head -20
echo "✓ Обновлено."
