require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

const mock = {
  guests: ['guest1_id', 'guest2_id', 'guest3_id'],
};

app.get('/:loc', (req, res) => {
  const apiCall = `https://api.yelp.com/v3/businesses/search?categories=coffee&location=${req.params.loc}`;
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

app.put('/location/guests', (req, res) => {
  mock.guests.push(req.body.guest);

  console.log(mock);
  res.json(mock);
});

app.delete('/location/guests', (req, res) => {
  const idx = mock.guests.indexOf(req.body.guest);
  mock.guests.splice(idx, 1);

  console.log(mock);
  res.json(mock);
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
