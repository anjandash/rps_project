import React, { Component } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import styles from "./css/App.module.css";

export default class App extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (<div className={`center ${styles.appWrapper}`}>
            <HomePage></HomePage>
        </div>);
    }
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);