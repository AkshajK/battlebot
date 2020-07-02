/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
var Promise = require('promise');
const express = require("express");
//const bodyParser = require('body-parser');
//const cors = require('cors');
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');


// import models so we can interact with the database
const User = require("./models/user");
const Room = require("./models/room");
const Bot = require("./models/bot");
const Challenge = require("./models/challenge");
const Game = require("./models/game");
const Match = require("./models/match");
// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socket = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

let userObject = (user) => {
  return {userId: user._id, userName: user.userName}
}
// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// input: {roomName: String, gameName: String}
// output: {}
router.post("/createRoom", auth.ensureLoggedIn, (req, res) => {
  Room.findOne({name: req.body.roomName}).then((result) => {
    if(result) {
    } else {
      const room = new Room({
        name: req.body.roomName,
        gameName: req.body.gameName
      })
      room.save().then(() => {
        res.send({})
      })
    }
  })
  
});

router.post("/createGame", auth.ensureLoggedIn, (req, res) => {
  if(req.body.password !== "admin") return
  const game = new Game({
        name: req.body.gameName,
        rules: req.body.rules,
        getWinner: req.body.code
      })
      game.save().then(() => {

        let bot = new Bot({
          name: "ExampleBot",
          botId: "EXAMPLE",
          gameName: game.name,
          code: req.body.codeExample,
          user: {
            userId: "Example",
            userName: "Example"
          }
        })
        bot.save().then(() => {
          console.log("done")
          res.send({})
        })
      })

});

router.post("/getBlotto", auth.ensureLoggedIn, (req, res) => {

  Game.findOne({name: "Blotto"}).then((game) => {
    Bot.findOne({gameName: game.name, botId: "EXAMPLE"}).then((bot) => {
      res.send({
        gameName: game.name,
        rules: game.rules,
        code: game.getWinner,
        codeExample: bot.code
      })
    })
    
  })
        

});

// input: {roomName: String}
// output: {leaderboard: leaderboard, activeUsers: activeUsers, gameName: String, bots: [Bot], matches: [Match]
// emits socket "joinRoom", {roomName: String, user: User}
router.post("/joinRoom", auth.ensureLoggedIn, (req, res) => {
  Room.findOne({name: req.body.roomName}).then((room) => {
    let activeUsers = room.activeUsers
    if(activeUsers.filter((user) => {return req.user._id === user.userId}).length === 0) {
      console.log("new active user")
      activeUsers.push(userObject(req.user))
    }
    let leaderboard = room.leaderboard
    if(leaderboard.filter((user) => {return req.user._id === user.userId}).length === 0) {
     console.log("new leaderboard user")
     leaderboard.push(Object.assign(userObject(req.user), {rating: 1200, botId: "EXAMPLE"}))
    } 
    room.activeUsers = activeUsers 
    room.leaderboard = leaderboard
    room.save().then(() => {
    
       // need the res.send
       Match.find({roomName: room.name}, (err, matches) => {

       
       Bot.find({"user.userId": req.user._id, gameName: room.gameName, deleted: false}, (err, bots) => {

        Bot.findOne({botId: "EXAMPLE"}).then((exampleBot) => {
          Game.findOne({name: room.gameName}).then((game) => {
          res.send({leaderboard: leaderboard, activeUsers: activeUsers, gameName: room.gameName, bots: bots, matches: matches, exampleBot: exampleBot, rules: game.rules, tournamentInProgress: room.tournamentInProgress, tournamentName: room.tournamentName})
          socket.getIo().emit("joinRoom", {roomName: req.body.roomName, user: userObject(req.user), leaderboard: leaderboard, activeUsers: activeUsers})
          socket.getIo().emit("message", {roomName: req.body.roomName, message: req.user.userName + " entered the room", type: "userJoinsOrLeaves"})
      
           
          }
          )
        })
         
 
   
       })
       })
    })
  })
});



router.post("/setBot", auth.ensureLoggedIn, (req, res) => {
  Room.findOne({name: req.body.roomName}).then((room) => {
    let leaderboard = room.leaderboard

    let curUser = leaderboard.filter((user) => {return req.user._id === user.userId})[0]

    leaderboard = leaderboard.filter((user) => {return req.user._id !== user.userId})
  
    curUser.botId = req.body.botId
    leaderboard.push(curUser)
    

    room.leaderboard = leaderboard
    room.save().then(() => {
      res.send({})
    })
  })
});


