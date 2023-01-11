"""
Rock Paper Scissors
"""

def game_scoring(host_choice, guest_choice, host_score, guest_score):
    """
    desc: implements the main rock-paper-scissor game logic
    """
    if host_choice is not None and guest_choice is not None:
        if host_score is not None and guest_score is not None:                      

            if host_choice == guest_choice:
                _host_score = host_score
                _guest_score = guest_score

            elif host_choice == "rock" and guest_choice == "paper":
                _host_score = host_score
                _guest_score = guest_score + 1

            elif host_choice == "paper" and guest_choice == "scissors":
                _host_score = host_score
                _guest_score = guest_score + 1   

            elif host_choice == "scissors" and guest_choice == "rock":
                _host_score = host_score
                _guest_score = guest_score + 1      

            else:
                _host_score = host_score + 1
                _guest_score = guest_score    

            return _host_score, _guest_score
    return host_score, guest_score