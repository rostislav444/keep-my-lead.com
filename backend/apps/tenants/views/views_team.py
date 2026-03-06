from rest_framework import mixins, viewsets

from apps.core.permissions import IsOwner
from ..models import User
from ..serializers import TeamMemberSerializer, UserSerializer


class TeamViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsOwner]

    def get_serializer_class(self):
        if self.action == 'list':
            return UserSerializer
        return TeamMemberSerializer

    def get_queryset(self):
        return User.objects.filter(
            tenant=self.request.user.tenant,
            role=User.Role.MANAGER,
        )
