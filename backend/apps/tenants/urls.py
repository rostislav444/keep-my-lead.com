from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('team', views.TeamViewSet, basename='team')
router.register('telegram', views.TelegramViewSet, basename='telegram')

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.MeView.as_view(), name='me'),
    path('onboarding/', views.OnboardingView.as_view(), name='onboarding'),
    path('instagram/', views.InstagramLoginRedirectView.as_view(), name='instagram-login'),
    path('instagram/callback/', views.InstagramLoginCallbackView.as_view(), name='instagram-login-callback'),
    path('', include(router.urls)),
]
