from rest_framework import generics
from .models import BotConfig
from .serializers import BotConfigSerializer


class BotConfigView(generics.RetrieveUpdateAPIView):
    serializer_class = BotConfigSerializer

    def get_object(self):
        obj, _ = BotConfig.objects.get_or_create(tenant=self.request.user.tenant)
        return obj
