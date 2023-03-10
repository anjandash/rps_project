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
            gameCode: e.target.value.toUpperCase(),
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
            return response.json();
        })
        .then((data) => {
            console.log(data)
        })
        .catch((error) => {
            console.log(error);
        });        
    } 

    render() {
        return (
            <div align="center" className={styles.wrapper}>
                <div className={styles.genericCard}>
                    <input className={styles.inputCodeField} type="text" placeholder="Enter Game Code" autocomplete="off" required="required" onChange={this.handleTextFieldChange}></input>
                    <div className={styles.codeMessage}>If you don't have a code, you can go back and create a new game.</div>
                    <div className={`${styles.button} ${styles.joinButton}`} onClick={this.handleEnterGameButtonPressed}>JOIN GAME</div>
                    <br/>
                    <Link to="/" className={`${styles.button} ${styles.backButton}`}>BACK</Link>
                </div>
            </div>
        );
    }
}