import React, { Component } from "react";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from "@material-ui/core/List";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { get, post } from "../../utilities";
import { FormHelperText } from "@material-ui/core";
class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messageText: "",
      lastMessage: new Date()
    };
  }
  handleSubmit = event => {
    event.preventDefault();
    // this.sendMessage();
    post("api/sendMessage", {message: this.state.messageText, roomName: this.props.roomName}).then(() => {
      this.setState({ messageText: ""})
    });
  };
  handleChange = event => {
    this.setState({ messageText: event.target.value });
  };

  getLastFew(number, array) {
    let newArray = []
    for(var i=Math.max(array.length-number, 0); i<array.length; i++) {
      newArray.push(array[i])
    }
    return newArray
  }
  render() {
    let addZero = (i) => {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
   
    let crop = (str) => {
      if(str.length > 140) {
        str = str.substring(0, 140)
        
      }
      return str
    }
    return (
      <Box height="300px" >
      <Box style={{backgroundColor: "#FFFFFF", height: "calc(100% - 30px)", width: "100%", overflow: "scroll", color: "black", display: "flex", flexDirection: "column-reverse", marginBottom: "auto"}}>
          
            <List>
              {this.getLastFew(100, this.props.messages.filter((message) => {return (message.roomName === this.props.roomName)})).map((message) => {
                let text = <><div style={{display: "inline"}}>{"["+(addZero(new Date(message.timestamp).getHours())) + ":" + (addZero(new Date(message.timestamp).getMinutes())) + "] "}</div><div style={{color: "#678efd", display: "inline", fontWeight: "900"}}>{(message.type === "message" ? message.sender.userName : "")}</div><div style={{display: "inline"}}>{(message.type === "message" ? ": " : "") + crop(message.message)}</div></>
              

                return (
                  <ListItem dense fullWidth>
                    <ListItemText>{text}</ListItemText>
                  </ListItem>

                )
              })}
            </List>
            
            
      </Box>
      <TextField
          
      label="Message"
      variant="outlined"
      size="small"
      value={this.state.messageText}
      fullWidth
      onChange={this.handleChange}
      onKeyPress = {(event) => {
        if(event.charCode === 13) {

          if((new Date()).getTime() - ((new Date(this.state.lastMessage)).getTime()) >= 500) {
            this.setState({lastMessage: new Date()})
            this.handleSubmit(event)
          }
        }
      }}

      />
      </Box>
    );
  }

};


export default Chat
