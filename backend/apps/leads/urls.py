from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.LeadViewSet, basename='lead')

urlpatterns = router.urls
