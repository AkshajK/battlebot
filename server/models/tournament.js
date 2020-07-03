const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  name: String,
  roomName: String,
  records: {
    type: [{
      userId: String,
      userName: String,
      record: {
        type: Number,
        default: 0
      }
    }],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  winner: {
    userId: String,
    userName: String
  }
});



// compile model from schema
module.exports = mongoose.model("tournament", TournamentSchema);
