const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  roomName: String,
  player1: {
    userId: String,
    userName: String
  },
  player2: {
    userId: String,
    userName: String
  },
  inProgress: {
    type: Boolean,
    default: true
  },
  score: {
    type: Array,
    default: [0.0, 0.0]
  },
  transcript: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now

  },
  inTournament: {
    type: Boolean,
    default: false
  },
  tournamentName: {
    type: String,
    default: "Free Play"
  }


});



// compile model from schema
module.exports = mongoose.model("match", MatchSchema);
