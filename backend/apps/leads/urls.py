from django.urls import path
from . import views

urlpatterns = [
    path('', views.LeadListView.as_view(), name='lead-list'),
    path('/export/csv', views.LeadExportCSVView.as_view(), name='lead-export-csv'),
]
