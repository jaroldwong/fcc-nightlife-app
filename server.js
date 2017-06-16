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
  User.find({ facebookId: payload.sub }, (err, user) => {
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
    callbackURL: 'http://localhost:8080',
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {

    User.findOne({ facebookId: profile.id }, function(err, user) {
      if (user) {
        console.log('found user');
        done(null, user);
      } else {
        console.log('save as new user');
        const newUser = {
          displayName: profile.displayName,
          facebookId: profile.id,
          facebookToken: accessToken,
        };

        User.create(newUser).then((err, user) => {
          if (err) console.log(err);

          console.log('New user created');

          done(null, user);
        });
      }
    });
  }));

function encodeToken(user) {
  const timestamp = new Date().getTime();
  const payload = {
    sub: user,
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
  console.log(req.user)
  const userId = req.user[0].facebookId;

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
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

app.delete('/:businessId/guests', requireAuth, (req, res) => {
  const businessId = req.params.businessId;

  Venue.findOne({ businessId }, (err, venue) => {
    if (err) { console.error(err); }

    const removeIdx = venue.guests.indexOf(req.body.userId);
    venue.guests.splice(removeIdx, 1);
    venue.save()
      .then(() => {
        res.send('successful delete from guest list');
      });
  });
});

app.post('/auth/facebook', (req, res) => {
  const authToken = `Bearer ${req.body.token}`;

  axios.get('https://graph.facebook.com/me?fields=id,name', {
    headers: { Authorization: authToken },
  })
    .then((response) => {
      const user = response.data;
      res.send(encodeToken(user.id));
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
