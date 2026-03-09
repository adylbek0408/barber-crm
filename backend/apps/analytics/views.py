from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDay, TruncMonth
from datetime import datetime
from apps.accounts.permissions import IsOwner
from apps.appointments.models import Appointment


def parse_month(month_str):
    """Валидация параметра month: ожидается YYYY-MM. Возвращает (year, month) или None."""
    if not month_str or not month_str.strip():
        return None
    try:
        dt = datetime.strptime(month_str.strip(), '%Y-%m')
        return dt.year, dt.month
    except ValueError:
        return None


def apply_month_filter(qs, request):
    """Хелпер: фильтрует queryset по параметру ?month=YYYY-MM (только при валидном формате)."""
    month = request.query_params.get('month')
    parsed = parse_month(month) if month else None
    if parsed:
        year, m = parsed
        qs = qs.filter(created_at__year=year, created_at__month=m)
    return qs


class AnalyticsSummaryView(APIView):
    """Общая аналитика барбершопа (только владелец)"""
    permission_classes = [IsOwner]

    def get(self, request):
        qs = Appointment.objects.filter(
            branch__barbershop=request.user.barbershop
        )

        # Фильтры
        date_from = request.query_params.get('date_from')
        date_to   = request.query_params.get('date_to')
        month     = request.query_params.get('month')
        branch_id = request.query_params.get('branch')

        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        parsed = parse_month(month) if month else None
        if parsed:
            year, m = parsed
            qs = qs.filter(created_at__year=year, created_at__month=m)
        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        summary = qs.aggregate(
            total_revenue=Sum('price'),
            total_appointments=Count('id'),
            avg_check=Avg('price'),
        )

        payment_stats = qs.values('payment_type').annotate(
            total=Sum('price'),
            count=Count('id'),
        )

        return Response({
            'total_revenue': summary['total_revenue'] or 0,
            'total_appointments': summary['total_appointments'] or 0,
            'avg_check': round(summary['avg_check'] or 0, 2),
            'payment_stats': list(payment_stats),
        })


class AnalyticsByBranchView(APIView):
    """Аналитика по филиалам (только владелец)"""
    permission_classes = [IsOwner]

    def get(self, request):
        qs = Appointment.objects.filter(
            branch__barbershop=request.user.barbershop
        )
        # Фильтр применяется правильно — результат сохраняем обратно
        qs = apply_month_filter(qs, request)

        branch_id = request.query_params.get('branch')
        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        data = qs.values('branch__id', 'branch__name').annotate(
            total_revenue=Sum('price'),
            total_appointments=Count('id'),
        ).order_by('-total_revenue')

        return Response(list(data))


class AnalyticsByBarberView(APIView):
    """Аналитика по барберам (только владелец)"""
    permission_classes = [IsOwner]

    def get(self, request):
        qs = Appointment.objects.filter(
            branch__barbershop=request.user.barbershop
        )
        qs = apply_month_filter(qs, request)

        branch_id = request.query_params.get('branch')
        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        data = qs.values(
            'barber__id', 'barber__first_name', 'barber__last_name'
        ).annotate(
            total_revenue=Sum('price'),
            total_appointments=Count('id'),
            avg_check=Avg('price'),
        ).order_by('-total_revenue')

        return Response(list(data))


class AnalyticsByDayView(APIView):
    """Аналитика по дням (только владелец)"""
    permission_classes = [IsOwner]

    def get(self, request):
        qs = Appointment.objects.filter(
            branch__barbershop=request.user.barbershop
        )
        qs = apply_month_filter(qs, request)

        data = qs.annotate(day=TruncDay('created_at')).values('day').annotate(
            total_revenue=Sum('price'),
            total_appointments=Count('id'),
        ).order_by('day')

        return Response(list(data))


class AnalyticsByMonthView(APIView):
    """Аналитика по месяцам (только владелец)"""
    permission_classes = [IsOwner]

    def get(self, request):
        qs = Appointment.objects.filter(
            branch__barbershop=request.user.barbershop
        )

        year = request.query_params.get('year')
        if year:
            qs = qs.filter(created_at__year=year)

        data = qs.annotate(month=TruncMonth('created_at')).values('month').annotate(
            total_revenue=Sum('price'),
            total_appointments=Count('id'),
        ).order_by('month')

        return Response(list(data))
