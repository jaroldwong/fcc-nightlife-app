require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(express.static('public'));
app.use(cors());

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

app.listen(3000, () => {
  console.log('Server listening on 3000');
});
