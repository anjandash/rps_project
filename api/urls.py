from django.urls import path
from .views import GameView, CreateGameView, GetGame, JoinGame, UserInGame, LeaveGame, PlayGame

urlpatterns = [
    path('game', GameView.as_view()),
    path('create-game', CreateGameView.as_view()),
    path('get-game', GetGame.as_view()),
    path('join-game', JoinGame.as_view()),
    path('user-in-game', UserInGame.as_view()),
    path('leave-game', LeaveGame.as_view()),
    path('play-game', PlayGame.as_view()),
]