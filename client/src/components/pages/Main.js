import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
//import logo from "../images/logo.png"

import "../../utilities.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "263667387033-f8l9edemeljvijhmg7m8jcs77crienq2.apps.googleusercontent.com";

class Main extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <div className = "main">

      
        <div className = "login">
            {this.props.userId ? (
            <GoogleLogout
                clientId={GOOGLE_CLIENT_ID}
                buttonText="Logout"
                onLogoutSuccess={this.props.handleLogout}
                onFailure={(err) => console.log(err)}
            />
            ) : (
            <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                buttonText="Login"
                onSuccess={this.props.handleLogin}
                onFailure={(err) => console.log(err)}
            />
            )}
        </div>
      </div>
    );
  }
}

export default Main;
