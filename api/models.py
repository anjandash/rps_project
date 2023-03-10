from django.db import models
import string
import random

# generates an unique game code for a 2-player game
def generate_unique_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=6)) 
        if Game.objects.filter(code=code).count() == 0:
            break 
    return code

# Creates the Game model
class Game(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    host_choice = models.CharField(max_length=50, null=True)
    host_play_again = models.BooleanField(default=False)
    host_score = models.IntegerField(default=0)
    guest = models.CharField(max_length=50, null=True)
    guest_choice = models.CharField(max_length=50, null=True)
    guest_play_again = models.BooleanField(default=False)
    guest_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

