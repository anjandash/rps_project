import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/Game.module.css"

export default class Game extends Component {
    constructor(props){
        super(props)
        this.state = {
            isHost: false,
        };
        this.gameCode = this.props.match.params.gameCode
        this.getGameDetails()
        this.handleLeaveRoomButtonPressed = this.handleLeaveRoomButtonPressed.bind(this)
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
                isHost: data.is_host
            })
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

    render() {
        return (
            <div className="gameWrapper">
                <h3>{this.gameCode}</h3>
                <p>Host: {this.state.isHost.toString()}</p>
                <br/>
                <div className={styles.buttonGray} onClick={this.handleLeaveRoomButtonPressed}>LEAVE ROOM</div>
            </div>
        );
    }



}