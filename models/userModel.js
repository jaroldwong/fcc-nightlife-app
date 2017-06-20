const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  displayName: String,
  twitterId: String,
});

module.exports = mongoose.model('user', UserSchema);
