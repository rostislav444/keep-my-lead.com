from django.urls import path
from . import views

urlpatterns = [
    path('', views.IntegrationListCreateView.as_view(), name='integration-list'),
    path('/<int:pk>', views.IntegrationDetailView.as_view(), name='integration-detail'),
    path('/<int:pk>/sync', views.IntegrationSyncView.as_view(), name='integration-sync'),
]
