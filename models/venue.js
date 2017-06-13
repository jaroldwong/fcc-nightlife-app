const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  businessId: {
    type: String,
    require: true,
  },
  guests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
});

const Venue = mongoose.model('venue', VenueSchema);

module.exports = Venue;