// input: {roomName: String}
// output: {}
// emits socket "leaveRoom", {roomName: String, user: User}
router.post("/leaveRoom", auth.ensureLoggedIn, (req, res) => {
  // also runs in socket disconnect
  Room.findOne({name: req.body.roomName}).then((room) => {
    let activeUsers = room.activeUsers
    activeUsers = activeUsers.filter((user) => {return req.user._id !== user.userId})
    room.activeUsers = activeUsers 
    room.save().then(() => {
      socket.getIo().emit("message", {roomName: req.body.roomName, message: req.user.userName + " left the room", type: "userJoinsOrLeaves"})
      socket.getIo().emit("leaveRoom", {roomName: req.body.roomName, user: userObject(req.user)})
       res.send({})
    })
  })
});


// input: {message: String, roomName: String}
// output: {}
// emits socket "message", {message: String, type: "message", "userJoinsOrLeaves", "trade", or "settlement"}
router.post("/sendMessage", auth.ensureLoggedIn, (req, res) => {

  socket.getIo().emit("message", {roomName: req.body.roomName, message: req.body.message, type: "message", sender: userObject(req.user)})

  res.send({});
  
});



// input: {name: String, gameName: String, code: String}
// output: {}
// emits socket "message", {message: String, type: "message", "userJoinsOrLeaves", "trade", or "settlement"}
router.post("/uploadBot", auth.ensureLoggedIn, (req, res) => {
  let bot = new Bot({
    name: req.body.name,
    user: userObject(req.user),
    code: req.body.code,
    gameName: req.body.gameName,
    botId: new Date() + " " + req.user._id + " " + Math.random().toString(36).substring(2, 15)
  })
  bot.save().then(() => {
    res.send({bot: bot});
  })
   
  
  
});
router.post("/editBot", auth.ensureLoggedIn, (req, res) => {
  Bot.findOne({botId: req.body.botId}).then((bot) => {
    bot.code = req.body.code
    bot.save().then(() => {
      res.send({})
    })
  })
   
  
  
});
router.post("/deleteBot", auth.ensureLoggedIn, (req, res) => {
  Bot.findOne({botId: req.body.botId}).then((bot) => {
    bot.deleted = true 
    bot.save()
  })
   
  
  
});

router.post("/testBot", auth.ensureLoggedIn, (req, res) => {
  Game.findOne({name: req.body.gameName}).then((game) => {
                fs.writeFileSync(path.join(__dirname, "code", "bot1.py"), req.body.code)
                fs.writeFileSync(path.join(__dirname, "code", "bot2.py"), req.body.exampleCode)
                fs.writeFileSync(path.join(__dirname, "code", "getWinner.py"), game.getWinner)
                const proc = execSync("python3 " + path.join(__dirname, "code", "runMatch.py"));
                const results = proc.toString();
                let transcript = results.split("[!BOT1]").join(req.user.userName).split("[!BOT2]").join("ExampleBot").split("\n")
                res.send({transcript: transcript})
  })
})

// input: {player1: Id, player2: Id, roomName: String}
// output: {}

