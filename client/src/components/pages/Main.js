import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import Box from "@material-ui/core/Box";
import AdbIcon from '@material-ui/icons/Adb';
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
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
        <Dialog open={true} onClose={() => {}} style={{}}>
      <DialogTitle style={{backgroundColor: "#6c57f5", color: "white"}} >Welcome to BattleBots!</DialogTitle>
      <DialogContent style={{backgroundColor: "#6c57f5", color: "white"}}>
        <Box  style={{width: "100%",  display: "flex", justifyContent: "center"}}>
        <AdbIcon style={{zoom: "800%", display: "flex", justifyContent: "center", marginBottom: "1px"}} />
        </Box>
        
      <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                buttonText="Login"
                onSuccess={this.props.handleLogin}
                onFailure={(err) => console.log(err)}
                render={renderProps => (
                  <Button onClick={() => {
                   renderProps.onClick()
                   
                    }
                    }
                   disabled={renderProps.disabled} fullWidth  color="inherit">Login With Google</Button>
                )}
            />
      </DialogContent>
    </Dialog>
            
         
        </div>
      </div>
    );
  }
}

export default Main;
