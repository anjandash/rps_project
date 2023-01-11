from django.test import TestCase, Client
from django.urls import reverse
from api.models import Game
from api.serializers import PlayGameSerializer, RestartGameSerializer
import json

class TestViews(TestCase):

    def setUp(self):
        self.client = Client()
        self.game_url = reverse('game')
        self.get_game_url = reverse('get-game')
        self.create_game_url = reverse('create-game')
        self.join_game_url = reverse('join-game')
        self.user_in_game_url = reverse('user-in-game')
        self.leave_game_url = reverse('leave-game')
        self.play_game_url = reverse('play-game')

        self.game_object = Game.objects.create(
            host="init_session_key"
        )
        self.client.session['game_code'] = self.game_object.code

    ################### 
    #### test_game ####
    ################### 

    def test_game_GET(self):
        response = self.client.get(self.game_url)
        self.assertEquals(response.status_code, 200)

    ################### 
    ## test_get_game ##
    ###################         

    def test_get_game_GET_valid_code(self):
        response = self.client.get(self.get_game_url, {
            "code": self.game_object.code
        })
        self.assertEquals(response.status_code, 200)

    def test_get_game_GET_invalid_code(self):
        response = self.client.get(self.get_game_url, {
            "code": "DUMMY"
        })
        self.assertEquals(response.status_code, 404)   

    def test_get_game_GET_missing_code(self):
        response = self.client.get(self.get_game_url)
        self.assertEquals(response.status_code, 400)  

    #################### 
    # test_create_game #
    #################### 

    def test_create_game_POST_create(self):
        response = self.client.post(self.create_game_url)
        self.assertEquals(response.status_code, 201)


    def test_create_game_POST_exists(self):
        Game.objects.create(host=self.client.session.session_key)
        response = self.client.post(self.create_game_url)
        self.assertEquals(response.status_code, 200)     


    #################### 
    ## test_join_game ##
    #################### 

    def test_join_game_POST_no_code(self):
        response = self.client.post(self.join_game_url)
        self.assertEquals(response.status_code, 400)

    ##################### 
    # test_user_in_game #
    #####################

    def test_user_in_game_GET(self):
        response = self.client.get(self.user_in_game_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content)['user_session_id'], self.client.session.session_key)

    ##################### 
    ## test_leave_game ##
    #####################

    def test_leave_as_host(self):
        host_session = self.client.session.session_key
        self.client.post(self.create_game_url)
        self.client.post(self.leave_game_url)

        self.assertFalse(Game.objects.filter(host=host_session).exists())
        self.assertEqual(self.client.session.get('game_code'), None)        

    def test_leave_as_guest(self):
        self.client.post(self.join_game_url)
        self.client.post(self.leave_game_url)
        self.assertEqual(self.client.session.get('game_code'), None)            

    #################### 
    ## test_play_game ##
    ####################   

    def test_play_game_PATCH_valid_data(self):
        self.client.post(self.create_game_url)
        self.client.post(self.join_game_url)
        
        data = {'host_choice': 'rock', 'guest_choice': 'scissors', 'host_score': 0, 'guest_score': 0}
        serializer = PlayGameSerializer(data=data)
        serializer.is_valid()
        payload = serializer.validated_data
        response = self.client.patch(self.play_game_url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)    

    ####################### 
    ## test_restart_game ##
    #######################        

    def test_restart_game_PATCH_valid_data(self):
        self.client.post(self.create_game_url)
        self.client.post(self.join_game_url)
        
        data = {'host_choice': 'rock', 'guest_choice': 'scissors', 'host_score': 0, 'guest_score': 0, 'host_play_again': True, 'guest_play_again': True}
        serializer = PlayGameSerializer(data=data)
        serializer.is_valid()
        payload = serializer.validated_data
        response = self.client.patch(self.play_game_url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)            








