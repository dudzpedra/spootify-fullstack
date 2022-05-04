var request = require('request');
require('dotenv').config()

var client_id = process.env.SPOTIFY_API_CLIENT_ID;
var client_secret = process.env.SPOTIFY_API_CLIENT_SECRET;
let token = ''
let options = {}

var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {

    // use the access token to access the Spotify Web API
    token = body.access_token;
    options = {
      url: 'https://api.spotify.com/v1/browse/new-releases',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      console.log(body.albums.items[0]);
      console.log(token)
    });
  }
});
