import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import Chat from "../modules/Chat.js";
import Select from "@material-ui/core/Select";
import Grid from "@material-ui/core/Grid";
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import Box from "@material-ui/core/Box";
import Checkbox from '@material-ui/core/Checkbox';
import ComputerIcon from '@material-ui/icons/Computer';
import Divider from "@material-ui/core/Divider";
import SportsBasketballIcon from '@material-ui/icons/SportsBasketball';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import StarIcon from '@material-ui/icons/Star';
import IconButton from '@material-ui/core/IconButton';
import Dialog from "@material-ui/core/Dialog";

import List from "@material-ui/core/List";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AdbIcon from '@material-ui/icons/Adb';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CodeIcon from '@material-ui/icons/Code';
import SearchIcon from '@material-ui/icons/Search';
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
      isAdmin: false,
      gameOptions: ["Blotto", "Blotto Sudden Death"],
      activeUsers: [],
      leaderboard: [],
      lastMessage: new Date(),
      loaded: false,
      commandText: "",
      addNewBotModal: false,
      createNewRoomModal: false,
      createNewTournamentModal: false,
      createNewAnnouncementModal: false,
      open: false,
      botId: "",
      dialogText: [],
      dialogTitle: "",
      dialogCodeOpen: false,
      dialogCodeText: "",
      newRoomName: "",
      newAnnouncement: "",
      announcementText: "",
      newTournamentName: "",
      newTournamentPassword: "",
      newTournamentRounds: "1",
      botCode: "",
      botTitle: "",
      bots: [],
      matches: [],
      exampleBot: {name: "", code: ""},
      testMatch: {transcript: []},
      codeViewBot: {botId: ""},
      lastChallenge: new Date(),
      tournaments: [],
      selectedTournament: "",
      tournamentMatches : []

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
        isAdmin: res.isAdmin,
        gameName: res.gameName,
        rules: res.rules,
        newGameName: res.gameName,
        activeUsers: res.activeUsers,
        leaderboard: res.leaderboard,
        announcementText: res.announcement,
        bots: res.bots,
        matches: res.matches,
        exampleBot: res.exampleBot,
        botCode: res.exampleBot.code,
        botId: res.leaderboard.filter((entry) => {return entry.userId === this.props.userId})[0].botId,
        tournamentInProgress: res.tournamentInProgress,
        tournamentName: res.tournamentName,
        loaded: true,
        tournaments: res.tournaments

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

    socket.on("leaderboard", (data) => {
      if (data.roomName === this.state.roomName) {
        let bots = this.state.bots 
        let i=0 
        for(i=0; i<bots.length; i++) {
          if(bots[i].botId === data.bots[0].botId) {
            bots[i].record[0] += data.bots[0].record[0]
            bots[i].record[1] += data.bots[0].record[1]
          }
          if(bots[i].botId === data.bots[1].botId) {
            bots[i].record[0] += data.bots[1].record[0]
            bots[i].record[1] += data.bots[1].record[1]
          }
        }

        this.setState({
          bots: bots,
          leaderboard: data.leaderboard
        });


      }
    });
    socket.on("announcement", (data) => {
      if (data.roomName === this.state.roomName) {
        this.setState({
          announcementText: data.announcement
        })


      }
    });
    socket.on("tournamentStart", (data) => {
      if (data.roomName === this.state.roomName) {
        this.setState({
          tournamentInProgress: true,
          tournamentName: data.name
        })


      }
    });

    socket.on("tournamentDone", (data) => {
      if (data.roomName === this.state.roomName) {
        let tournaments = this.state.tournaments 
        tournaments.push(data.tournament)
        this.setState({
          tournamentInProgress: false,
          tournamentName: "Free Play",
          tournaments: tournaments
        })


      }
    });


    socket.on("leaveRoom", (data) => {
      if (data.roomName === this.state.roomName && data.user.userId !== this.props.userId) {
        let newActiveUsers = this.state.activeUsers.filter((user) => {return user.userId !== data.user.userId});
        
        this.setState({
          activeUsers: newActiveUsers,
         
        });
        if(data.left) {
          let newLeaderboard = this.state.leaderboard.filter((user) => {return user.userId !== data.user.userId});
          this.setState({
            leaderboard: newLeaderboard,
           
          });
        }
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
    let closeNewTournamentPopup = () => {
      this.setState({ createNewTournamentModal: false, newTournamentName: "", newTournamentPassword: "", newTournamentRounds: "1"});
    };
    let closeNewAnnouncementPopup = () => {
      this.setState({ createNewAnnouncementModal: false, newAnnouncement: ""});
    };
    let handleNewRoomSubmit = () => {
      console.log("Submitted")
      post("api/createRoom", {roomName: this.state.newRoomName, gameName: this.state.newGameName}).then((res) => {
        console.log("createdRoom "+window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + this.state.newRoomName)
        window.location.href = window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + this.state.newRoomName
        
      });
    };
    let handleNewTournamentSubmit = () => {
      console.log("Submitted")
      if((new Date()).getTime() - ((new Date(this.state.lastChallenge)).getTime()) >= 500) {
          this.setState({lastChallenge: new Date()})
        post("api/runTournament", {roomName: this.state.roomName, name: this.state.newTournamentName, password: this.state.newTournamentPassword, rounds: parseInt(this.state.newTournamentRounds)})
        
      }
      closeNewTournamentPopup()
    };
    let handleNewAnnouncementSubmit = () => {
      console.log("Submitted")
      post("api/sendAnnouncement", {roomName: this.state.roomName, announcement: this.state.newAnnouncement})
       
      closeNewAnnouncementPopup()
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
 let codePopupClose = () => {this.setState({dialogCodeOpen: false, dialogCodeText: ""})}
  let codePopup = (
    <><Dialog open={this.state.dialogCodeOpen} onClose={codePopupClose}>
    <DialogTitle>{this.state.dialogTitle}</DialogTitle>
    <DialogContent>
     
    <AceEditor
                    mode="python"
                    
                    theme="github"
                    value={this.state.dialogCodeText}
                  
                    width="700px"
                    onChange={(event) => {
              
                      this.setState({ dialogCodeText: event });
                    }}
                />
                 
    </DialogContent>
    <DialogActions>
    <Button
              disabled={this.state.tournamentInProgress}
              onClick={() => {
                post("api/editBot", {botId: this.state.codeViewBot.botId, code: this.state.dialogCodeText}).then(() => {
                  let bots = this.state.bots
                  bots = bots.filter((bot) => {return bot.botId !== this.state.codeViewBot.botId})
                  let currentBot = this.state.codeViewBot 
                  currentBot.code = this.state.dialogCodeText 
                  bots.push(currentBot)
                  this.setState({bots: bots})
                  codePopupClose()
                })
                
                
              }}
             
              
            >
              Save Bot
            </Button>
    <Button
              onClick={() => {
                let bots = this.state.bots
                bots = bots.filter((bot) => {return bot.botId !== this.state.codeViewBot.botId})
                this.setState({bots: bots})
                codePopupClose()
                post("api/deleteBot", {botId: this.state.codeViewBot.botId})
              }}
             disabled={this.state.tournamentInProgress || (this.state.codeViewBot.botId === this.state.botId)}
              color="secondary"
            >
              Delete Bot
            </Button>
    <Button onClick={codePopupClose} color="primary">
              Close
            </Button>
            
    </DialogActions>
  </Dialog>
</>)
    let newTournamentPopup = (
      <>
        <Dialog open={this.state.createNewTournamentModal} onClose={closeNewTournamentPopup}>
          <DialogTitle>New Tournament</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Tournament Name"
              type="text"
              fullWidth
              value={this.state.newTournamentName}
              onChange={(event) => {
                this.setState({ newTournamentName: event.target.value });
              }}
            />
            <TextField
              margin="dense"
              label="Number of Rounds"
              type="text"
              fullWidth
              value={this.state.newTournamentRounds}
              onChange={(event) => {
                this.setState({ newTournamentRounds: event.target.value });
              }}
            />
           
           
          </DialogContent>
          <DialogActions>
            <Button onClick={closeNewTournamentPopup} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleNewTournamentSubmit}
              disabled={this.state.tournamentInProgress || (this.state.newTournamentName.length < 1) || (!/^\d+$/.test(this.state.newTournamentRounds))}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
    let newAnnouncementPopup = (
      <>
        <Dialog open={this.state.createNewAnnouncementModal} onClose={closeNewAnnouncementPopup}>
          <DialogTitle>New Announcement</DialogTitle>
          <DialogContent>
           
            <TextField
              margin="dense"
              label="Announcement"
              type="text"
              fullWidth
              value={this.state.newAnnouncement}
              onChange={(event) => {
                this.setState({ newAnnouncement: event.target.value });
              }}
            />
           
           
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleNewAnnouncementSubmit}
             
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
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
            <Select fullWidth value={this.state.newGameName} onChange={(event)=>{this.setState({newGameName: event.target.value})}}>
              {this.state.gameOptions.map((option) => {return <MenuItem value={option}>{option}</MenuItem>})}
            </Select>
           
          </DialogContent>
          <DialogActions>
            <Button onClick={closeNewRoomPopup} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleNewRoomSubmit}
              disabled={this.state.tournamentInProgress || (!/^\w+$/.test(this.state.newRoomName))}
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
    let handleTest = () => {
      if((new Date()).getTime() - ((new Date(this.state.lastChallenge)).getTime()) >= 500) {
        this.setState({lastChallenge: new Date()})
      post("api/testBot", {
       
          name: this.state.botTitle,
          code: this.state.botCode,
          exampleCode: this.state.exampleBot.code,
          gameName: this.state.gameName
       
      }).then((match) => {
        this.setState({testMatch: match})
      });
      }
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
            <Grid container direction="row">
      
            <AceEditor
                    mode="python"
                    value={this.state.botCode}
                    theme="github"
                   
                    width="700px"
                    onChange={(event) => {
              
                      this.setState({ botCode: event });
                    }}
                    
                   
                /> 
          <Divider orientation="vertical" flexItem />
          <List style={{height: "500px", width: "500px", overflow: "auto"}}>
         { this.state.testMatch.transcript.map((text) => {
            return <ListItem><ListItemText primary={text} /></ListItem>
          })}
        </List>
      
        
         </Grid>
           
          </DialogContent>
          <DialogActions>
            <Button onClick={closePopup} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.tournamentInProgress}
              onClick={handleTest}
              color="primary"
            >
              Test
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                this.state.tournamentInProgress || (this.state.botTitle.length < 2)
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
   let length = (this.state.selectedTournament !== "") ? ((this.state.selectedTournament.records.length - 1) * (this.state.selectedTournament.rounds)) : 0
    let leaderboard = <>
      <List style={{maxHeight: "700px", overflow: "auto"}}>
        {this.state.selectedTournament === "" ? (
        this.state.leaderboard.sort((a,b) => {return b.rating - a.rating}).map((entry) => {
          return <ListItem>
            <ListItemText primary={entry.userName} secondary={Math.floor(entry.rating)} />
            <IconButton onClick={() => {
              if((new Date()).getTime() - ((new Date(this.state.lastChallenge)).getTime()) >= 500) {
                    this.setState({lastChallenge: new Date()})
                    post("api/runMatch", {roomName: this.state.roomName, player1: this.props.userId, player2: entry.userId})
                }
              }
            } disabled={this.state.tournamentInProgress || (entry.userId === this.props.userId)}
            color={((this.state.activeUsers.filter((user)=>{return user.userId === entry.userId}).length === 0) ? "inherit" : "secondary")}
            ><SportsBasketballIcon /></IconButton>
          </ListItem>
        })) : 
        
        this.state.selectedTournament.records.sort((a,b) => {return b.record - a.record}).map((record) => {
          return (<ListItem>
            <ListItemText primary={record.userName} secondary={record.record + " - " + (length - record.record)} />
            </ListItem>)
        })
        
        }
      </List>
    </>

    /*
    Matches

    */
   let matches = <>
   {(this.state.selectedTournament !== "") && (this.state.tournamentMatches.length === 0) ? <Box width="100%" style={{display: "flex", marginTop: "50px", justifyContent: "center", alignItems: "center"}}><CircularProgress /></Box> : <></>}
    <List>
        {((this.state.selectedTournament === "") ? this.state.matches.sort((a,b) => {return new Date(b.timestamp) - new Date(a.timestamp)}) : this.state.tournamentMatches).map((match) => {
          return <ListItem>
            <ListItemText primary={match.player1.userName + " vs " + match.player2.userName} secondary={match.inProgress ? "In Progress" : (match.score[0] + " - " + match.score[1])} />
            <IconButton onClick={() => {
               this.setState({
                 dialogText: match.transcript,
                 open: true,
                 dialogTitle: "Match Transcript"
               })
              }
            }><SearchIcon /></IconButton>
          </ListItem>
        })}
      </List>
   </>
   let tournamentBlob = <>
      <List style={{marginTop: "10px"}}>
       
        {this.state.tournaments.sort((a,b) => {return new Date(b.timestamp) - new Date(a.timestamp)}).map((tournament) => {
         
          return <ListItem selected={tournament.name === this.state.selectedTournament.name}>
            
            <ListItemText primary={tournament.name} secondary={"Winner: " + tournament.winner.userName} />
          
            <IconButton onClick={() => {
              this.setState({selectedTournament: tournament})
              get("api/tournamentMatches", {roomName: this.state.roomName, tournamentName: tournament.name}).then((matches) => {
                this.setState({tournamentMatches: matches})
              })
            }}><EqualizerIcon /></IconButton>
          </ListItem>
        })}
      </List>
      
   </>
  let bots = <>
  <List>
        {this.state.bots.sort((a,b) => {return new Date(b.timestamp) - new Date(a.timestamp)}).map((bot) => {
          let record = bot.record || [0, 0]
          return <ListItem selected={bot.botId === this.state.botId}>
            
            <ListItemText primary={bot.name} secondary={record[0] + " - " + record[1]} />
            <Checkbox disabled={this.state.tournamentInProgress} checked={bot.botId === this.state.botId} onChange={(event) => {
              if(event.target.checked) {
                post("api/setBot", {roomName: this.state.roomName, botId: bot.botId}).then(() => {
                this.setState({
                  botId: bot.botId,
                })
                })
               }
              }
            }>Use This Bot</Checkbox>
            <IconButton onClick={() => {
              this.setState({dialogCodeOpen: true, dialogCodeText: bot.code, dialogTitle: "View Code of " + bot.name, codeViewBot: bot})
            }}><CodeIcon /></IconButton>
          </ListItem>
        })}
      </List>
  </>
    return (
      <>
     {/* <button onClick = {()=>{console.log(this.state)}}>log state</button>*/}
        <AppBar position="static" style={{backgroundColor: "#6c57f5"}}>
  <Toolbar>
 
    
    
      
        
    
              

    <Typography variant="h6" style={{display: "flex", width: "70%", justifyContent: "center", alignItems: "center"}}>
    <AdbIcon fontSize="large" style={{marginRight: "10px"}} /> {"BattleBots: "+this.state.gameName}
    </Typography>
    
            <Button
                onClick={() => {this.setState({open: true, dialogText: [this.state.rules], dialogTitle: "Rules of " + this.state.gameName})}}
                color="inherit"
                variant={this.state.bots.length === 0 ? "outlined" : "text"}
              >
                {"Rules"}
              </Button>
    <Button
                onClick={() => {
                  this.setState({ createNewRoomModal: true });
                }}
                color="inherit"
              >
                {"Create New Room"}
              </Button>
             
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
        {this.state.loaded ?
        <Grid container direction="row" height={"calc(100% - 56px)"}>
        
        <Box width="280px">{leaderboard}</Box>  
          <Box width="calc(100% - 700px)">
          <Box style={{maxHeight: "280px", overflow: "auto"}}>
            {bots}
            </Box>
            <Button
            disabled={this.state.tournamentInProgress}
          onClick={() => {
            this.setState({ addNewBotModal: true, testMatch: {transcript: []} });

          }}
          style={{backgroundColor: (this.state.bots.length === 0 ? "#6c57f5" : undefined)}}
          color={this.state.bots.length === 0 ? "primary" : "default"}
          variant={this.state.bots.length === 0 ? "contained" : "text"}
          fullWidth
        >
          {this.state.bots.length === 0 ? "Add Your First Bot" : "Add New Bot"}
        </Button>
            <Box height="370px" style={{overflow: "auto"}}>
            {matches}
            </Box>
          
          </Box>
          <Box width="400px">    
          {this.state.announcementText !== "" ? <Alert severity="info" style={{marginTop: "10px"}}>{this.state.announcementText}</Alert>  : <></>}   

          {this.state.tournamentInProgress ? <Alert severity="info" style={{marginTop: "10px"}}>{this.state.tournamentName + " in Progress"}</Alert>  : <></>}   
            <Chat messages={this.props.chat} roomName={this.state.roomName} />
            
            <Box height="300px" style={{overflow: "auto"}}>
            {tournamentBlob}
           
            </Box>
            {(this.state.selectedTournament==="" ? <></> : <Button fullWidth onClick={() => {this.setState({selectedTournament: ""})
     
    }}> Return to Free Play</Button>)}
            {this.state.isAdmin ? <Button
                onClick={() => {
                  this.setState({createNewTournamentModal: true})
                }}
                color="inherit"
                disabled={this.state.tournamentInProgress}
                fullWidth
              >
                {"Run Tournament"}
              </Button> : <></>}
              {this.state.isAdmin ? <Button
                onClick={() => {
                  this.setState({createNewAnnouncementModal: true})
                }}
                color="inherit"
                disabled={this.state.tournamentInProgress}
                fullWidth
              >
                {"Send Announcement"}
              </Button> : <></>}
              
           
          </Box>
          {popup}
          {newRoomPopup}
          {newTournamentPopup}
          {newAnnouncementPopup}
          {matchPopup}
          {codePopup}
        </Grid> : <Box width="100%" style={{display: "flex", marginTop: "50px", justifyContent: "center", alignItems: "center"}}><CircularProgress /></Box>}
      </>
    );
  }
}

export default Room;
