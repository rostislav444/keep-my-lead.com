from django.urls import path
from . import views

urlpatterns = [
    path('', views.DialogListView.as_view(), name='dialog-list'),
    path('/<int:pk>', views.DialogDetailView.as_view(), name='dialog-detail'),
    path('/<int:pk>/handoff', views.DialogHandoffView.as_view(), name='dialog-handoff'),
    path('/<int:pk>/return-to-bot', views.DialogReturnToBotView.as_view(), name='dialog-return'),
    path('/<int:pk>/send', views.DialogSendMessageView.as_view(), name='dialog-send'),
]
