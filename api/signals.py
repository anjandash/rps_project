# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Game
# import json
# import socketio

# socket = socketio.Server()

# # Set up web socket connection using Socket.io
# @receiver(post_save, sender=Game)
# def send_host_replay_update(sender, instance, **kwargs):
#     # Send message through web socket connection
#     socket.send(json.dumps({'host_play_again': instance.host_play_again}))

# # Set up web socket connection using Socket.io
# @receiver(post_save, sender=Game)
# def send_guest_replay_update(sender, instance, **kwargs):
#     # Send message through web socket connection
#     socket.send(json.dumps({'guest_play_again': instance.guest_play_again}))