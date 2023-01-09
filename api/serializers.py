from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'code', 'host', 'guest', 'host_choice', 'host_play_again', 'host_score', 'guest_choice', 'guest_play_again', 'guest_score', 'created_at')

class JoinGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'code', 'host', 'guest', 'host_choice', 'guest_choice', 'created_at')        

class CreateGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'created_at')

class PlayGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('host_choice', 'guest_choice')

class ReplayGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('host_choice', 'host_play_again', 'guest_choice', 'guest_play_again')        