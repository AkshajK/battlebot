const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: String,
  rules: String,
  getWinner: String,

});



// compile model from schema
module.exports = mongoose.model("game", GameSchema);
