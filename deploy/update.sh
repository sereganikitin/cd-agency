#!/usr/bin/env bash
# Обновление сайта: git pull → npm ci → build → restart.
# Запускать под root: bash /srv/cd-agency/deploy/update.sh
set -euo pipefail

APP_USER="cdagency"
APP_DIR="/srv/cd-agency"

cd "$APP_DIR"
sudo -u "$APP_USER" git pull --ff-only
sudo -u "$APP_USER" bash -lc "cd $APP_DIR && npm ci && npm run build"
systemctl restart cd-agency
systemctl status cd-agency --no-pager | head -20
echo "✓ Обновлено."
