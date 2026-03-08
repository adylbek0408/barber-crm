#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  BarberCRM — Deploy Script
#  Сервер: 83.222.10.148
#  Запуск: bash deploy/setup_server.sh
# ══════════════════════════════════════════════════════════════
set -e

PROJECT_DIR="/var/www/barbercrm"
REPO_URL="https://github.com/adylbek0408/barber-crm.git"
DB_NAME="barbercrm_db"
DB_USER="barber_user"
SERVICE_NAME="barbercrm"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BarberCRM — Установка сервера"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Системные пакеты ──────────────────────────────────────
echo "[1/9] Устанавливаем пакеты..."
apt-get update -qq
apt-get install -y -qq \
    python3.12 python3.12-venv python3-pip \
    postgresql postgresql-contrib \
    nginx \
    git \
    curl \
    build-essential libpq-dev

# ── 2. Node.js 20 ────────────────────────────────────────────
echo "[2/9] Устанавливаем Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# ── 3. PostgreSQL ─────────────────────────────────────────────
echo "[3/9] Настраиваем PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

# Читаем пароль БД из .env файла если он уже есть
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    DB_PASS=$(grep DB_PASSWORD "$PROJECT_DIR/backend/.env" | cut -d= -f2)
else
    DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    echo "  Сгенерирован пароль БД: $DB_PASS  (сохрани!)"
fi

su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'\" | grep -q 1 || \
    psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\" | grep -q 1 || \
    psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""
echo "  БД готова: $DB_NAME / $DB_USER"

# ── 4. Клонируем / обновляем репо ────────────────────────────
echo "[4/9] Клонируем репозиторий..."
if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR" && git pull
else
    mkdir -p /var/www
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# ── 5. Backend Python ─────────────────────────────────────────
echo "[5/9] Настраиваем Python backend..."
cd "$PROJECT_DIR"

# Виртуальное окружение
python3.12 -m venv venv
source venv/bin/activate

pip install --upgrade pip -q
pip install -r backend/requirements.txt -q

# .env для продакшена
if [ ! -f "backend/.env" ]; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    cat > backend/.env <<EOF
SECRET_KEY=$SECRET_KEY
DEBUG=False

ALLOWED_HOSTS=83.222.10.148,localhost,127.0.0.1

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://83.222.10.148
EOF
    echo "  Создан backend/.env"
fi

# Django миграции и статика
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput
cd ..

deactivate

# ── 6. Frontend Build ─────────────────────────────────────────
echo "[6/9] Собираем React frontend..."
cd "$PROJECT_DIR/frontend"

# Обновляем API URL для продакшена
sed -i "s|http://localhost:8000|http://83.222.10.148|g" src/api/axios.js

npm install --legacy-peer-deps -q
npm run build
echo "  Frontend собран: $PROJECT_DIR/frontend/dist"
cd "$PROJECT_DIR"

# ── 7. Права доступа ─────────────────────────────────────────
echo "[7/9] Настраиваем права..."
mkdir -p /var/log/barbercrm
chown -R www-data:www-data "$PROJECT_DIR"
chown -R www-data:www-data /var/log/barbercrm
chmod -R 755 "$PROJECT_DIR"

# ── 8. Systemd сервис ─────────────────────────────────────────
echo "[8/9] Настраиваем systemd сервис..."
cp "$PROJECT_DIR/deploy/barbercrm.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "  ✅ Gunicorn запущен"
else
    echo "  ❌ Ошибка! Смотри: journalctl -u $SERVICE_NAME -n 30"
    journalctl -u "$SERVICE_NAME" -n 20
fi

# ── 9. Nginx ──────────────────────────────────────────────────
echo "[9/9] Настраиваем Nginx..."
cp "$PROJECT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/barbercrm
ln -sf /etc/nginx/sites-available/barbercrm /etc/nginx/sites-enabled/barbercrm
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
echo "  ✅ Nginx запущен"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ BarberCRM задеплоен!"
echo "  🌐 Сайт:  http://83.222.10.148"
echo "  🔧 Admin: http://83.222.10.148/admin/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Создать superuser:"
echo "  cd $PROJECT_DIR && source venv/bin/activate"
echo "  cd backend && python manage.py createsuperuser"
