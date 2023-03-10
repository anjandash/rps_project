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

            hostScore: 0,
            guestScore: 0,
            messageForHost: null,
            messageForGuest: null,

            verdict: false,
            playDecision: false,
            guestOffline: true,
        };

        this.gameCode = this.props.match.params.gameCode; // this.gameCode should be set, before calling getGameDetails()
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




    // get game details and check isHost value
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

    // poll for model values
    // TODO: replace with Django Channels/Signals & socketIO
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
            // update verdict messages, scores when game decision reached
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
                    hostScore: data.host_score,
                    guestScore: data.guest_score,
                    messageForHost: message_for_host,
                    messageForGuest: message_for_guest,
                    verdict: true,
                });   
            }

            // update state values if Guest goes offline/online
            console.log(data.host_choice, data.guest_choice, data.host_score, data.guest_score)
            if (data.guest == null){
                this.setState({
                    hostChoice: this.state.hostChoice,
                    guestChoice: null,
                    
                    hostplayAgain: false,
                    guestPlayAgain: false,
                    hostScore: 0,
                    guestScore: 0,
        
                    verdict: false,
                    messageForHost: null,
                    messageForGuest: null,
                    playDecision: false,
                    guestOffline: true,
                });
            } else {
                this.setState({
                    hostChoice: data.host_choice,
                    guestChoice: data.guest_choice,
                    hostScore: data.host_score,
                    guestScore: data.guest_score,
                    guestOffline: false,
                });                
            }

            // update playDecison state value -- to trigger "game continue" prompt
            if (data.host_play_again == true && data.guest_play_again == false){
                if (this.state.isHost == false){
                    this.setState({
                        playDecision: true,
                    });
                }
            } else if (data.host_play_again == false && data.guest_play_again == true) {
                if (this.state.isHost == true){
                    this.setState({
                        playDecision: true,
                    })
                }                    
            }
        });
    }     


    // ******************************************** //
    // ********** handle DOM/user actions ********* //
    // ******************************************** //

    // reset game status with callback, return to home page
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

    // reset model and state values appropriately at replay
    // TODO: streamline
    handlePlayAgainButtonPressed() {
        let json_data;
        if (this.state.isHost == true){
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_score: this.state.hostScore,
                guest_score: this.state.guestScore,
                host_play_again: true,
                guest_play_again: this.state.guestPlayAgain,
            };   
        } else {
            json_data = {
                host_choice: null,
                guest_choice: null,
                host_score: this.state.hostScore,
                guest_score: this.state.guestScore,
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
        fetch("/api/restart-game", requestOptions)
        .then((response) => {
            if (response.ok) {
            console.log("restart update done.");
            return response.json();
            } else {
            console.log("restart update not done.");
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

    // reset model and state values appropriately at replay accept
    // TODO: streamline
    handleContinueGamePressed(){
        let json_data;
        if (this.state.isHost == true){
            json_data = {
                host_choice: null,
                guest_choice: this.state.guestChoice,
                host_play_again: false,
                guest_play_again: false,
            };   
        } else {
            json_data = {
                host_choice: this.state.hostChoice,
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
        fetch("/api/restart-game", requestOptions)
        .then((response) => {
            if (response.ok) {
            console.log("restart update done.");
            return response.json();
            } else {
            console.log("restart update not done.");
            }
        })
        .then((data) => {
            console.log(data);
            this.setState({
                hostChoice: json_data.host_choice,
                guestChoice: json_data.guest_choice,
                verdict: false,
                messageForHost: null,
                messageForGuest: null,
                playDecision: false,
                hostplayAgain: false,
                guestPlayAgain: false,
            });
        });
    }    

    // reset model and state values appropriately on user choice: rock/paper/scissors
    handleUserChoice(value) {
        console.log("handleUserChoice Pressed with value: " + value)
        console.log(this.gameCode)
        if (this.state.isHost == true){
            this.setState({
                hostChoice: value,
            }, () => {this.fetchData({host_choice: this.state.hostChoice, host_score: this.state.hostScore, guest_score: this.state.guestScore});});
        } else {
            this.setState({
                guestChoice: value,
            }, () => {this.fetchData({guest_choice: this.state.guestChoice, host_score: this.state.hostScore, guest_score: this.state.guestScore});});            
        }
    }    

    // helper for handleUserChoice
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


    // ******************************************** //
    // ************* render functions ************* //
    // ******************************************** //

    // render function to display choices
    renderChoices(){
        return(
            <div className={styles.wrapBlock}>
            <div className={styles.choiceBlock}> 
                <div className={`${styles.rock} ${styles.choice}`} onClick={this.handleUserChoice.bind(this, "rock")}><div className={styles.rockChild}></div></div>
                <div className={`${styles.paper} ${styles.choice}`} onClick={this.handleUserChoice.bind(this, "paper")}><div className={styles.paperChild}></div></div>
                <div className={`${styles.scissors} ${styles.choice}`} onClick={this.handleUserChoice.bind(this, "scissors")}><div className={styles.scissorsChild}></div></div>
            </div>
            </div>
        );
    }

    // render function for displaying selected choices for host or guest
    renderChoicesDisabled(){
        return(
            <div>
            {this.state.isHost ? 
                <div className={styles.wrapBlock}>
                <div className={styles.choiceBlock}> 
                    {this.state.hostChoice == "rock" ? 
                        <div className={`${styles.rock} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.rockChild}></div></div> :
                        <div className={`${styles.rock}`} style={{opacity: 0.5}} disabled><div className={styles.rockChild}></div></div> 
                    }
                    {this.state.hostChoice == "paper" ?                 
                        <div className={`${styles.paper} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.paperChild}></div></div> :
                        <div className={`${styles.paper}`} style={{opacity: 0.5}} disabled><div className={styles.paperChild}></div></div>
                    }
                    {this.state.hostChoice == "scissors" ?                   
                        <div className={`${styles.scissors} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.scissorsChild}></div></div> :
                        <div className={`${styles.scissors}`} style={{opacity: 0.5}} disabled><div className={styles.scissorsChild}></div></div> 
                    }
                </div>
                </div>
            : 
                <div className={styles.wrapBlock}>
                <div className={styles.choiceBlock}> 
                    {this.state.guestChoice == "rock" ? 
                        <div className={`${styles.rock} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.rockChild}></div></div> :
                        <div className={`${styles.rock}`} style={{opacity: 0.5}} disabled><div className={styles.rockChild}></div></div> 
                    }
                    {this.state.guestChoice == "paper" ?                 
                        <div className={`${styles.paper} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.paperChild}></div></div> :
                        <div className={`${styles.paper}`} style={{opacity: 0.5}} disabled><div className={styles.paperChild}></div></div>
                    }
                    {this.state.guestChoice == "scissors" ?                   
                        <div className={`${styles.scissors} ${styles.selected}`} style={{opacity: 1}} disabled><div className={styles.scissorsChild}></div></div> :
                        <div className={`${styles.scissors}`} style={{opacity: 0.5}} disabled><div className={styles.scissorsChild}></div></div> 
                    }
                </div>
                </div>            
            }
            </div>
        );
    }    

    // render function for host result 
    renderHostResultVerdict(){
        return(
            <div className={styles.verdictText}>{this.state.messageForHost}</div>
        );
    }

    // render function for guest result 
    renderGuestResultVerdict(){
        return(
            <div className={styles.verdictText}>{this.state.messageForGuest}</div>
        );
    }    



    render() {
        if (this.state.playDecision == true){
            return (
                <div className={styles.continueText}>
                    Your opponent wants to play once more!
                    <br/><br/>
                    <div className={`${styles.button} ${styles.yesButton}`} onClick={this.handleContinueGamePressed}>
                        YES, CONTINUE
                    </div>
                    <br/><br/>
                    <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveGameButtonPressed}>
                        LEAVE GAME
                    </div>                    
                </div>
            );
        }
        return (
            <div className={styles.gameWrapper}>
                <h3>Game code: {this.gameCode}</h3>
                <h6>
                    Host: <span className={styles.online}>online</span>&nbsp;
                    Guest: {this.state.guestOffline == true ? 
                        <span className={styles.offline}>offline</span> : 
                        <span className={styles.online}>online</span>}
                </h6>

                {/* 
                <h4>HC: {this.state.hostChoice}</h4>
                <h4>GC: {this.state.guestChoice}</h4>
                <p>Host: {this.state.isHost.toString()}</p>
                <br/> 
                */}

                <div className={styles.mainHeadBlock}>
                    <div className={styles.scoreBlock}>
                        <div className={styles.namePlateHost}>{this.state.isHost ? "You" : "Host"}</div>
                        <div className={styles.scoreBoard}>
                            <div className={styles.hostScore}>{this.state.hostScore}</div>
                            <div className={styles.scoreDivider}></div>
                            <div className={styles.guestScore}>{this.state.guestScore}</div>
                        </div>
                        <div className={styles.namePlateGuest}>{this.state.isHost ? "Guest" : "You"}</div>
                    </div>
                </div>

                <div className={styles.centerBlock}>
                    <div className={styles.matchBlock}> 
                        <div className={styles.hostChoice}>{(this.state.hostChoice != null && this.state.guestChoice != null) ? (this.state.isHost == true ? ("You chose " + this.state.hostChoice) : ("Host chose " +  this.state.hostChoice)) : null }</div>
                        <div className={styles.divider}><div className={styles.vsDiv}>vs</div></div>
                        <div className={styles.guestChoice}>{(this.state.hostChoice != null && this.state.guestChoice != null) ? (this.state.isHost == false ? ("You chose " + this.state.guestChoice) : ("Guest chose " +  this.state.guestChoice)) : null }</div>
                    </div>   
                </div>   

                <div className={styles.verdictBlock}>
                    {   (this.state.verdict == true && this.state.isHost == true) ? this.renderHostResultVerdict() : null }
                    {   (this.state.verdict == true && this.state.isHost == false) ? this.renderGuestResultVerdict() : null  }
                    {   (this.state.hostChoice == null && this.state.guestChoice == null) ? <div className={styles.verdictText}>Click on ROCK or PAPER or SCISSORS!</div> : null }
                    {   ((this.state.hostChoice == null && this.state.guestChoice != null) && (this.state.verdict == false)) ? (this.state.isHost == false ? <div className={styles.verdictText}>Waiting for host's choice ...</div> : <div className={styles.verdictText}>Guest has already chosen! Waiting for your choice ...</div>) : null }
                    {   ((this.state.hostChoice != null && this.state.guestChoice == null) && (this.state.verdict == false)) ? (this.state.isHost == true ? <div className={styles.verdictText}>Waiting for guest's choice ...</div> : <div className={styles.verdictText}>Host has already chosen! Waiting for your choice ...</div>) : null }
                </div>                     
                    {   this.state.isHost == true ? (this.state.hostChoice == null ?  this.renderChoices() : this.renderChoicesDisabled()) : null }
                    {   this.state.isHost == false ? (this.state.guestChoice == null ? this.renderChoices() : this.renderChoicesDisabled()) : null }              

                <div className={`${styles.button} ${styles.playAgainButton}`} onClick={this.handlePlayAgainButtonPressed}>PLAY AGAIN</div>
                <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveGameButtonPressed}>LEAVE GAME</div>
            </div>
        );
    }
}

