from django.urls import path
from . import views
from apps.bot.views import BotConfigView

urlpatterns = [
    path('/bot', BotConfigView.as_view(), name='bot-config'),
    path('/accounts', views.InstagramAccountListView.as_view(), name='account-list'),
    path('/accounts/<int:pk>', views.InstagramAccountDeleteView.as_view(), name='account-delete'),
    path('/accounts/connect', views.InstagramConnectView.as_view(), name='account-connect'),
    path('/accounts/callback', views.InstagramCallbackView.as_view(), name='account-callback'),
    path('/accounts/deauthorize', views.InstagramDeauthorizeView.as_view(), name='account-deauthorize'),
    path('/accounts/data-deletion', views.InstagramDataDeletionView.as_view(), name='account-data-deletion'),
]
