from django.urls import path
from .views import GameView, GetGame, CreateGameView, JoinGame, UserInGame, LeaveGame, PlayGame, RestartGame

urlpatterns = [
    path('game', GameView.as_view(), name='game'),
    path('get-game', GetGame.as_view(), name='get-game'),    
    path('create-game', CreateGameView.as_view(), name='create-game'),
    path('join-game', JoinGame.as_view(), name='join-game'),
    path('user-in-game', UserInGame.as_view(), name='user-in-game'),
    path('leave-game', LeaveGame.as_view(), name='leave-game'),
    path('play-game', PlayGame.as_view(), name='play-game'),
    path('restart-game', RestartGame.as_view(), name='restart-game'),
]