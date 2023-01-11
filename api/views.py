from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .serializers import GameSerializer, CreateGameSerializer, JoinGameSerializer, PlayGameSerializer, RestartGameSerializer
from .models import Game
from .game import game_scoring

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response 


class GameView(generics.ListAPIView): 
    queryset = Game.objects.all() 
    serializer_class = GameSerializer


class GetGame(APIView):
    serializer_class = GameSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        """
        desc: handles a GET request with a game code and returns the `is_host` status for the game
        """
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            queryset = Game.objects.filter(code=code)
            if queryset.exists():
                data = GameSerializer(queryset[0]).data 
                data['is_host'] = self.request.session.session_key == queryset[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Game not found": "Invalid Game Code."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Code Parameter not found in Request."}, status=status.HTTP_400_BAD_REQUEST)


class CreateGameView(APIView):
    serializer_class = CreateGameSerializer

    def post(self, request, format=None):
        """
        desc: creates a new game, initiates host session key, and assigns game_code in session variables
        returns: response_created if game is created and response_ok if game is in session
        """
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            host = self.request.session.session_key
            queryset = Game.objects.filter(host=host)

            if not queryset.exists(): 
                game = Game(host=host)
                game.save()
                self.request.session['game_code'] = game.code
                return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)
            else:
                game = queryset[0]
                game.save()
                self.request.session['game_code'] = game.code
                return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)


class JoinGame(APIView):
    serializer_class = JoinGameSerializer
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        """
        desc: joins a game, initiates guest session key, and assigns game_code in session variables
        returns: response_ok if game is joined, bad_request if game is in session between 2 players
        """
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            queryset = Game.objects.filter(code=code)
            if queryset.exists():
                game = queryset[0]
                if game.guest is None:
                    game.guest = self.request.session.session_key
                    game.save(update_fields=['guest'])
                else:
                    return Response({'message': 'Sorry! Another player joined this game!'}, status=status.HTTP_400_BAD_REQUEST)
                
                self.request.session['game_code'] = code
                return Response({'message': 'Game Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Game Code!'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid request data, did not find a game code.'}, status=status.HTTP_400_BAD_REQUEST)               


class UserInGame(APIView):
    def get(self, request, format=None):
        """
        desc: returns JSON format game code and session key for the online user --- for debugging etc.
        """
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {'code': self.request.session.get('game_code'), 'user_session_id': self.request.session.session_key}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveGame(APIView):
    def post(self, request, format=None):
        """
        desc: handles game exit, it terminates the game if host leaves, it resets the game & removes guest if guest leaves
        """
        if 'game_code' in self.request.session:
            self.request.session.pop('game_code')

            host_id  = self.request.session.session_key
            queryset = Game.objects.filter(host=host_id)
            if queryset.exists():
                game = queryset[0]
                game.delete()
            else:
                guest_id = self.request.session.session_key
                queryset = Game.objects.filter(guest=guest_id)
                if queryset.exists():
                    game = queryset[0]   
                    game.guest = None
                    game.host_choice = None 
                    game.guest_choice = None 
                    game.host_score = 0 
                    game.guest_score = 0
                    game.host_play_again = False
                    game.guest_play_again = False
                    game.save(update_fields=['guest', 'host_choice', 'guest_choice', 'host_score', 'guest_score', 'host_play_again', 'guest_play_again']) 
                    
                    return Response({'message': 'Guest left the game!'}, status=status.HTTP_200_OK)                
        return Response({'message': 'The Game was terminated by the host!'}, status=status.HTTP_200_OK)        
    

class PlayGame(APIView):
    serializer_class = PlayGameSerializer

    def patch(self, request, format=None):
        """
        desc: handles game play, updates host/guest choices and scores parallely on selection
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():          
            code = self.request.session.get('game_code')

            queryset = Game.objects.filter(code=code)
            if not queryset.exists(): 
                return Response({'Bad Request': 'Invalid Game Code'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                game = queryset[0]
                if serializer.data.get('host_choice') is not None:
                    game.host_choice = str(serializer.data.get('host_choice'))
                if serializer.data.get('guest_choice') is not None:
                    game.guest_choice = str(serializer.data.get('guest_choice'))
                if serializer.data.get('host_score') is not None:
                    game.host_score = int(serializer.data.get('host_score'))
                if serializer.data.get('guest_score') is not None:
                    game.guest_score = int(serializer.data.get('guest_score'))

                game.host_score, game.guest_score = game_scoring(game.host_choice, game.guest_choice, game.host_score, game.guest_score)     
                game.save(update_fields=['host_choice', 'host_score', 'guest_choice', 'guest_score'])

                return Response(PlayGameSerializer(game).data, status=status.HTTP_200_OK)            
        return Response({'Bad Request': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class RestartGame(APIView):
    serializer_class = RestartGameSerializer

    def patch(self, request, format=None):
        """
        desc: handles restart/replay game request and appropriately resets model fields, including live scores
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():          
            code = self.request.session.get('game_code')

            queryset = Game.objects.filter(code=code)
            if not queryset.exists(): 
                return Response({'Bad Request': 'Invalid Game Code'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                game = queryset[0]

                ## here the following values should be reset for a new game
                game.host_choice = serializer.data.get('host_choice')               
                game.host_play_again = serializer.data.get('host_play_again')           
                game.guest_choice = serializer.data.get('guest_choice')                        
                game.guest_play_again = serializer.data.get('guest_play_again')

                if serializer.data.get('host_score') is not None:
                    game.host_score = int(serializer.data.get('host_score'))
                if serializer.data.get('guest_score') is not None:
                    game.guest_score = int(serializer.data.get('guest_score'))              

                game.host_score, game.guest_score = game_scoring(game.host_choice, game.guest_choice, game.host_score, game.guest_score)     
                game.save(update_fields=['host_choice', 'host_play_again', 'host_score', 'guest_choice', 'guest_play_again', 'guest_score'])

                return Response(RestartGameSerializer(game).data, status=status.HTTP_200_OK)            
        return Response({'Bad Request': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)        
