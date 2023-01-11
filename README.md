# Rock Paper Scissors: The Game
### Dual-player Online Game 

Welcome to the Rock Paper Scissors game developed with Django and React! <br/>This game allows you to play the classic game of Rock Paper Scissors against other user(s) in real-time.
The backend of the game is built using the Django framework, providing a robust API for managing games. The frontend is built using React, providing a nice and user-friendly interface for playing the game.

It's a simple two-player game, where users can play rock-paper-scissors online in real-time!

***To start playing, simply create a new game or join an existing one.***<br/> 
If you have created a new game, you can share the generated game code with another friend to start the game, if you already have a code shared by your friend, proceed to join the game.

You will then be able to see the current state of the game and submit your play choice. <br/>
Once both players have submitted their choices, the verdict will be determined and displayed on the screen, and the scoreBoard will update accordingly. The game also provides the possibility to play further rounds of the game or leave the game, so you can play just as many times as you like.

We hope you enjoy playing Rock Paper Scissors! <br/>
If you have any questions or feedback, please don't hesitate to email me at: anjan8@gmail.com.

<hr style="height: 1px;"> 

### Try the game online!

> The online version of the game is available at: http://ec2-3-84-44-18.compute-1.amazonaws.com:8000 <br/>
Make sure to have the port number (8000) at the end of the url.

> Or else, simply go to: https://bit.ly/rps_game <br/>
> *Share this link with your friends, create a game, and play together!*

<hr style="height: 1px;"> 

### Try the game on your local machine
In order to run the game on your local machine, you will need to have a web server running, along with Python Django package installed. You will also need npm to run the frontend. 

Head to the terminal on your machine and run the following:<br/>

    Step 1: `mkdir rps`
    Step 2: `cd rps`
    Step 3: `virtualenv rps_env`
    Step 4: `git clone https://github.com/anjandash/rps_project.git`
    Step 5: `source rps_env/bin/activate`
    Step 6: `cd rps_project`
    Step 7: `python3 -m pip install -r requirements.txt`

After the setup is complete, it's time to run the Django server:

    Step 8: `python3 manage.py makemigrations`
    Step 9: `python3 manage.py migrate`
    Step 10: `python3 manage.py collectstatic`
    Step 11: `python3 manage.py runserver`

And voilà, your app should be running on your local machine, at this address: `http://127.0.0.1:8000` <br/>
*Run the game with Docker* [Coming soon!]
<br/>
***
***

## Backend Docs

The Rock Paper Scissors API allows users to play the classic game of Rock Paper Scissors against another online opponent (with the shared game code).

### API Routes
- `GET` `/api/game`: Retrieve a list of all available games.
- `GET` `/api/get-game/`: Retrieve the details of a specific game.
- `POST` `/api/create-game`: Create a new game.
- `POST` `/api/join-game`: Join an existing game.
- `GET`  `/api/user-in-game`: Retrieve the game details of the current game.
- `POST` `/api/leave-game`: Leave the game that the user is currently in.
- `PATCH` `/api/play-game`: Submit a play choice (rock, paper, or scissors) for the current game.
- `PATCH` `/api/restart-game`: Replay another round in the current game.

<hr style="height: 1px;"> 

### Create a Game
Create a new game by sending a `POST` request to `/api/create-game`. <br/>
The request may not include any data, as game_code is automatically assigned. 

<hr style="height: 1px;"> 

### Join a Game
Join an existing game by sending a `POST` request to `/api/join-game/`. <br/> 
The request must include a valid game_code to join the game. <br/> 
If game_code is not valid, or no game_code is passed a `HTTP_400_BAD_REQUEST` is sent back. 

<hr style="height: 1px;"> 

### Leave a Game
Leave the game that the user is currently in by sending a `POST` request to `/api/leave-game/`.<br/> 
The game_code stored in the session is used to terminate the game.

<hr style="height: 1px;"> 

### Play the Game
Submit a choice (rock/paper/scissors) for current game by sending a `POST` request to `/api/play-game/`. <br/> 
The request should include a JSON object with a combination the following properties / state values: ***host_choice***, ***guest_choice***, ***host_score***, ***guest_score***

<hr style="height: 1px;"> 

### Restart Game
Reset the game that the user is currently in, by sending a `POST` request to `/api/restart-game/` and resetting all state values, except the current scores.

<hr style="height: 1px;"> 

### Game Result
Game result will be based on the following rule:

 - ***Rock*** beats ***Scissors***
 - ***Scissors*** beats ***Paper***
 - ***Paper*** beats ***Rock***
 - In case both player play same choice it will be considered as a draw


<br/>
***
***


## Frontend Docs

This frontend is built using React and it allows users to play the classic game of Rock Paper Scissors against other users.

<hr style="height: 3px;"> 

### Components

The frontend is composed of several components, each with a specific responsibility:

- `App`: The top-level component that renders the other components.
- `HomePage`: The main landing page that displays the options to enter/create a game.
- `JoinGamePage`: A UI page with an input form for joining an existing game.
- `CreateGamePage`: An UI page to select what type of game to create.
- `Game`: The Game UI of the Rock Paper Scissors game, containing the frontend logic. It manages the current state of the game, including the player choices, winners, online/offline status, and also buttons for submitting the player's choices, replaying another round of the game, and leaving the game.

<hr style="height: 3px;"> 

### API calls

The frontend triggers the following actions:
- `HomePage` *:userInGame => Send a request to determine user is in a game.*
- `JoinGamePage` *:joinGame => Send a request to join an existing game.*
- `CreateGamePage` *:createGame => Send a request to create a new game.*
- `Game` *:getGame => Send a request to get the status of model fields.*
- `Game` *:playGame => Send a request to play the game with the user choice.*
- `Game` *:restartGame => Send a request to reset the game, and prompt players to continue.*
- `Game` *:leaveGame => Send a request to leave the current game.*

<hr style="height: 3px;"> 

### States

The main frontend logic is implemented in the Game component, which manages the game. The Game component keeps track of the following states:

<hr style="height: 1px;"> 

- **is_host**: Whether the current player is a host.
- **guestOffline**: Whether the guest is online/offline.
- **verdict**: Whether game decision (verdict) is reached.
- **playDecision**: Whether both players agreed to continue the game.
<hr style="height: 1px;"> 

- **hostChoice**: The selected play choice (rock/paper/scissor/null) for host.
- **hostScore**: The score of the host for the current game.
- **messageForHost**: Game decision message for the host UI. 
- **hostplayAgain**: Whether the host wants to play again.
<hr style="height: 1px;"> 

- **guestChoice**: The selected play choice (rock/paper/scissor/null) for guest.
- **guestScore**: The score of the guest for the current game.
- **messageForGuest**: Game decision message for the guest UI.
- **guestPlayAgain**: Whether the guest wants to play again.

<hr style="height: 3px;"> 