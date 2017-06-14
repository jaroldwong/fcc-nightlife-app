require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jwt-simple');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// DB CONFIG
const User = require('./models/user');
const Venue = require('./models/venue');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/swarme');

// PASSPORT CONFIG
const requireAuth = passport.authenticate('jwt', { session: false });
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.SECRET,
};

passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
  User.find({ username: payload.sub }, (err, user) => {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
}));

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {
    const user = {
      displayName: profile.displayName,
      facebookId: profile.id,
      facebookToken: accessToken,
    };

    done(null, user);
  }));

function encodeToken(user) {
  const timestamp = new Date().getTime();
  const payload = {
    sub: user.username,
    iat: timestamp,
  };

  return jwt.encode(payload, process.env.SECRET);
}


app.get('/:location', (req, res) => {
  const apiCall = `https://api.yelp.com/v3/businesses/search?categories=coffee&location=${req.params.location}&limit=5`;
  const authHeader = {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  };

  axios.get(apiCall, { headers: authHeader })
    .then((response) => {
      res.json(response.data.businesses);
    }).catch((err) => {
      console.error(err);
    });
});

app.post('/:businessId/guests', requireAuth, (req, res) => {
  const businessId = req.params.businessId;
  const userId = req.user[0]._id;

  Venue.findOne({ businessId }, (err, venue) => {
    if (!venue) {
      Venue.create({
        businessId: businessId,
        guests: [userId],
      }, (err, newVenue) => {
        res.json(newVenue);
      });
    } else {
      venue.guests.push(userId);
      venue.save()
        .then((updatedVenue) => {
          res.json(updatedVenue);
        });
    }
  });
});

app.delete('/:businessId/guests', (req, res) => {
  const businessId = req.params.businessId;

  Venue.findOne({ businessId }, (err, venue) => {
    if (err) { console.error(err); }

    const removeIdx = venue.guests.indexOf(req.body.userId);
    venue.guests.splice(removeIdx, 1);
    venue.save();
  });
});

// AUTH ROUTES
app.get('/auth/facebook', passport.authenticate('facebook', { session: false }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  // successRedirect: 'localhost:8080',
  // failureRedirect: '/error',
  session: false,
}), (req, res) => {
  console.log(req.user);
  res.redirect('localhost:8080');
});

app.post('/signup', (req, res) => {
  // save a user to db after they authenticate with oauth
});

app.post('/login', (req, res) => {
  // check if user is saved in db

  // send back token
  res.json({ success: true, token: encodeToken(req.body) });
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
