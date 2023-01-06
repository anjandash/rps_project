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
                <h4>Rock Paper Scissors</h4>
                <Link to="/create" className={styles.createButton}>CREATE NEW GAME</Link>
                <Link to="/join" className={styles.joinButton}>JOIN GAME</Link>
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