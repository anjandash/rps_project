from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .serializers import GameSerializer, CreateGameSerializer
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
    serializer_class = GameSerializer
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create() 

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            queryset = Game.objects.filter(code=code)
            if len(queryset) > 0: # not queryset.exists()
                self.request.session['game_code'] = code
                return Response({'message': 'Game Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Game Code'}, status=status.HTTP_400_BAD_REQUEST)
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
            if len(queryset) > 0: # not queryset.exists()
                game = queryset[0]
                game.delete()
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)        
    