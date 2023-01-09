from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .serializers import GameSerializer, JoinGameSerializer, CreateGameSerializer, PlayGameSerializer, ReplayGameSerializer
from .models import Game

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response 


# Create your views here.
def main(request):
    return HttpResponse("<h1>Hello world!</h1>")

class GameView(generics.ListAPIView): 
    queryset = Game.objects.all() 
    serializer_class = GameSerializer


class GetGame(APIView):
    serializer_class = GameSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            queryset = Game.objects.filter(code=code)
            if len(queryset) > 0: # not queryset.exists()
                data = GameSerializer(queryset[0]).data 
                data['is_host'] = self.request.session.session_key == queryset[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Game not found": "Invalid Game Code."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Code Parameter not found in Request."}, status=status.HTTP_400_BAD_REQUEST)


class JoinGame(APIView):
    serializer_class = JoinGameSerializer
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
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


class CreateGameView(APIView):
    serializer_class = CreateGameSerializer

    def post(self, request, format=None):
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


class UserInGame(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {'code': self.request.session.get('game_code')}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveGame(APIView):
    def post(self, request, format=None):
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
                    game.save(update_fields=['guest'])             
        return Response({'Message': 'The Game was abandoned!'}, status=status.HTTP_200_OK)        
    

class PlayGame(APIView):
    serializer_class = PlayGameSerializer

    def patch(self, request, format=None):
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

                # game logic 
                _host_choice  = game.host_choice
                _guest_choice = game.guest_choice
                _host_score   = game.host_score
                _guest_score  = game.guest_score

                if _host_choice is not None and _guest_choice is not None:
                    if _host_score is not None and _guest_score is not None:                      

                        if _host_choice == _guest_choice:
                            game.host_score = _host_score
                            game.guest_score = _guest_score

                        elif _host_choice == "rock" and _guest_choice == "paper":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1

                        elif _host_choice == "paper" and _guest_choice == "scissors":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1   

                        elif _host_choice == "scissors" and _guest_choice == "rock":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1      

                        else:
                            game.host_score = _host_score + 1
                            game.guest_score = _guest_score                             

                game.save(update_fields=['host_choice', 'host_score', 'guest_choice', 'guest_score'])

                return Response(PlayGameSerializer(game).data, status=status.HTTP_200_OK)            
        return Response({'Bad Request': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class ReplayGame(APIView):
    serializer_class = ReplayGameSerializer

    def patch(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():          
            code = self.request.session.get('game_code')

            queryset = Game.objects.filter(code=code)
            if not queryset.exists(): 
                return Response({'Bad Request': 'Invalid Game Code'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                game = queryset[0]
                game.host_choice = serializer.data.get('host_choice')
                game.host_play_again = serializer.data.get('host_play_again')
                game.guest_choice = serializer.data.get('guest_choice')
                game.guest_play_again = serializer.data.get('guest_play_again')

                if serializer.data.get('host_score') is not None:
                    game.host_score = int(serializer.data.get('host_score'))
                if serializer.data.get('guest_score') is not None:
                    game.guest_score = int(serializer.data.get('guest_score'))              

                # game logic 
                _host_choice  = game.host_choice
                _guest_choice = game.guest_choice
                _host_score   = game.host_score
                _guest_score  = game.guest_score

                if _host_choice is not None and _guest_choice is not None:
                    if _host_score is not None and _guest_score is not None:                      

                        if _host_choice == _guest_choice:
                            game.host_score = _host_score
                            game.guest_score = _guest_score

                        elif _host_choice == "rock" and _guest_choice == "paper":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1

                        elif _host_choice == "paper" and _guest_choice == "scissors":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1   

                        elif _host_choice == "scissors" and _guest_choice == "rock":
                            game.host_score = _host_score
                            game.guest_score = _guest_score + 1      

                        else:
                            game.host_score = _host_score + 1
                            game.guest_score = _guest_score                                                                                      

                game.save(update_fields=['host_choice', 'host_play_again', 'host_score', 'guest_choice', 'guest_play_again', 'guest_score'])

                return Response(PlayGameSerializer(game).data, status=status.HTTP_200_OK)            
        return Response({'Bad Request': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)        
