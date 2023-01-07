import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/Game.module.css"

export default class Game extends Component {
    constructor(props){
        super(props)
        this.state = {
            isHost: false,
            hostChoice: null,
            guestChoice: null,
            hostplayAgain: false,
            guestPlayAgain: false,
        };
        this.gameCode = this.props.match.params.gameCode
        this.getGameDetails()
        this.getScores()
        this.handleLeaveRoomButtonPressed = this.handleLeaveRoomButtonPressed.bind(this)
        // this.handlePlayAgainButtonPressed = this.handlePlayAgainButtonPressed.bind(this)
        this.handleUserChoice = this.handleUserChoice.bind(this)
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
                this.setState({
                    hostChoice: data.host_choice,
                    guestChoice: data.guest_choice,             
                })     
                console.log("clear interval")
                clearInterval(this.intervalId);
            }
        });
      }    

    handleLeaveRoomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-game", requestOptions).then((response) => {
            this.props.leaveGameCallback();
            this.props.history.push("/");
        });
    }

    // handlePlayAgainButtonPressed() {
    //     this.setState({
    //         hostChoice: null,
    //         guestChoice: null,
    //     })
    //     this.forceUpdate();
    // }

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
        // this.getGameDetails()

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

    render() {
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

                {   this.state.isHost == true ?
                    (this.state.hostChoice == null ? this.renderChoices() : this.renderChoicesDisabled()) : null
                }
                {   this.state.isHost == false ?
                    (this.state.guestChoice == null ? this.renderChoices() : this.renderChoicesDisabled()) : null
                }              

                {/* <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handlePlayAgainButtonPressed}>PLAY AGAIN</div> */}
                <div className={`${styles.button} ${styles.leaveButton}`} onClick={this.handleLeaveRoomButtonPressed}>LEAVE GAME</div>
            </div>
        );
    }
}