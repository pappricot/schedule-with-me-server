'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();
const {runAgenda, agenda} = require("./agenda");

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const eventsRouter = require('./events/router');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(express.json());

//new directory called /build, and we need to make sure we’re telling Express to use it
app.use( express.static( `${__dirname}/../build` ) );

app.get('/api/test', function (req, res) {
  //agenda.schedule('in 10 seconds', 'print message', {})
  res.json(
    [
      "Bath Blue",
      "Barkham Blue",
      "Buxton Blue",
      "Cheshire Blue",
      "Devon Blue",
      "Dorset Blue Vinney",
      "Dovedale",
      "Exmoor Blue",
      "Harbourne Blue",
      "Lanark Blue",
      "Lymeswold",
      "Oxford Blue",
      "Shropshire Blue",
      "Stichelton",
      "Stilton",
      "Blue Wensleydale",
      "Yorkshire Blue"
  ]
  )
})

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/events/', eventsRouter);

//this is a middleware (which is a function) gets returned from a function
const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// endpoint that lets other routes know how to get to index.html
const path = require('path')
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, '../build/index.html'));
})

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
      runAgenda();
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
