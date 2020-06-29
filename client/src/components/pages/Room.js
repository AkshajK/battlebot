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
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AceEditor from 'react-ace';
import brace from 'brace';
import 'brace/mode/python';

// Import a Theme (okadia, github, xcode etc)
import 'brace/theme/github';
import "../../utilities.css";
import "./Skeleton.css";

import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities";
const GOOGLE_CLIENT_ID = "263667387033-f8l9edemeljvijhmg7m8jcs77crienq2.apps.googleusercontent.com";

class Room extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    let roomName = this.props.roomName;
    if (roomName === "") {
      roomName = window.location.href.substring(window.location.href.lastIndexOf("/")+1);
    }
    this.state = {
      roomName: roomName,
      gameName: "",
      newGameName: "",
      gameOptions: ["Blotto"],
      activeUsers: [],
      leaderboard: [],
      lastMessage: new Date(),
      commandText: "",
      addNewBotModal: false,
      createNewRoomModal: false,
      open: false,
      botId: "",
      dialogText: [],
      dialogTitle: "",
      dialogCodeOpen: false,
      dialogCodeText: "",
      newRoomName: "",
      botCode: "",
      botTitle: "",
      bots: [],
      matches: [],
      exampleBot: {name: "", code: ""}

    };
  }

  componentDidMount() {
    // remember -- api calls go here!
   // console.log(this.props)
    let roomName = this.props.roomName;
    if (roomName === "") {
      roomName = window.location.href.substring(window.location.href.lastIndexOf("/")+1);
    }

    post("api/joinRoom", { roomName: roomName }).then((res) => {
      this.setState({
        gameName: res.gameName,
        rules: res.rules,
        newGameName: res.gameName,
        activeUsers: res.activeUsers,
        leaderboard: res.leaderboard,
        bots: res.bots,
        matches: res.matches,
        exampleBot: res.exampleBot,
        botCode: res.exampleBot.code,
        botId: res.leaderboard.filter((entry) => {return entry.userId === this.props.userId})[0].botId

      });
    });

    socket.on("joinRoom", (data) => {
      if (data.roomName === this.state.roomName && data.user.userId !== this.props.userId) {
        
        this.setState({
          activeUsers: data.activeUsers,
          leaderboard: data.leaderboard
        });
      }
    });

    socket.on("leaveRoom", (data) => {
      if (data.roomName === this.state.roomName && data.user.userId !== this.props.userId) {
        let newActiveUsers = this.state.activeUsers.filter((user) => {return user.userId !== data.user.userId});
        this.setState({
          activeUsers: newActiveUsers,
        });
      }
    });

    socket.on("newMatch", (data) => {
      if (data.roomName === this.state.roomName) {
        let newMatches = this.state.matches.filter((match) => {return match._id !== data.match._id});
        newMatches.push(data.match)
        this.setState({
          matches: newMatches,
        });
      }
    });


   
  }

  render() {
    

        

    let closeNewRoomPopup = () => {
      this.setState({ createNewRoomModal: false });
    };
    let handleNewRoomSubmit = () => {
      console.log("Submitted")
      post("api/createRoom", {roomName: this.state.newRoomName, gameName: this.state.newGameName}).then((res) => {
        console.log("createdRoom "+window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + this.state.newRoomName)
        window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + this.state.newRoomName
      });
    };
    let matchPopup = (<><Dialog open={this.state.open} onClose={() => {this.setState({open: false, dialogText: []})}}>
      <DialogTitle>{this.state.dialogTitle}</DialogTitle>
      <DialogContent>
        <List>
         { this.state.dialogText.map((text) => {
            return <ListItem><ListItemText primary={text} /></ListItem>
          })}
        </List>
      </DialogContent>
    </Dialog>
  </>)

  let codePopup = (
    <><Dialog open={this.state.dialogCodeOpen} onClose={() => {this.setState({dialogCodeOpen: false, dialogCodeText: ""})}}>
    <DialogTitle>{this.state.dialogTitle}</DialogTitle>
    <DialogContent>
    <AceEditor
                    mode="python"
                    readOnly
                    theme="github"
                    value={this.state.dialogCodeText}
                />
    </DialogContent>
  </Dialog>
</>)
    let newRoomPopup = (
      <>
        <Dialog open={this.state.createNewRoomModal} onClose={closeNewRoomPopup}>
          <DialogTitle>New Room</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Room Name"
              type="text"
              fullWidth
              value={this.state.newRoomName}
              onChange={(event) => {
                this.setState({ newRoomName: event.target.value });
              }}
            />
            <Select value={this.state.newGameName} onChange={(event)=>{this.setState({newGameName: event.target.value})}}>
              {this.state.gameOptions.map((option) => {return <MenuItem value={option}>{option}</MenuItem>})}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeNewRoomPopup} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleNewRoomSubmit}
              disabled={!/^\w+$/.test(this.state.newRoomName)}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );

    let closePopup = () => {
      this.setState({ addNewBotModal: false, botTitle: "", botCode: this.state.exampleBot.code });
    };
    let handleSubmit = () => {
      post("api/uploadBot", {
       
          name: this.state.botTitle,
          code: this.state.botCode,
          gameName: this.state.gameName
       
      }).then((bot) => {
        let newBots = this.state.bots
        newBots.push(bot.bot)
        this.setState({
          bots: newBots,
         
        });
        post("api/setBot", {roomName: this.state.roomName, botId: bot.bot.botId}).then(() => {
          this.setState({
            botId: bot.bot.botId,
          })
         })
        closePopup();
      });
    };
    let popup = (
      <>
        <Dialog open={this.state.addNewBotModal} onClose={closePopup} maxWidth="lg">
          <DialogTitle>Add New Bot</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={this.state.botTitle}
              onChange={(event) => {
              
                this.setState({ botTitle: event.target.value });
              }}
            />
            <AceEditor
                    mode="python"
                    value={this.state.botCode}
                    theme="github"
                    onChange={(event) => {
              
                      this.setState({ botCode: event });
                    }}
                    width="800px"
                   
                />
          
           
          </DialogContent>
          <DialogActions>
            <Button onClick={closePopup} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                this.state.botTitle.length < 2
              }
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
    /*
    Leaderboard

    */
    let leaderboard = <>
      <List>
        {this.state.leaderboard.map((entry) => {
          return <ListItem>
            <ListItemText primary={entry.userName} secondary={entry.rating + ((this.state.activeUsers.filter((user)=>{return user.userId === entry.userId}).length === 0) ? "" : " (Online)")} />
            <Button onClick={() => {
               post("api/runMatch", {roomName: this.state.roomName, player1: this.props.userId, player2: entry.userId})
              }
            } disabled={entry.userId === this.props.userId}>Challenge</Button>
          </ListItem>
        })}
      </List>
    </>

    /*
    Matches

    */
   let matches = <>
    <List>
        {this.state.matches.sort((a,b) => {return new Date(b.timestamp) - new Date(a.timestamp)}).map((match) => {
          return <ListItem>
            <ListItemText primary={match.player1.userName + " vs " + match.player2.userName} secondary={match.inProgress ? "In Progress" : (match.score[0] + " - " + match.score[1])} />
            <Button onClick={() => {
               this.setState({
                 dialogText: match.transcript,
                 open: true,
                 dialogTitle: "Match Transcript"
               })
              }
            }>See Transcript</Button>
          </ListItem>
        })}
      </List>
   </>
  let bots = <>
  <List>
        {this.state.bots.sort((a,b) => {return new Date(b.timestamp) - new Date(a.timestamp)}).map((bot) => {
          return <ListItem>
            <ListItemText primary={bot.name} secondary={this.state.botId === bot.botId ? "Selected" : ""}  />
            <Button onClick={() => {
              post("api/setBot", {roomName: this.state.roomName, botId: bot.botId}).then(() => {
               this.setState({
                 botId: bot.botId,
               })
              })
              }
            }>Use This Bot</Button>
            <Button onClick={() => {
              this.setState({dialogCodeOpen: true, dialogCodeText: bot.code, dialogTitle: "View Code of " + bot.name})
            }}>View Code</Button>
          </ListItem>
        })}
      </List>
  </>
    return (
      <>
     {/* <button onClick = {()=>{console.log(this.state)}}>log state</button>*/}
        <AppBar position="static">
  <Toolbar>
    <IconButton edge="start"  color="inherit" aria-label="menu">
      <MenuIcon />
    </IconButton>
    <Typography variant="h6">
      BattleBot
    </Typography>
    
      
        <Button
          onClick={() => {
            this.setState({ addNewBotModal: true });
          }}
          color="inherit"
        >
          {"Add New Bot"}
        </Button>
        <Button
                onClick={() => {
                  this.setState({ createNewRoomModal: true });
                }}
                color="inherit"
              >
                {"Create New Room"}
              </Button>
              <Button color="inherit" onClick={() => {
              this.setState({open: true, dialogText: [this.state.rules], dialogTitle: "Rules of " + this.state.gameName})
            }}>View Rules</Button>
    <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={this.props.handleLogout}
            onFailure={(err) => console.log(err)}
            render={renderProps => (
              <Button onClick={() => {
                post("api/leaveRoom", {roomName: this.state.roomName}).then(renderProps.onClick)
                }
                }
               disabled={renderProps.disabled}  color="inherit">Logout</Button>
            )}
          />
  </Toolbar>
</AppBar>
        <Grid container direction="row" height={"calc(100% - 56px)"}>
        
        <Box width="300px">{leaderboard}</Box>  
          <Box width="calc(100% - 700px)">
          <Box height="200px" style={{overflow: "auto"}}>
            {bots}
            </Box>
            <Box height="500px" style={{overflow: "auto"}}>
            {matches}
            </Box>
          
          </Box>
          <Box width="400px">       
            <Chat messages={this.props.chat} roomName={this.state.roomName} />
          </Box>
          {popup}
          {newRoomPopup}
          {matchPopup}
          {codePopup}
        </Grid>
      </>
    );
  }
}

export default Room;
