import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/Game.module.css"
import socketIOClient from "socket.io-client";

export default class ComputerGame extends Component {
    constructor(props){
        super(props)
        this.state = {
            isHost: false,
            hostChoice: null,
            computerChoice: null,
            hostScore: 0,
            computerScore: 0,
            messageForHost: null,
            messageForComputer: null, // not needed
            verdict: false,
        };

        this.gameCode = this.props.match.params.gameCode; // this.gameCode should be set, before calling getGameDetails()
        this.getGameDetails();
        this.handleLeaveGameButtonPressed = this.handleLeaveGameButtonPressed.bind(this);
        this.handlePlayAgainButtonPressed = this.handlePlayAgainButtonPressed.bind(this);
        this.handleUserChoice = this.handleUserChoice.bind(this);
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
        this.setState({
            hostChoice: null,
            computerChoice: null,
            messageForHost: null,
            verdict: false,            
        });
    }

    // reset model and state values appropriately on user choice: rock/paper/scissors
    handleUserChoice(value) {
        console.log("handleUserChoice Pressed with value: " + value)
        console.log(this.gameCode)
        const game_choices = ["rock", "paper", "scissors"];
        const random_index = Math.floor(Math.random() * game_choices.length);
        const comp_choice = game_choices[random_index];

        const host_dec = value;
        const computer_dec = comp_choice;
        const message_loss = "Sorry, you lost!"
        const message_win  = "Yeahhh! You won!"
        const message_draw = "Oh, It's a draw!"

        let host_score;
        let computer_score;
        let message_for_host;

        if (host_dec == computer_dec){
            message_for_host = message_draw;
            host_score = this.state.hostScore;
            computer_score = this.state.computerScore;
        } else if ((host_dec == "rock" && computer_dec == "paper")) {
            message_for_host = message_loss;
            host_score = this.state.hostScore;
            computer_score = this.state.computerScore + 1;                                
        } else if ((host_dec == "paper" && computer_dec == "scissors")) {
            message_for_host = message_loss;
            host_score = this.state.hostScore;
            computer_score = this.state.computerScore + 1;            
        } else if ((host_dec == "scissors" && computer_dec == "rock")) {
            message_for_host = message_loss;
            host_score = this.state.hostScore;
            computer_score = this.state.computerScore + 1;              
        } else {
            message_for_host = message_win;
            host_score = this.state.hostScore + 1;
            computer_score = this.state.computerScore;             
        }     

        if (this.state.isHost == true){
            this.setState({
                hostChoice: value,
                computerChoice: comp_choice,
                hostScore: host_score,
                computerScore: computer_score,
                messageForHost: message_for_host,
                verdict: true,
            });
        }
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

    // render function for displaying selected choices for host
    renderChoicesDisabled(){
        return(
            <div>
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
            </div>
        );
    }    

    // render function for result 
    renderHostResultVerdict(){
        return(
            <div className={styles.verdictText}>{this.state.messageForHost}</div>
        );
    }  


    render() {
        return (
            <div className={styles.gameWrapper}>
                <h3>Game code: {this.gameCode}</h3>
                <h6>
                    Host: <span className={styles.online}>online</span>&nbsp;
                    Computer: <span className={styles.online}>online</span>
                </h6>

                <div className={styles.mainHeadBlock}>
                    <div className={styles.scoreBlock}>
                        <div className={styles.namePlateHost}>{this.state.isHost ? "You" : "Host"}</div>
                        <div className={styles.scoreBoard}>
                            <div className={styles.hostScore}>{this.state.hostScore}</div>
                            <div className={styles.scoreDivider}></div>
                            <div className={styles.guestScore}>{this.state.computerScore}</div>
                        </div>
                        <div className={styles.namePlateGuest}>{this.state.isHost ? "Computer" : "You"}</div>
                    </div>
                </div>

                <div className={styles.centerBlock}>
                    <div className={styles.matchBlock}> 
                        <div className={styles.hostChoice}>{(this.state.hostChoice != null && this.state.computerChoice != null) ? (this.state.isHost == true ? ("You chose " + this.state.hostChoice) : ("Host chose " +  this.state.hostChoice)) : null }</div>
                        <div className={styles.divider}><div className={styles.vsDiv}>vs</div></div>
                        <div className={styles.guestChoice}>{(this.state.hostChoice != null && this.state.computerChoice != null) ? (this.state.isHost == false ? ("You chose " + this.state.computerChoice) : ("Computer chose " +  this.state.computerChoice)) : null }</div>
                    </div>   
                </div>   

                <div className={styles.verdictBlock}>
                    {   (this.state.verdict == true && this.state.isHost == true) ? this.renderHostResultVerdict() : null }
                    {   (this.state.hostChoice == null && this.state.computerChoice == null) ? <div className={styles.verdictText}>Click on ROCK or PAPER or SCISSORS!</div> : null }
                </div>                     
                    {   this.state.isHost == true ? (this.state.hostChoice == null ?  this.renderChoices() : this.renderChoicesDisabled()) : null }           

                <div className={`${styles.button} ${styles.playAgainButton}`} onClick={this.handlePlayAgainButtonPressed}>PLAY AGAIN</div>
                <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveGameButtonPressed}>LEAVE GAME</div>
            </div>
        );
    }
}

