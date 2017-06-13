require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

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
  mock[businessId] = { guests: [] };
  mock[businessId].guests.push(req.body.guest);

  res.json(mock);
});

app.delete('/:businessId/guests', (req, res) => {
  const businessId = req.params.businessId;

  const removalIdx = mock[businessId].guests.indexOf(req.body.guest);
  mock[businessId].guests.splice(removalIdx, 1);

  res.json(mock);
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
