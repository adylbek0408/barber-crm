# BarberCRM — SaaS система для барбершопов

## Быстрый старт (локально без Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Создать БД в PostgreSQL:
# CREATE DATABASE barbercrm;
# CREATE USER barber_user WITH PASSWORD 'barber_pass';
# GRANT ALL PRIVILEGES ON DATABASE barbercrm TO barber_user;

python manage.py migrate
python manage.py createsuperuser  # создать платформ-админа

python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:3000

---

## Запуск через Docker

```bash
docker-compose up --build
```

Открыть: http://localhost

---

## Первые шаги после запуска

1. Зайти в Django Admin: http://localhost:8000/admin/
2. Создать суперпользователя с ролью `platform_admin`
3. Через API `/api/admin/barbershops/` создать первый барбершоп
4. Войти как owner, создать филиал и барберов
5. Войти как barber, добавить услуги и записать первую стрижку

---

## Структура проекта

```
barbercrm/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # JWT авторизация, роли
│   │   ├── barbershops/    # Барбершопы, филиалы, подписки
│   │   ├── barbers/        # Барберы и услуги
│   │   ├── appointments/   # Записи стрижек
│   │   └── analytics/      # Аналитика и отчёты
│   ├── config/             # Настройки Django
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── barber/     # Интерфейс барбера (3 клика)
│       │   ├── owner/      # Дашборд владельца
│       │   └── admin/      # Платформ-администратор
│       ├── api/            # Axios + все запросы
│       └── store/          # Zustand (auth)
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
```

---

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/login/ | Вход |
| GET | /api/auth/me/ | Текущий пользователь |
| GET/POST | /api/admin/barbershops/ | Управление барбершопами |
| GET/POST | /api/branches/ | Филиалы |
| GET/POST | /api/barbers/ | Барберы |
| GET/POST | /api/services/ | Услуги |
| GET/POST | /api/barber/appointments/ | Записи барбера |
| GET | /api/analytics/summary/ | Общая аналитика |
| GET | /api/analytics/by-barber/ | По барберам |
| GET | /api/analytics/by-branch/ | По филиалам |
| GET | /api/analytics/by-day/ | По дням |
| GET | /api/analytics/by-month/ | По месяцам |

---

## Стек

- **Backend:** Django 5 + DRF + JWT
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **DB:** PostgreSQL
- **Deploy:** Docker + Nginx
