# Для локальной проверки без PostgreSQL: python manage.py check --settings=config.settings_check
from .settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
