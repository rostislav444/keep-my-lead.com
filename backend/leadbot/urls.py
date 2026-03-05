from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth', include('apps.tenants.urls')),
    path('api/catalog', include('apps.catalog.urls')),
    path('api/dialogs', include('apps.dialogs.urls')),
    path('api/leads', include('apps.leads.urls')),
    path('api/settings', include('apps.accounts.urls')),
    path('api/webhooks', include('apps.webhooks.urls')),
    path('api/integrations', include('apps.mappers.urls')),
]
