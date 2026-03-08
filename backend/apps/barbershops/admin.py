import secrets
import string
from django.contrib import admin, messages
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import redirect, get_object_or_404
from django.http import HttpResponseRedirect
from .models import Barbershop, Branch, Subscription
from apps.accounts.models import User


# ─── Утилиты ──────────────────────────────────────────────────
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
    return clean.strip('_') or 'user'

def generate_password(length=12):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def unique_username(base):
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username


# ─── Inline ───────────────────────────────────────────────────
class SubscriptionInline(admin.StackedInline):
    model = Subscription
    extra = 0
    can_delete = False


class BranchInline(admin.TabularInline):
    model = Branch
    extra = 0
    fields = ['name', 'address', 'is_active']


# ─── Barbershop Admin ─────────────────────────────────────────
@admin.register(Barbershop)
class BarbershopAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner_name', 'phone', 'show_login', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'owner_name', 'phone']
    inlines = [SubscriptionInline, BranchInline]
    readonly_fields = ['show_credentials_box', 'reset_password_button', 'created_at']

    def get_fields(self, request, obj=None):
        if obj is None:
            return ['name', 'owner_name', 'phone', 'address', 'is_active']
        return ['name', 'owner_name', 'phone', 'address', 'is_active',
                'show_credentials_box', 'reset_password_button', 'created_at']

    # ── Кастомные URL для кнопки сброса пароля ──
    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                '<int:barbershop_id>/reset-password/',
                self.admin_site.admin_view(self.reset_password_view),
                name='barbershop_reset_password',
            ),
        ]
        return custom + urls

    def reset_password_view(self, request, barbershop_id):
        """Генерирует новый пароль и показывает его"""
        shop = get_object_or_404(Barbershop, pk=barbershop_id)
        new_password = generate_password()

        try:
            owner = shop.owner
            # Если owner — суперюзер (admin), создаём отдельного User для этого барбершопа
            if owner.is_superuser or owner.role != User.ROLE_OWNER:
                username = unique_username(make_username(shop.name))
                parts = shop.owner_name.split()
                new_owner = User.objects.create_user(
                    username=username,
                    password=new_password,
                    role=User.ROLE_OWNER,
                    first_name=parts[0] if parts else '',
                    last_name=' '.join(parts[1:]) if len(parts) > 1 else '',
                    phone=shop.phone,
                )
                shop.owner = new_owner
                shop.save()
                login = username
            else:
                owner.set_password(new_password)
                owner.save()
                login = owner.username
        except Exception:
            username = unique_username(make_username(shop.name))
            parts = shop.owner_name.split()
            new_owner = User.objects.create_user(
                username=username,
                password=new_password,
                role=User.ROLE_OWNER,
                first_name=parts[0] if parts else '',
                last_name=' '.join(parts[1:]) if len(parts) > 1 else '',
                phone=shop.phone,
            )
            shop.owner = new_owner
            shop.save()
            login = username

        messages.success(
            request,
            format_html(
                '<div style="font-size:15px;line-height:2.2;padding:6px 0">'
                '🔄 Пароль для барбершопа <strong>«{}»</strong> сброшен!<br>'
                '<span style="color:#555;font-size:11px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                '🔑 Логин:&nbsp;&nbsp;&nbsp;'
                '<strong style="font-size:20px;background:#1a1a1a;color:#00ff99;'
                'padding:4px 14px;border-radius:6px;font-family:monospace;'
                'border:1px solid #00ff99">{}</strong><br>'
                '🔒 Пароль:&nbsp;'
                '<strong style="font-size:20px;background:#1a1a1a;color:#ffcc00;'
                'padding:4px 14px;border-radius:6px;font-family:monospace;'
                'border:1px solid #ffcc00">{}</strong><br>'
                '<span style="color:#555;font-size:11px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                '⚠️ <em style="color:#ff8800">Сохраните пароль сейчас — он больше не будет показан!</em><br>'
                '📱 Ссылка: '
                '<a href="http://localhost:3000" style="color:#00aaff;font-weight:bold">'
                'http://localhost:3000</a>'
                '</div>',
                shop.name, login, new_password
            )
        )
        return HttpResponseRedirect(
            f'/admin/barbershops/barbershop/{barbershop_id}/change/'
        )

    def show_login(self, obj):
        try:
            owner = obj.owner
            color = '#00d4aa' if (not owner.is_superuser and owner.role == User.ROLE_OWNER) else '#ff6b6b'
            label = owner.username
            warning = '' if (not owner.is_superuser and owner.role == User.ROLE_OWNER) else ' ⚠️'
            return format_html(
                '<code style="background:#1a1a2e;color:{};padding:3px 8px;'
                'border-radius:4px;font-size:13px;">{}{}</code>',
                color, label, warning
            )
        except Exception:
            return format_html('<span style="color:#ff6b6b">❌ нет владельца</span>')
    show_login.short_description = 'Логин'

    def show_credentials_box(self, obj):
        if not obj or not obj.pk:
            return '—'
        try:
            owner = obj.owner
            is_wrong = owner.is_superuser or owner.role != User.ROLE_OWNER

            if is_wrong:
                return format_html(
                    '<div style="background:#2a1010;border:2px solid #ff4444;'
                    'border-radius:10px;padding:16px;max-width:500px;">'
                    '<p style="margin:0 0 8px;color:#ff6b6b;font-weight:bold;">'
                    '⚠️ Владелец назначен неверно (текущий: <code>{}</code>)</p>'
                    '<p style="margin:0;color:#aaa;font-size:13px;">'
                    'Нажмите кнопку <strong>"Сбросить пароль"</strong> ниже — '
                    'система создаст правильного владельца и покажет логин/пароль.</p>'
                    '</div>',
                    owner.username
                )
            else:
                return format_html(
                    '<div style="background:#0d1f0d;border:2px solid #00d4aa;'
                    'border-radius:10px;padding:16px;max-width:500px;">'
                    '<p style="margin:0 0 10px;color:#888;font-size:11px;'
                    'text-transform:uppercase;letter-spacing:1px;">'
                    'Данные для входа (владелец)</p>'
                    '<p style="margin:0 0 8px;font-size:16px;">'
                    '🔑 Логин: <strong style="color:#00ff99;font-size:18px;'
                    'background:#0a0a0a;padding:3px 12px;border-radius:5px;'
                    'font-family:monospace;border:1px solid #00d4aa">{}</strong></p>'
                    '<p style="margin:0 0 12px;font-size:13px;color:#666;">'
                    '🔒 Пароль: нажмите "Сбросить пароль" чтобы выдать новый</p>'
                    '<p style="margin:0;font-size:12px;color:#555;">'
                    '📱 Вход: <a href="http://localhost:3000" style="color:#00aaff">'
                    'http://localhost:3000</a></p>'
                    '</div>',
                    owner.username
                )
        except Exception:
            return format_html(
                '<div style="background:#2a1010;border:2px solid #ff4444;'
                'border-radius:10px;padding:16px;">'
                '<p style="color:#ff6b6b;margin:0;">❌ Владелец не найден. '
                'Нажмите "Сбросить пароль" для создания.</p>'
                '</div>'
            )
    show_credentials_box.short_description = 'Текущий логин'

    def reset_password_button(self, obj):
        if not obj or not obj.pk:
            return '—'
        return format_html(
            '<a href="/admin/barbershops/barbershop/{}/reset-password/" '
            'style="display:inline-block;background:#e94560;color:#fff;'
            'padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;'
            'text-decoration:none;border:none;cursor:pointer;">'
            '🔄 Сбросить пароль и показать логин/пароль'
            '</a>',
            obj.pk
        )
    reset_password_button.short_description = 'Действие'

    def save_model(self, request, obj, form, change):
        if not change:
            username = unique_username(make_username(obj.name))
            password = generate_password()
            parts = obj.owner_name.split()
            user = User.objects.create_user(
                username=username,
                password=password,
                role=User.ROLE_OWNER,
                first_name=parts[0] if parts else '',
                last_name=' '.join(parts[1:]) if len(parts) > 1 else '',
                phone=obj.phone,
            )
            obj.owner = user
            super().save_model(request, obj, form, change)

            from datetime import date, timedelta
            Subscription.objects.get_or_create(
                barbershop=obj,
                defaults={
                    'plan': 'trial',
                    'started_at': date.today(),
                    'expires_at': date.today() + timedelta(days=30),
                    'is_paid': False,
                }
            )

            messages.success(
                request,
                format_html(
                    '<div style="font-size:15px;line-height:2.2;padding:6px 0">'
                    '✅ Барбершоп <strong>«{}»</strong> создан!<br>'
                    '<span style="color:#555;font-size:11px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                    '🔑 Логин:&nbsp;&nbsp;&nbsp;'
                    '<strong style="font-size:20px;background:#1a1a1a;color:#00ff99;'
                    'padding:4px 14px;border-radius:6px;font-family:monospace;'
                    'border:1px solid #00ff99">{}</strong><br>'
                    '🔒 Пароль:&nbsp;'
                    '<strong style="font-size:20px;background:#1a1a1a;color:#ffcc00;'
                    'padding:4px 14px;border-radius:6px;font-family:monospace;'
                    'border:1px solid #ffcc00">{}</strong><br>'
                    '<span style="color:#555;font-size:11px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>'
                    '⚠️ <em style="color:#ff8800">Сохраните пароль — он больше не будет показан!</em><br>'
                    '📱 Ссылка: <a href="http://localhost:3000" style="color:#00aaff;font-weight:bold">'
                    'http://localhost:3000</a>'
                    '</div>',
                    obj.name, username, password
                )
            )
        else:
            super().save_model(request, obj, form, change)


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'barbershop', 'address', 'is_active']
    list_filter = ['barbershop', 'is_active']
    search_fields = ['name', 'barbershop__name']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['barbershop', 'plan', 'started_at', 'expires_at', 'is_paid']
    list_filter = ['plan', 'is_paid']
    list_editable = ['is_paid']
