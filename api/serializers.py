from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'code', 'host', 'created_at')

class CreateGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'created_at')