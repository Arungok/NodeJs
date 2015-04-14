var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var md5 = require('MD5');
var session = require('client-sessions');
var hash = require('crypto');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ci_restaurant'
});

var app = express();

// set app folder paths
app.set('views', './views');
app.set('view engine', 'jade');

// support for app
app.use(cookieParser());
app.use(bodyParser.json());  // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
  extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
  res.cookie("url", req.url);
  next();
});
app.use(session({
  cookieName: 'd2p',
  secret: 'eg[isfd-8yF9-7w2315df\'{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));
app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    next();
  }
});

var menus = {
  home: '/',
  products: '/product',
  aboutus: '/aboutus',
  contactus: '/contactus',
  login: '/login',
  register: '/register'
};

function getCurrentMenu(list, url) {
  for (var key in list) {
    if (url === list[key]) {
      return key;
    }
  }
}

function requireLogin(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    res.locals.user = req.session.user;
    next();
  }
}

app.get('/', requireLogin, function (req, res) {
  var currentpage = getCurrentMenu(menus, req.url);
  res.render('index', {
    title: 'My Node Websites',
    menu: menus,
    pageurl: currentpage
  });
});

app.get('/login', function (req, res) {
  var currentpage = getCurrentMenu(menus, req.url);
  res.render('login', {
    title: 'My Node Websites',
    menu: menus,
    pageurl: currentpage
  });
});

app.post('/user-login', function (req, res) {
  var data = req.body;
  connection.query("SELECT * FROM user WHERE email = '" + data.email + "'", function (err, rows) {
    if (rows.length === 1) {
      if (rows[0].password === md5(data.password)) {
        req.session.user = rows[0];
        res.redirect('http://' + req.headers.host + '/');
      } else {
        res.send("password didn't match");
      }
    } else {
      res.send("email doesn't exists");
    }
  });
});

app.post('/user-register', function (req, res) {
  var data = req.body;
  if (data.password === data.repassword) {
    connection.query("SELECT * FROM user WHERE email = '" + data.email + "'", function (err, rows) {
      if (rows.length === 0) {
        connection.query("INSERT INTO user (username, email, password, userrole) values ('" + data.name + "', '" + data.email + "', '" + md5(data.password) + "', 2)");
      } else {
        res.send("email exists");
      }
    });
  } else {
    res.redirect('http://' + req.headers.host + '/');
  }
});

app.get('/logout', function (req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/about', function (req, res) {
  res.send('im the about page!');
});

var server = app.listen(9080);