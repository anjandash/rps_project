import React, { Component } from "react";
import { BrowserRouter, Switch,  Route, Link, Redirect } from "react-router-dom";

import JoinGamePage from "./JoinGamePage";
import CreateGamePage from "./CreateGamePage";
import Game from "./Game"
import styles from "./css/HomePage.module.css"


export default class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            gameCode: null,
        };        
        this.clearGameCode = this.clearGameCode.bind(this);
    }

    async componentDidMount() {
        fetch("/api/user-in-game")
          .then((response) => response.json())
          .then((data) => {
            this.setState({
                gameCode: data.code,
            });
            console.log("Found game code: " + this.state.gameCode)
          });
      }

    renderHomePage() {
        return (
            <div className={styles.wrapper}>
                <div className={styles.genericCard}>
                    <div className={styles.logoTextHome}>ROCK. PAPER. SCISSORS.</div>
                    <div className={styles.logoSubtitle}>By @anjandash / liqi</div>
                    <Link to="/create" className={`${styles.button} ${styles.createButton}`}>CREATE NEW GAME</Link>
                    <br/>
                    <Link to="/join" className={`${styles.button} ${styles.joinButton}`}>JOIN GAME</Link>
                </div>
            </div>
        );
    }

    clearGameCode() {
        this.setState({
            gameCode: null,
        });
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/"
                        render={() => { 
                            return this.state.gameCode ? (<Redirect to={`/game/${this.state.gameCode}`} />) : (this.renderHomePage());  
                        }} 
                    />
                    <Route exact path="/join" component={JoinGamePage} />
                    <Route exact path="/create" component={CreateGamePage} />
                    <Route path="/game/:gameCode" 
                        render={(props) => {
                            return <Game {...props} leaveGameCallback={this.clearGameCode} />;
                        }}
                    />
                </Switch>
            </BrowserRouter>
        );
    }
}