// This is the main file of our chat app. It initializes a new
// express.js instance, requires the config and routes files
// and listens on a port. Start the application by running
// 'node app.js' in your terminal


var express = require('express'),
        app = express();

// This is needed for the session
var session = require('express-session');

var bodyParser = require('body-parser');

var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(session({
  secret: 'ssshhh',
  name: '_secret_',
  // store: '_secret_store_', // connect-mongo session store
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// This is needed if the app is run on heroku:
var port = process.env.PORT || 80;

// Initialize a new socket.io object. It is bound to
// the express app, which allows them to coexist.
var io = require('socket.io').listen(app.listen(port));

// This is used to connect database to the node app
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ci_restaurant'
});

// Require the configuration and the routes files, and pass
// the app and io as arguments to the returned functions.

// app objects
var appObj = {
  app: app,
  io: io,
  connection: connection,
  session: session,
  port: port
};

require('./config')(appObj);
require('./routes')(appObj);
require('./sessions')(appObj);
require('./database')(appObj);

console.log('Your application is running on http://localhost:' + port);