from rest_framework import serializers
from .models import Barbershop, Branch, Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['barbershop']


class BarbershopSerializer(serializers.ModelSerializer):
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = Barbershop
        fields = ['id', 'name', 'owner_name', 'phone', 'address', 'is_active',
                  'has_shop_admin', 'created_at', 'subscription']
        read_only_fields = ['id', 'created_at']


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'barbershop', 'name', 'address', 'is_active', 'created_at']
        read_only_fields = ['id', 'barbershop', 'created_at']


class CreateBarbershopSerializer(serializers.ModelSerializer):
    """Для создания барбершопа (платформ-админом). При has_shop_admin=True — обязательны поля администратора."""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    has_shop_admin = serializers.BooleanField(default=False, write_only=True)
    shop_admin_first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    shop_admin_last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    shop_admin_username = serializers.CharField(required=False, allow_blank=True, write_only=True)
    shop_admin_password = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Barbershop
        fields = [
            'name', 'owner_name', 'phone', 'address',
            'username', 'password',
            'has_shop_admin',
            'shop_admin_first_name', 'shop_admin_last_name',
            'shop_admin_username', 'shop_admin_password',
        ]

    def validate(self, attrs):
        if attrs.get('has_shop_admin'):
            for key in ('shop_admin_first_name', 'shop_admin_last_name', 'shop_admin_username', 'shop_admin_password'):
                if not (attrs.get(key) or '').strip():
                    raise serializers.ValidationError(
                        {key: 'Обязательно при «Есть администратор барбершопа»'}
                    )
        return attrs

    def create(self, validated_data):
        from apps.accounts.models import User
        from datetime import date, timedelta

        username = validated_data.pop('username')
        password = validated_data.pop('password')
        has_shop_admin = validated_data.pop('has_shop_admin', False)
        shop_admin_first_name = (validated_data.pop('shop_admin_first_name', '') or '').strip()
        shop_admin_last_name = (validated_data.pop('shop_admin_last_name', '') or '').strip()
        shop_admin_username = (validated_data.pop('shop_admin_username', '') or '').strip()
        shop_admin_password = (validated_data.pop('shop_admin_password', '') or '').strip()

        # Создаём пользователя-владельца
        owner_name = (validated_data.get('owner_name') or '').strip()
        name_parts = owner_name.split(None, 1) if owner_name else []
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.ROLE_OWNER,
            first_name=first_name,
            last_name=last_name,
        )

        barbershop = Barbershop.objects.create(owner=user, has_shop_admin=has_shop_admin, **validated_data)

        if has_shop_admin and shop_admin_username:
            shop_admin_user = User.objects.create_user(
                username=shop_admin_username,
                password=shop_admin_password,
                role=User.ROLE_SHOP_ADMIN,
                first_name=shop_admin_first_name,
                last_name=shop_admin_last_name,
            )
            barbershop.shop_admin = shop_admin_user
            barbershop.save(update_fields=['shop_admin'])

        # Создаём пробную подписку на 30 дней
        Subscription.objects.create(
            barbershop=barbershop,
            plan='trial',
            started_at=date.today(),
            expires_at=date.today() + timedelta(days=30),
            is_paid=False,
        )

        return barbershop
