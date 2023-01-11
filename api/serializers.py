from rest_framework import serializers
from .models import Game

# used to show game data attributes status 
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'code', 'host', 'guest', 'host_choice', 'host_play_again', 'host_score', 'guest_choice', 'guest_play_again', 'guest_score', 'created_at')  

# used to create a new game instance, with the following data: id (unique), created_at
class CreateGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'created_at')

# used to enable joining a game, initializes host and guest, optionally initializes host_choice, guest_choice
class JoinGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('id', 'code', 'host', 'guest', 'host_choice', 'guest_choice', 'created_at')              

# used to track and initialize data for game play: host_score, and host_choice for first game
class PlayGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('host_choice', 'host_score', 'guest_choice', 'guest_score')

# used to reset game data: host_score, host_play_again status, and host_choice in game continuation
class RestartGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game 
        fields = ('host_choice', 'host_play_again', 'host_score', 'guest_choice', 'guest_play_again', 'guest_score')        