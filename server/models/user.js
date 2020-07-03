const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  userName: String,
  admin: {
    type: Boolean,
    default: false
  }
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