runMatch = (player1id, player2id, roomName, inTournament, tournamentName) => {
  return new Promise((resolve, reject) => {
    

  
  Room.findOne({name: roomName}).then((room) => {
    let player1 = room.leaderboard.filter((user) => {return user.userId === player1id})[0]
    let player2 = room.leaderboard.filter((user) => {return user.userId === player2id})[0]
    
    
    
  Bot.findOne({botId: player1.botId}).then((bot1) => {
    Bot.findOne({botId: player2.botId}).then((bot2) => {

      Game.findOne({name: room.gameName}).then((game) => {
        try {
          let match = new Match({
            roomName: room.name,
            player1: player1,
            player2: player2,
            tournamentInProgress: inTournament,
            tournamentName: tournamentName
          })
          match.save().then(() => {
            socket.getIo().emit("newMatch", {roomName: room.name, match: match})
            fs.writeFileSync(path.join(__dirname, "code", "bot1.py"), bot1.code)
            fs.writeFileSync(path.join(__dirname, "code", "bot2.py"), bot2.code)
            fs.writeFileSync(path.join(__dirname, "code", "getWinner.py"), game.getWinner)
            const proc = execSync("python3 " + path.join(__dirname, "code", "runMatch.py"));
            const results = proc.toString();
            const lines = results.split("\n")
            console.log(lines)
            console.log("----")
            const lastLine = lines[lines.length - 2].split(" ")
            console.log(lastLine)
            // form:
            // blahblahblah
            // Final Result (Name1 vs Name2)
            // 500 - 300
            //
            Match.findOne({_id: match._id}).then((matchFinished) => {
              matchFinished.inProgress = false;
              matchFinished.score = [parseFloat(lastLine[0]), parseFloat(lastLine[2])];
              matchFinished.transcript = results.split("[!BOT1]").join(player1.userName).split("[!BOT2]").join(player2.userName).split("\n")
              matchFinished.save().then(() => {
                socket.getIo().emit("newMatch", {roomName: room.name, match: matchFinished})
                let scoreDiff = matchFinished.score[0] - matchFinished.score[1]
                let p1score = (scoreDiff > 0 ? 1 : (scoreDiff < 0 ? 0 : 0.5))
                let p2score = 1 - p1score
                let newRating1 = 30 * (p1score - 1.0/(1.0 + Math.pow(10, (player2.rating - player1.rating)/400.0)))
                let newRating2 = 30 * (p2score - 1.0/(1.0 + Math.pow(10, (player1.rating - player2.rating)/400.0)))
                let leaderboard = room.leaderboard
                player1.rating += newRating1
                player2.rating += newRating2
                let record1 = bot1.record 
                record1[0] += p1score
                record1[1] += 1-p1score
                let record2 = bot2.record 
                record2[0] += 1-p1score 
                record2[1] += p1score
                bot1.record = record1 
                bot2.record = record2
          
                bot1.save().then(() => {
                  bot2.save().then(() => {
                    leaderboard = leaderboard.filter((entry) => {return entry.userId !== player1.userId && entry.userId !== player2.userId})
                leaderboard.push(player1)
                leaderboard.push(player2)
                room.leaderboard = leaderboard
                if(inTournament) {
                  counter -= 1
                  console.log(counter)
                  if(counter === 0) {
                    room.tournamentInProgress = false
                    room.tournamentName = "Free Play"
                    socket.getIo().emit("tournamentDone", {roomName: room.name, name: tournamentName})
                  }
                  }
                room.save().then(() => {
                  socket.getIo().emit("leaderboard", {roomName: room.name, leaderboard: leaderboard, bots: [{botId: bot1.botId, record: bot1.record}, {botId: bot2.botId, record: bot2.record}]})
                  resolve()

                })
                  })
                })
                

                
              })

            })
          
          })
          


        }
        catch (error) {
          console.log("FAILED")
          console.log(error)
        }



      })
      
    })
    

    })
  })
})
}
router.post("/runMatch", auth.ensureLoggedIn, (req, res) => {
  runMatch(req.body.player1, req.body.player2, req.body.roomName, false, "Free Play")
  
    

   
  
  
});


let runMatches = (list, current, roomName, tournamentName) => {
  if(current > list.length) return 
  runMatch(list[current][0], list[current][1], roomName, true, tournamentName).then(() => {
    runMatches(list, current+1, roomName, tournamentName)
  })
}
let counter = 0

router.post("/runTournament", auth.ensureLoggedIn, (req, res) => {
  res.send({})
  if(req.body.password !== "admin") return
  let rounds = 1

  Room.findOne({name: req.body.roomName}).then((room) => {
    room.tournamentInProgress = true 
    room.tournamentName = req.body.name
    room.save().then(() => {
      socket.getIo().emit("tournamentStart", {roomName: room.name, name: req.body.name})
      let i=0
      let j=0
      counter = room.leaderboard.length*(room.leaderboard.length - 1) /2 * rounds
      let curlist = []
      for(i=0; i<room.leaderboard.length; i++) {
        for(j=i+1; j<room.leaderboard.length; j++) {
          let player1 = room.leaderboard[i].userId
          let player2 = room.leaderboard[j].userId
          let k=0
          for(k=0; k<rounds; k++) {
            curlist.push([player1, player2])
            
          }
        }
      }
      runMatches(curlist, 0, room.name, req.body.name)
      
      
      })
    })
    
    

   
  
  
});





// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
