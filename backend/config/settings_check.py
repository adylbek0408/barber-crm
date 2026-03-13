# Для локальной проверки без PostgreSQL: python manage.py check --settings=config.settings_check
# Для запуска с одной SQLite (runserver + create_demo_users): то же settings, БД в файле.
from .settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': str(BASE_DIR / 'db_check.sqlite3'),  # файл — runserver и команды видят одни данные
    }
}
