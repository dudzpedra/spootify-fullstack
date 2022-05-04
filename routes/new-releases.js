const router = require('express').Router()
require('dotenv').config()

const client_id = process.env.SPOTIFY_API_CLIENT_ID;
const client_secret = process.env.SPOTIFY_API_CLIENT_SECRET;
let token = ''
let options = {}

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

router.post(authOptions, async (req, res) => {
  if (res.status === 200) {
    console.log('status 200')
    token = body.access_token;
    options = {
      url: 'https://api.spotify.com/v1/browse/new-releases',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    router.get(options, function(req, res) {
      console.log(res.body.albums.items[0]);
    });
  }
})


module.exports = router