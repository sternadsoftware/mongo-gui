#!/usr/bin/env node
// eslint-disable-next-line strict
require('dotenv').config();
const cors = require('cors');
const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const bodyParser = require('body-parser');
const gzipProcessor = require('connect-gzip-static');
const databasesRoute = require('./src/routes/database');
const dataAccessAdapter = require('./src/db/dataAccessAdapter');
const passport = require('passport');
const authenticateToken = require('./src/middleware/authenticateToken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'jwt-secret-key-changeme';
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// initialize app
const app = express();

// serve static files form public
app.use(express.static('public'));

// process gzipped static files
app.use(gzipProcessor(__dirname + '/public'));

// enables cors
app.use(cors());

app.use(passport.initialize({}));

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET_KEY;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  const fakeUser = { id: jwt_payload.sub, username: 'username' };
  done(null, fakeUser);
}));

function conditionalAuth(req, res, next) {
  const excludedPaths = ['/public/index.html', '/login'];
  if (excludedPaths.includes(req.path)) {
    // Skip the authentication middleware for above paths
    next();
  } else {
    // Apply the authentication middleware for all other paths
    authenticateToken(req, res, next);
  }
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: process.env.BODY_SIZE || '50mb' }));

// Route to login and receive JWT
app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;

  const envUsername = process.env.MONGOGUI_USERNAME;
  const envPassword = process.env.MONGOGUI_PASSWORD;

  if (!envUsername || !envPassword) {
    res.status(500).send("No username and password env variables provided. Please set the USERNAME and PASSWORD variables in your environment and restart the application");
    return;
  }

  if(!username || !password) {
    res.status(400).send('Username and password are required');
    return;
  }
  if(username === envUsername && password === envPassword) {
    const token = require('jsonwebtoken').sign({ sub: 1 }, JWT_SECRET_KEY);
    res.send({ token: token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});


// api routing
app.use('/databases', databasesRoute);

// serve home page
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));


// connect to database
dataAccessAdapter.InitDB(app);

// listen on :port once the app is connected to the MongoDB
app.once('connectedToDB', () => {
  const port = argv.p || process.env.PORT || 4321;
  app.listen(port, () => {
    console.log(`> Access Mongo GUI at http://localhost:${port}`);
  });
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  const error = {
    errmsg: err.errmsg,
    name: err.name
  };
  return res.status(500).send(error);
});
