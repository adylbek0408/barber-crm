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
                  'created_at', 'subscription']
        read_only_fields = ['id', 'created_at']


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'barbershop', 'name', 'address', 'is_active', 'created_at']
        read_only_fields = ['id', 'barbershop', 'created_at']


class CreateBarbershopSerializer(serializers.ModelSerializer):
    """Для создания барбершопа (платформ-админом)"""
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Barbershop
        fields = ['name', 'owner_name', 'phone', 'address', 'username', 'password']

    def create(self, validated_data):
        from apps.accounts.models import User
        from datetime import date, timedelta

        username = validated_data.pop('username')
        password = validated_data.pop('password')

        # Создаём пользователя-владельца
        user = User.objects.create_user(
            username=username,
            password=password,
            role=User.ROLE_OWNER,
            first_name=validated_data.get('owner_name', '').split()[0] if validated_data.get('owner_name') else '',
        )

        barbershop = Barbershop.objects.create(owner=user, **validated_data)

        # Создаём пробную подписку на 30 дней
        Subscription.objects.create(
            barbershop=barbershop,
            plan='trial',
            started_at=date.today(),
            expires_at=date.today() + timedelta(days=30),
            is_paid=False,
        )

        return barbershop
