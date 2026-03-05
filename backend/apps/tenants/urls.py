from django.urls import path
from . import views

urlpatterns = [
    path('/register', views.RegisterView.as_view(), name='register'),
    path('/login', views.LoginView.as_view(), name='login'),
    path('/logout', views.LogoutView.as_view(), name='logout'),
    path('/me', views.MeView.as_view(), name='me'),
    path('/team', views.TeamListCreateView.as_view(), name='team-list'),
    path('/team/<int:pk>', views.TeamDeleteView.as_view(), name='team-delete'),
    path('/telegram/link', views.TelegramLinkView.as_view(), name='telegram-link'),
    path('/telegram/webhook', views.TelegramWebhookView.as_view(), name='telegram-webhook'),
]
