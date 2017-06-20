const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  businessId: {
    type: String,
    require: true,
  },
  guests: [],
});

const Venue = mongoose.model('venue', VenueSchema);

module.exports = Venue;
