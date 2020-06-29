const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: String,
  gameName: String,
  leaderboard: {
    type: [{
      userId: String,
      userName: String,
      rating: Number,
      botId: String // EXAMPLE if no bot selected
    }],
    default: []
  },
  activeUsers: {
    type: [{
      userId: String,
      userName: String
    }],
    default: []
  },
});



// compile model from schema
module.exports = mongoose.model("room", RoomSchema);
