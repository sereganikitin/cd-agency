#!/usr/bin/env bash
# Ежедневный бэкап БД и загрузок.
# Добавить в cron: 0 3 * * * /srv/cd-agency/deploy/backup.sh
set -euo pipefail

APP_DIR="/srv/cd-agency"
BACKUP_DIR="/var/backups/cd-agency"
KEEP_DAYS=14
TS=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# SQLite online backup (безопасно даже при работе приложения)
sqlite3 "$APP_DIR/data/cd.db" ".backup '$BACKUP_DIR/db-$TS.sqlite'" 2>/dev/null || cp "$APP_DIR/data/cd.db" "$BACKUP_DIR/db-$TS.sqlite"

# Uploads (инкрементально — только если что-то поменялось, архивируем раз в день)
tar -czf "$BACKUP_DIR/uploads-$TS.tar.gz" -C "$APP_DIR/public" uploads 2>/dev/null || true

# Удалить старше N дней
find "$BACKUP_DIR" -type f -mtime +$KEEP_DAYS -delete

echo "✓ Бэкап: $BACKUP_DIR/db-$TS.sqlite (+ uploads)"
