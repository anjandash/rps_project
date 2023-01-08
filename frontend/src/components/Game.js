import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/Game.module.css"
import socketIOClient from "socket.io-client";

export default class Game extends Component {
    constructor(props){
        super(props)
        this.state = {
            isHost: false,
            hostChoice: null,
            guestChoice: null,
            
            hostplayAgain: false,
            guestPlayAgain: false,

            verdict: false,
            messageForHost: null,
            messageForGuest: null,
            playDecision: false,
        };
        this.gameCode = this.props.match.params.gameCode;
        this.getGameDetails();
        this.handleLeaveGameButtonPressed = this.handleLeaveGameButtonPressed.bind(this);
        this.handlePlayAgainButtonPressed = this.handlePlayAgainButtonPressed.bind(this);
        this.handleUserChoice = this.handleUserChoice.bind(this);
        this.handleContinueGamePressed = this.handleContinueGamePressed.bind(this);
    }

    componentDidMount() {
        this.intervalId = setInterval(() => {
          this.getScores();
        }, 1000); 
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalId);
    } 

    getGameDetails() {
        fetch("/api/get-game" + "?code=" + this.gameCode)
        .then((response) => {
            if (!response.ok){
                this.props.leaveGameCallback();
                this.props.history.push("/");
            }
            return response.json()
        })
        .then((data) => {
            this.setState({
                isHost: data.is_host,             
            })            

        });
    }

    getScores() {
        fetch("/api/get-game" + "?code=" + this.gameCode)
        .then((response) => {
            if (!response.ok){
                this.props.leaveGameCallback();
                this.props.history.push("/");
            }
            return response.json()
        })
        .then((data) => {
            if (data.host_choice != null && data.guest_choice != null){

                /* rps logic */
                const host_dec = data.host_choice;
                const guest_dec = data.guest_choice;

                const message_loss = "Sorry, you lost!"
                const message_win  = "Yeahhh! You won!"
                const message_draw = "Oh, It's a draw!"

                let message_for_host;
                let message_for_guest;

                if (host_dec == guest_dec){
                    message_for_host = message_draw;
                    message_for_guest = message_draw;
                } else if ((host_dec == "rock" && guest_dec == "paper")) {
                    message_for_host = message_loss;
                    message_for_guest = message_win;                       
                } else if ((host_dec == "paper" && guest_dec == "scissors")) {
                    message_for_host = message_loss;
                    message_for_guest = message_win;    
                } else if ((host_dec == "scissors" && guest_dec == "rock")) {
                    message_for_host = message_loss;
                    message_for_guest = message_win;    
                } else {
                    message_for_host = message_win;
                    message_for_guest = message_loss;                            
                }                  

                this.setState({
                    hostChoice: data.host_choice,
                    guestChoice: data.guest_choice,
                    messageForHost: message_for_host,
                    messageForGuest: message_for_guest,
                    verdict: true,
                });   
            }

            if (data.host_play_again == true || data.guest_play_again == true){
                if (data.host_play_again == true && data.guest_play_again == false){
                    if (this.state.isHost == false){
                        console.log("Hey Guest! Play again?")
                        this.setState({
                            playDecision: true,
                        });
                        
                    }
                } else if (data.host_play_again == false && data.guest_play_again == true) {
                    if (this.state.isHost == true){
                        console.log("Hey Host! Play again?")
                        this.setState({
                            playDecision: true,
                        })
                    }                    
                }
            }
        });
      }        

    handleLeaveGameButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-game", requestOptions).then((response) => {
            this.props.leaveGameCallback();
            this.props.history.push("/");
        });
    }

    handlePlayAgainButtonPressed() {
        let json_data;
        if (this.state.isHost == true){
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_play_again: true,
                guest_play_again: this.state.guestPlayAgain,
            };   
        } else {
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_play_again: this.state.hostplayAgain,
                guest_play_again: true,
            };   
        }

        console.log(json_data)
        const requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json_data),
        };
        fetch("/api/replay-game", requestOptions)
        .then((response) => {
            if (response.ok) {
            console.log("replay update done.");
            return response.json();
            } else {
            console.log("replay update not done.");
            }
        })
        .then((data) => {
            console.log(data);
            this.setState({
            hostChoice: null,
            guestChoice: null,
            verdict: false,
            messageForHost: null,
            messageForGuest: null,
            });
        });
      }

    handleUserChoice(value) {
        console.log("handleUserChoice Pressed with value: " + value)
        console.log(this.gameCode)
        if (this.state.isHost == true){
            this.setState({
                hostChoice: value,
            }, () => {this.fetchData({host_choice: this.state.hostChoice});});
        } else {
            this.setState({
                guestChoice: value,
            }, () => {this.fetchData({guest_choice: this.state.guestChoice});});            
        }
    }

    fetchData(json_data) {
        const requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json_data),
        };
        fetch("/api/play-game", requestOptions)
        .then((response) => {
            if (response.ok){
                console.log("update done.")
                return response.json()
            } else {
                console.log("update not done.")
            }
        })
        .then((data) => {
            console.log(data);
        });
    }

    renderChoices(){
        return(
            <div className={styles.choiceBlock}> 
                <div className={styles.rock} onClick={this.handleUserChoice.bind(this, "rock")}>ROCK</div>
                <div className={styles.paper} onClick={this.handleUserChoice.bind(this, "paper")}>PAPER</div>
                <div className={styles.scissors} onClick={this.handleUserChoice.bind(this, "scissors")}>SCISSORS</div>
            </div>
        );
    }

    renderChoicesDisabled(){
        return(
            <div className={styles.choiceBlock}> 
                <div className={styles.rock} style={{opacity: 0.5}} disabled>ROCK</div>
                <div className={styles.paper} style={{opacity: 0.5}} disabled>PAPER</div>
                <div className={styles.scissors} style={{opacity: 0.5}} disabled>SCISSORS</div>
            </div>
        );
    }    

    renderHostVerdict(){
        return(
            <div>{this.state.messageForHost}</div>
        );
    }

    renderGuestVerdict(){
        return(
            <div>{this.state.messageForGuest}</div>
        );
    }    

    handleContinueGamePressed(){
        let json_data;
        if (this.state.isHost == true){
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_play_again: false,
                guest_play_again: false,
            };   
        } else {
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_play_again: false,
                guest_play_again: false,  
            };   
        }

        console.log(json_data)
        const requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json_data),
        };
        fetch("/api/replay-game", requestOptions)
        .then((response) => {
            if (response.ok) {
            console.log("replay update done.");
            return response.json();
            } else {
            console.log("replay update not done.");
            }
        })
        .then((data) => {
            console.log(data);
            this.setState({
            hostChoice: null,
            guestChoice: null,
            verdict: false,
            messageForHost: null,
            messageForGuest: null,
            playDecision: false,
            hostplayAgain: false,
            guestPlayAgain: false,
            });
        });
    }

    render() {
        if (this.state.playDecision == true){
            return (
                <div>
                    Your friend wants to play once more! Continue?
                    <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleContinueGamePressed}>YES, CONTINUE</div>
                    <br/><br/>
                    <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveGameButtonPressed}>NO, LEAVE GAME</div>                    
                </div>
            );
        }
        return (
            <div className={styles.gameWrapper}>
                <h3>{this.gameCode}</h3>
                <h4>HC: {this.state.hostChoice}</h4>
                <h4>GC: {this.state.guestChoice}</h4>
                <p>Host: {this.state.isHost.toString()}</p>
                <br/>

                <div className={styles.scoreBoard}>
                    <div className={styles.hostScore}>0</div>
                    <div className={styles.scoreDivider}>vs</div>
                    <div className={styles.guestScore}>0</div>
                </div>

                <div className={styles.matchBlock}> 
                    <div className={styles.hostChoice}>{this.state.hostChoice}</div>
                    <div className={styles.divider}>vs</div>
                    <div className={styles.guestChoice}>{this.state.guestChoice}</div>
                </div>   

                {   (this.state.verdict == true && this.state.isHost == true) ? this.renderHostVerdict() : <br/>  }
                {   (this.state.verdict == true && this.state.isHost == false) ? this.renderGuestVerdict() : <br/>  }

                {   this.state.isHost == true ?
                    (this.state.hostChoice == null ? this.renderChoices() : this.renderChoicesDisabled()) : null
                }
                {   this.state.isHost == false ?
                    (this.state.guestChoice == null ? this.renderChoices() : this.renderChoicesDisabled()) : null
                }              

                <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handlePlayAgainButtonPressed}>PLAY AGAIN</div>
                <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveGameButtonPressed}>LEAVE GAME</div>
            </div>
        );
    }
}