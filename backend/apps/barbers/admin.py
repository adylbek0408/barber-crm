import secrets
import string
from django.contrib import admin, messages
from django.utils.html import format_html
from .models import Barber, Service
from apps.accounts.models import User

TRANSLIT_MAP = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo',
    'ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m',
    'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
    'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    'ң':'ng','ү':'u','ө':'o',
}

def transliterate(text):
    return ''.join(TRANSLIT_MAP.get(ch, ch) for ch in text.lower())

def make_username(text):
    translit = transliterate(text)
    clean = ''.join(c if (c.isalnum() or c == '_') else '_' for c in translit)
    while '__' in clean:
        clean = clean.replace('__', '_')
    return clean.strip('_') or 'barber'

def generate_password(length=10):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def unique_username(base):
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username


class ServiceInline(admin.TabularInline):
    model = Service
    extra = 2
    fields = ['name', 'price', 'is_active']


@admin.register(Barber)
class BarberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'branch', 'phone', 'show_login', 'is_active', 'created_at']
    list_filter = ['branch__barbershop', 'is_active']
    search_fields = ['first_name', 'last_name', 'phone']
    inlines = [ServiceInline]
    readonly_fields = ['show_credentials_box', 'created_at']

    def get_fields(self, request, obj=None):
        if obj is None:
            return ['branch', 'first_name', 'last_name', 'phone', 'is_active']
        return ['branch', 'first_name', 'last_name', 'phone', 'is_active',
                'show_credentials_box', 'created_at']

    def show_login(self, obj):
        if obj.user:
            return format_html(
                '<code style="background:#1a1a2e;color:#00d4aa;padding:3px 8px;'
                'border-radius:4px;font-size:13px;">{}</code>',
                obj.user.username
            )
        return '—'
    show_login.short_description = 'Логин'

    def show_credentials_box(self, obj):
        if obj and obj.pk and obj.user:
            return format_html(
                '<div style="background:#1e1e2e;border:2px solid #e94560;border-radius:10px;'
                'padding:18px;max-width:480px;">'
                '<p style="margin:0 0 10px;color:#aaa;font-size:11px;text-transform:uppercase;'
                'letter-spacing:1px;">Данные для входа (барбер)</p>'
                '<p style="margin:0 0 8px;font-size:15px;">'
                '🔑 Логин: <strong style="color:#00d4aa;font-size:17px;'
                'background:#0a0a1a;padding:3px 10px;border-radius:5px;'
                'font-family:monospace">{}</strong></p>'
                '<p style="margin:0 0 12px;font-size:13px;color:#888;">'
                '🔒 Пароль был показан при создании</p>'
                '<hr style="border-color:#333;margin:10px 0">'
                '<p style="margin:0;font-size:12px;color:#666;">'
                '📱 Барбер входит через телефон: '
                '<a href="http://localhost:3000" style="color:#e94560">'
                'http://localhost:3000</a></p>'
                '</div>',
                obj.user.username
            )
        return '—'
    show_credentials_box.short_description = 'Данные для входа'

    def save_model(self, request, obj, form, change):
        if not change:
            base = make_username(f"{obj.first_name}_{obj.last_name}")
            username = unique_username(base)
            password = generate_password()

            user = User.objects.create_user(
                username=username,
                password=password,
                role=User.ROLE_BARBER,
                first_name=obj.first_name,
                last_name=obj.last_name,
            )
            obj.user = user
            super().save_model(request, obj, form, change)

            messages.success(
                request,
                format_html(
                    '<div style="font-size:14px;line-height:2;padding:4px 0">'
                    '✅ Барбер <strong>{} {}</strong> создан!<br>'
                    '<span style="color:#ccc;font-size:12px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                    '🔑 Логин:&nbsp;&nbsp;'
                    '<strong style="font-size:17px;background:#222;color:#00ff99;'
                    'padding:3px 12px;border-radius:5px;font-family:monospace">{}</strong><br>'
                    '🔒 Пароль: '
                    '<strong style="font-size:17px;background:#222;color:#ffcc00;'
                    'padding:3px 12px;border-radius:5px;font-family:monospace">{}</strong><br>'
                    '<span style="color:#ccc;font-size:12px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                    '📱 Барбер входит через телефон: '
                    '<a href="http://localhost:3000" style="color:#e94560;font-weight:bold">'
                    'http://localhost:3000</a>'
                    '</div>',
                    obj.first_name, obj.last_name, username, password
                )
            )
        else:
            super().save_model(request, obj, form, change)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'barber', 'price', 'is_active']
    list_filter = ['barber__branch__barbershop', 'is_active']
    list_editable = ['price', 'is_active']
    search_fields = ['name', 'barber__first_name', 'barber__last_name']
