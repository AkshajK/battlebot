import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { Router } from "@reach/router";
import NotFound from "./pages/NotFound.js";
import Room from "./pages/Room.js";
import Main from "./pages/Main.js";

import NewGame from "./pages/NewGame.js";
import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

const GOOGLE_CLIENT_ID = "263667387033-f8l9edemeljvijhmg7m8jcs77crienq2.apps.googleusercontent.com";

/**
 * Define the "App" component as a class.
 */
class App extends Component {
  // makes props available in this component
  constructor(props) {
    super(props);
    this.state = {
      userId: undefined,
      chat: [],
    };
  }

  componentDidMount() {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        this.setState({ userId: user._id });
      }
    });
    socket.on('message', (message) => {
      let newChat  = this.state.chat;
      message.timestamp = Date.now()
      newChat.push(message)
      this.setState({
        chat: newChat
      })
    })
  }

  handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      this.setState({ userId: user._id });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  handleLogout = () => {
    this.setState({ userId: undefined });
    post("/api/logout");
  };

  render() {
    let publicContent = (
      <>
        <Main
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          userId={this.state.userId}
        />
      </>)

    let privateContent = (
      <>
       
        <Router>
          <Room
              exact path="/"
              roomName = "main"
              chat = {this.state.chat}
              handleLogin={this.handleLogin}
              handleLogout={this.handleLogout}
              userId={this.state.userId}
            />
            <NewGame exact path="/newGame" />
            <Room
              path="/:id"
              roomName = ""
              chat = {this.state.chat}
              handleLogin={this.handleLogin}
              handleLogout={this.handleLogout}
              userId={this.state.userId}
            />
            <NotFound default />
          </Router>
      </>)

    return (
      <>
        {this.state.userId ? privateContent: publicContent}
      </>
    );
  }
}

export default App;
