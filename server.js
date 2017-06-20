require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
}));

// DB CONFIG
const User = require('./models/userModel');
const Venue = require('./models/venueModel');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/swarme');

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('user is: ', req.user);
    return next();
  }
  res.redirect('/');
}

passport.use(new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true,
  }, (req, token, tokenSecret, profile, done) => {

    User.findOne({ twitterId: profile.id }, function(err, user) {
      if (user) {
        console.log('found user');
        done(null, user);
      } else {
        console.log('save as new user');
        const newUser = {
          displayName: profile.displayName,
          twitterId: profile.id,
        };

        console.log(newUser)

        User.create(newUser).then((err, user) => {
          if (err) console.log(err);

          console.log('New user created');

          done(null, user);
        });
      }
    });
  }));

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
  const userDisplayName = req.user.displayName;

  Venue.findOne({ businessId }, (err, venue) => {
    if (!venue) {
      Venue.create({
        businessId: businessId,
        guests: [userDisplayName],
      }, (err, newVenue) => {
        res.json(newVenue);
      });
    } else {
      venue.guests.push(userDisplayName);
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

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

app.get('/', (req, res) => {
  res.render(index);
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
