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
            body: JSON.stringify({
                
            }),
        };
        fetch('/api/create-game', requestOptions)
            .then((response) => response.json())
            .then((data) => this.props.history.push("/game/" + data.code));
    }

    render() {
        return (
            <div className={styles.wrapper}>
                <div className={styles.genericCard}>
                    <div className={styles.logoTextHome}>ROCK. PAPER. SCISSORS.</div>
                    <div className={styles.logoSubtitle}>By @anjandash / liqi</div>                    
                    <div className={`${styles.button} ${styles.createButton}`} onClick={this.handleCreateGameButtonPressed}>
                        PLAY WITH A FRIEND
                    </div>
                    <Link to="/" className={`${styles.button} ${styles.backButton} ${styles.buttonDisabled}`}>PLAY WITH COMPUTER</Link>
                    <div>
                        <Link to="/" className={`${styles.button} ${styles.backButton}`}>BACK</Link>
                    </div>    
                </div>            
            </div>
        );
    }
}




