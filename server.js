require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

var API = "https://api.yelp.com/v3/businesses/search?categories=coffee&location=95618"
var auth_header = {
  "Authorization": "Bearer " + process.env.ACCESS_TOKEN,
}

app.get('/', (req, res) => {
  axios.get(API, {headers: auth_header})
  .then((response) => {
    res.json(response.data.businesses);
  }).catch((err) => {
    console.error(err);
  });
});

app.listen(3000, () => {
  console.log('Server listening on 3000');
});