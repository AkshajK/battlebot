const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  challenger: {
    userId: String,
    userName: String
  },
  challenged: {
    userId: String,
    userName: String
  },
  roomName: String
});



// compile model from schema
module.exports = mongoose.model("challenge", ChallengeSchema);
