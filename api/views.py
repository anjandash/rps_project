from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics
from .serializers import GameSerializer
from .models import Game

# Create your views here.
def main(request):
    return HttpResponse("<h1>Hello world!</h1>")

class GameView(generics.ListAPIView):
    queryset = Game.objects.all() 
    serializer_class = GameSerializer