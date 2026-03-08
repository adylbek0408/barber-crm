#!/bin/bash
# ══════════════════════════════════════════════════════
#  BarberCRM — Update Script (запускать после git push)
#  Использование: bash deploy/update.sh
# ══════════════════════════════════════════════════════
set -e

PROJECT_DIR="/var/www/barbercrm"
cd "$PROJECT_DIR"

echo "🔄 Обновляем BarberCRM..."

# Получаем изменения
git pull

# Backend
echo "  [1/3] Backend..."
source venv/bin/activate
pip install -r backend/requirements.txt -q
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput
cd ..
deactivate

# Frontend
echo "  [2/3] Frontend build..."
cd frontend
npm install --legacy-peer-deps -q
npm run build
cd ..

# Права
chown -R www-data:www-data "$PROJECT_DIR"

# Перезапуск
echo "  [3/3] Перезапуск сервисов..."
systemctl restart barbercrm
systemctl reload nginx

echo "✅ Обновление завершено!"
systemctl status barbercrm --no-pager -l
