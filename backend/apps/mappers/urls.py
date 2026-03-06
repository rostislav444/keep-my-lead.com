from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.IntegrationViewSet, basename='integration')

urlpatterns = router.urls
