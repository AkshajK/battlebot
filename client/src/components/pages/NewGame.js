import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import Chat from "../modules/Chat.js";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import List from "@material-ui/core/List";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/python';

// Import a Theme (okadia, github, xcode etc)
import 'brace/theme/github';
import MenuIcon from "@material-ui/icons/Menu";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../../utilities.css";
import "./Skeleton.css";

import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities";
const GOOGLE_CLIENT_ID = "263667387033-f8l9edemeljvijhmg7m8jcs77crienq2.apps.googleusercontent.com";

class NewGame extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State

    this.state = {
      gameName: "",
      rules: "",
      code: "",
      codeExample: "",
      password: ""
    };
  }

  componentDidMount() {
    // remember -- api calls go here!
    // console.log(this.props)
    post("api/getBlotto").then((res) => {
      this.setState({
        gameName: res.gameName,
        rules: res.rules,
        code: res.code,
        codeExample: res.codeExample,

      });
    });
  }

  render() {

    let handleSubmit = () => {
      console.log("submitting...")
      post("api/createGame", {
        gameName: this.state.gameName,
        code: this.state.code,
        rules: this.state.rules,
        password: this.state.password,
        codeExample: this.state.codeExample
      })
    };


    let newGame = (
      <>
        <TextField
          margin="dense"
          label="Game Name"
          type="text"
          fullWidth
          value={this.state.gameName}
          onChange={(event) => {
            this.setState({ gameName: event.target.value });
          }}
        />
        <TextField
          margin="dense"
          label="Rules"
          type="text"
          fullWidth
          multiline
          value={this.state.rules}
          onChange={(event) => {
            this.setState({ rules: event.target.value });
          }}
        />
        <Grid container  direction="row" >
        <AceEditor
                    mode="python"
                 
                    theme="github"
                    value={this.state.code}
          onChange={(value) => {
            this.setState({ code: value });
          }}
                />
        <AceEditor
                    mode="python"
                  
                    theme="github"
                    value={this.state.codeExample}
          onChange={(value) => {
            this.setState({ codeExample: value });
          }}
                />
          </Grid>
        <TextField
          margin="dense"
          label="Password"
          type="text"
          fullWidth
          multiline 
          value={this.state.password}
          onChange={(event) => {
            this.setState({ password: event.target.value });
          }}
        />

        <Button
          onClick={() => {handleSubmit()}}
          color="primary"
          disabled={this.state.gameName === "Blotto"}
        >
          Submit
        </Button>
      </>
    );

    
    return <>{newGame}</>
  }
}

export default NewGame;
