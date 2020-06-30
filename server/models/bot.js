const mongoose = require("mongoose");

const BotSchema = new mongoose.Schema({
  name: String,
  botId: String,
  user: {
    userId: String, // EXAMPLE if its an example
    userName: String
  },
  code: String,
  gameName: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Boolean,
    default: false
  }
});



// compile model from schema
module.exports = mongoose.model("bot", BotSchema);
