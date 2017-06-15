const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: String,
  facebookId: String,
  facebookToken: String,
});

module.exports = mongoose.model('user', UserSchema);
