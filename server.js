require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');

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
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser());

const mock = {};

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

app.post('/:businessId/guests', (req, res) => {
  const businessId = req.params.businessId;
  const userId = req.body.userId;

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
app.post('/signup', (req, res) => {
  const newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
    }

    res.send('Successful signup');
  });
});

app.get('/login', passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('user logged in');
    res.send('Successful login');
  });

app.get('/logout', (req, res) => {
  req.logout();
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
