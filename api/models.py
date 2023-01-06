from django.db import models
import string
import random

# generates an unique code for a 2-player game
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
    created_at = models.DateTimeField(auto_now_add=True)

