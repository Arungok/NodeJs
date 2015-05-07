var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var md5 = require('MD5');
var session = require('express-session');
var hash = require('crypto');
var path = require('path');
var favicon = require('serve-favicon');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs'
});
var app = express();

// set app folder paths
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// supports for app
console.log(path.join(__dirname, 'public', 'img', 'favicon.ico'));
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(cookieParser());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.cookie("url", req.url);
  next();
});
app.use(session({
  secret: 'egar[isufd-n8yF9-7kaw231r5dft\'{h}+Iijkasli;lo;vtoe8',
  name: '_secret_',
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
// This is needed if the app is run on heroku:
var port = process.env.PORT || 80;
// Initialize a new socket.io object. It is bound to
// the express app, which allows them to coexist.
var io = require('socket.io').listen(app.listen(port));
app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next();
  }
});

var menus = {};
var title = "Romeo & Juliet";

function unixTime() {
  return new Date() / 1000;
}

function getCurrentMenu(list, url, title) {
  var sel = null;
  for (var key in list) {
    if (url === list[key]) {
      sel = key;
    }
  }
  var ret = {
    title: title,
    menu: menus
  };
  if (sel !== null)
    ret['pageurl'] = sel;
  return ret;
}

function requireLogin(req, res, next) {
  menus = {
    home: '/',
    products: '/product',
    aboutus: '/aboutus',
    contactus: '/contactus'
  };
  if (!req.session.user) {
    menus["login"] = "/login";
    menus["register"] = "/register";
    res.redirect('/login');
  } else {
    menus["logout"] = "/logout";
    res.locals.user = req.session.user;
    next();
  }
}

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
require('./database')(appObj);