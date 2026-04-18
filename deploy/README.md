# Деплой на Timeweb Cloud — пошагово

Итог: сайт на `https://cd-agency.ru`, автостарт, авто-HTTPS, один скрипт для обновления.

## Шаг 1. Залить код на GitHub

На локальной машине:

```bash
git add .
git commit -m "Initial commit"
# Создайте приватный репо на github.com, затем:
git remote add origin https://github.com/<you>/cd-agency.git
git push -u origin main
```

## Шаг 2. Создать VPS на Timeweb Cloud

1. https://timeweb.cloud → **Облачные серверы** → **Создать сервер**.
2. **ОС:** Ubuntu 24.04.
3. **Конфигурация:** 2 vCPU / 2 ГБ RAM / 30 ГБ NVMe (тариф ~300–500 ₽/мес). Для сотен посещений хватит с запасом.
4. **Регион:** Москва / СПб.
5. **Доступ:** SSH-ключ (лучше) или пароль root. Сохраните IP сервера.

## Шаг 3. Привязать домен cd-agency.ru

В Timeweb панели: **Домены → cd-agency.ru → DNS**. Добавьте:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | @ | `<IP сервера>` |
| A | www | `<IP сервера>` |

Ждём 5–30 минут (DNS-пропагация). Проверка: `nslookup cd-agency.ru` с любой машины должна вернуть ваш IP.

## Шаг 4. Запустить bootstrap-скрипт

Подключаемся к серверу по SSH:

```bash
ssh root@<IP>
```

Далее одной командой — поставит Node 22, nginx, скачает репо, соберёт, настроит systemd + HTTPS + firewall:

```bash
curl -fsSL https://raw.githubusercontent.com/<you>/cd-agency/main/deploy/bootstrap.sh -o /tmp/bootstrap.sh
bash /tmp/bootstrap.sh https://github.com/<you>/cd-agency.git
```

В конце скрипт выведет **пароль админа** — сохраните его. Войти: https://cd-agency.ru/admin/login.

## Шаг 5. Настроить ежедневный бэкап

```bash
chmod +x /srv/cd-agency/deploy/backup.sh
apt-get install -y sqlite3
(crontab -l 2>/dev/null; echo "0 3 * * * /srv/cd-agency/deploy/backup.sh >> /var/log/cd-backup.log 2>&1") | crontab -
```

Бэкапы: `/var/backups/cd-agency/`, хранятся 14 дней.

---

## Повседневные операции

| Задача | Команда |
|---|---|
| Обновить сайт (после `git push`) | `bash /srv/cd-agency/deploy/update.sh` |
| Логи в реальном времени | `journalctl -u cd-agency -f` |
| Перезапустить | `systemctl restart cd-agency` |
| Статус | `systemctl status cd-agency` |
| Обновить только nginx-конфиг | `cp /srv/cd-agency/deploy/nginx.conf /etc/nginx/sites-available/cd-agency.ru && nginx -t && systemctl reload nginx` |
| Сменить пароль админа | отредактировать `/srv/cd-agency/.env.local`, затем `systemctl restart cd-agency` |

## Когда вырастете до тысяч посещений

Система выдержит (SQLite + один Node-процесс справляются). Сигналы, что пора тюнить:
- CPU стабильно > 70%
- Задержка ответа TTFB > 500 мс
- Размер БД > 1 ГБ или нужна многопользовательская админка

Пути развития в порядке возрастания сложности:
1. **Вертикально:** апгрейд тарифа на Timeweb (4 vCPU / 8 ГБ).
2. **Горизонтально:** несколько Node-инстансов за nginx (cluster / pm2).
3. **Миграция:** SQLite → Postgres (Timeweb Managed PostgreSQL) и `public/uploads/` → S3-совместимое (Timeweb Cloud Storage).
