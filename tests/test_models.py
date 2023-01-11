from django.test import TestCase
from api.models import Game, generate_unique_code


class TestModels(TestCase):
    def setUp(self):
        self.game_object = Game.objects.create(
            host="init_session_key"
        )

    def test_game_code_created(self):
        self.assertIsNotNone(self.game_object.code)
        
    def test_game_code_unique(self):
        game2 = Game.objects.create(
            host='dummy_session_key',
        )
        self.assertNotEqual(self.game_object.code, game2.code)

    def test_host_choice_null(self):
        self.assertIsNone(self.game_object.host_choice)

    def test_guest_choice_null(self):
        self.assertIsNone(self.game_object.host_choice)        

    def test_host_play_again_default_value(self):
        self.assertEqual(self.game_object.guest_play_again, False) 

    def test_guest_play_again_default_value(self):
        self.assertEqual(self.game_object.guest_play_again, False)               

    def test_host_score_default_value(self):
        self.assertEqual(self.game_object.guest_score, 0)

    def test_guest_score_default_value(self):
        self.assertEqual(self.game_object.guest_score, 0)        

    def test_created_at_timestamp(self):
        self.assertIsNotNone(self.game_object.created_at)


    ##  testing generate_unique_code

    def test_generate_unique_code(self):
        code1 = generate_unique_code()
        code2 = generate_unique_code()
        self.assertNotEqual(code1, code2)

    def test_generate_unique_code_uppercase(self):
        code = generate_unique_code()
        self.assertTrue(code.isupper())

    def test_generate_unique_code_alphanumeric(self):
        code = generate_unique_code()
        self.assertTrue(code.isalnum())    

