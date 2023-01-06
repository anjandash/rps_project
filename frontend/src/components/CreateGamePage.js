import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./css/CreateGamePage.module.css";

export default class CreateGamePage extends Component {
    constructor(props){
        super(props);
        this.handleCreateGameButtonPressed = this.handleCreateGameButtonPressed.bind(this);
    }

    handleCreateGameButtonPressed(){
        console.log("Create game button pressed!")
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({}),
        };
        fetch('/api/create-game', requestOptions)
            .then((response) => response.json())
            .then((data) => this.props.history.push("/game/" + data.code));
    }

    render() {
        return (
            <div>
                <div className={styles.buttonRed} onClick={this.handleCreateGameButtonPressed}>
                    <p>Create a game</p>
                </div>
                <div>
                    <Link to="/" className={styles.buttonGray}>Back</Link>
                </div>                
            </div>
        );
    }
}




