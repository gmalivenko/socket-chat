'use strict';

let debug = require('debug')('app');

let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let bodyParser = require('body-parser');
let session = require('express-session');

app.use(session({
  secret: 'session secret key 12345',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 60000 },
}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('morgan')('combined'));

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', require('./socket')(io));

server.listen(8000, () => {
  debug('Server is listening.');
});