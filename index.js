require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const queryString = require("querystring");
const path = require('path')
const app = express();

const PORT = process.env.PORT || 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(express.json());
app.use(cors());

app.get("/", (req, res) =>
  res.send("Spotify Web Api - This an Express server")
);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = "spotify_auth_state";

const scope = "user-read-private user-read-email";

app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const queryParams = queryString.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    scope,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      data: queryString.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        content_type: "application/x-www-form-urlencoded",
        Authorization: `Basic ${new Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });
    if (response.status === 200) {
      const { token_type, access_token, expires_in, refresh_token } = response.data;
      const queryParams = queryString.stringify({
        access_token,
        token_type,
        expires_in,
        refresh_token
      });
      res.redirect(`${FRONTEND_URI}/?${queryParams}`)
    } else {
      res.redirect(`/?${queryString.stringify({ error: 'invalid_token' })}`)
    }
  } catch (error) {
    res.send(error);
  }
});

app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
    res.send(response.data)
  } catch (error) {
    res.send(error);
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
