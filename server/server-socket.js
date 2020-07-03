let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const Room = require("./models/room");
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user._id];
  delete socketToUserMap[socket.id];
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        if(user) {
          let userId = user._id
          removeUser(user, socket);
          setTimeout(() => {
            if(getSocketFromUserID(userId)) return;
            Room.find({}).then((rooms) => {
              rooms.forEach((room) => {
              let activeUsers = room.activeUsers
              let len = activeUsers.length 
              activeUsers = activeUsers.filter((userr) => {return userId !== userr.userId})
              if(len != activeUsers.length) {
              room.activeUsers = activeUsers 
              let leaderboard = room.leaderboard
              let ourGuy = leaderboard.filter((userr) => {return userId === userr.userId})
              let leaderboardChanged = false
              if((ourGuy.length > 0) &&(!getSocketFromUserID(userId))) {
                if(ourGuy[0].botId === "EXAMPLE") {
               console.log("new leaderboard user")
               leaderboard = leaderboard.filter((userr) => {return userId !== userr.userId})
               room.leaderboard = leaderboard
               leaderboardChanged = true 
                }
              } 
          
          
              room.save().then(() => {
                io.emit("message", {roomName: room.name, message: user.userName + " left the room", type: "userJoinsOrLeaves"})
                io.emit("leaveRoom", {roomName: room.name, user: {userId: userId, userName: user.userName}, left: leaderboardChanged})
               
              })
              }
              
              
            })
            })
          }, 1000)
        }
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
