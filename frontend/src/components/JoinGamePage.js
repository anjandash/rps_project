import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/JoinGamePage.module.css";

export default class JoinGamePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            gameCode: "",
            error: "",
        }
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.handleEnterGameButtonPressed = this.handleEnterGameButtonPressed.bind(this);
    }

    handleTextFieldChange(e){
        this.setState({
            gameCode: e.target.value,
        });
    }

    handleEnterGameButtonPressed(){
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: this.state.gameCode,
            }),
        };

        fetch("/api/join-game", requestOptions)
        .then((response) => {
            if (response.ok) {
            this.props.history.push(`/game/${this.state.gameCode}`);
            } else {
            this.setState({ error: "Game not found." });
            }
        })
        .catch((error) => {
            console.log(error);
        });        
    } 

    render() {
        return (
            <div align="center">
                <h4>JOIN A GAME</h4>
                <input type="text" placeholder="Enter Game Code" onChange={this.handleTextFieldChange}></input>
                <div onClick={this.handleEnterGameButtonPressed}>Enter Game</div>
                <div>Back</div>
            </div>
        );
    }
}