from django.urls import path
from .views import (
    AnalyticsSummaryView,
    AnalyticsByBranchView,
    AnalyticsByBarberView,
    AnalyticsByDayView,
    AnalyticsByMonthView,
)

urlpatterns = [
    path('analytics/summary/', AnalyticsSummaryView.as_view()),
    path('analytics/by-branch/', AnalyticsByBranchView.as_view()),
    path('analytics/by-barber/', AnalyticsByBarberView.as_view()),
    path('analytics/by-day/', AnalyticsByDayView.as_view()),
    path('analytics/by-month/', AnalyticsByMonthView.as_view()),
]
