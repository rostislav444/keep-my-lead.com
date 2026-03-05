from django.urls import path
from . import views

urlpatterns = [
    path('/instagram', views.InstagramWebhookView.as_view(), name='instagram-webhook'),
]
