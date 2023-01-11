from django.test import SimpleTestCase
from django.urls import reverse, resolve
from api.views import GameView, GetGame, CreateGameView, JoinGame, UserInGame, LeaveGame, PlayGame, RestartGame

class TestUrls(SimpleTestCase):
    def test_game(self):
        url = reverse('game')
        self.assertEquals(resolve(url).func.view_class, GameView)

    def test_get_game(self):
        url = reverse('get-game')
        self.assertEquals(resolve(url).func.view_class, GetGame)   

    def test_create_game(self):
        url = reverse('create-game')
        self.assertEquals(resolve(url).func.view_class, CreateGameView)

    def test_join_game(self):
        url = reverse('join-game')
        self.assertEquals(resolve(url).func.view_class, JoinGame)     

    def test_user_in_game(self):
        url = reverse('user-in-game')
        self.assertEquals(resolve(url).func.view_class, UserInGame)

    def test_leave_game(self):
        url = reverse('leave-game')
        self.assertEquals(resolve(url).func.view_class, LeaveGame)

    def test_play_game(self):
        url = reverse('play-game')
        self.assertEquals(resolve(url).func.view_class, PlayGame)    

    def test_restart_game(self):
        url = reverse('restart-game')
        self.assertEquals(resolve(url).func.view_class, RestartGame)                                                              

