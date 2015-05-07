/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// gravatar module
var gravatar = require('gravatar');

module.exports = function (appObj) {
  // user login || dashboard page decider
  var app = appObj.app;
  var menus = appObj.menus;
  var title = appObj.title;
  var io = appObj.io;
  var connection = appObj.connection;

  app.get('/dashboard', requireLogin, userDashboard);
  app.get('/', requireLogin, userDashboard);
  function userDashboard(req, res) {
    res.render('dashboard', getCurrentMenu(menus, req.url, title));
  }

  app.get('/login', function (req, res) {
    res.render('login', getCurrentMenu(menus, req.url, title));
  });

  app.post('/user-login', function (req, res) {
    var data = req.body;
    connection.query("SELECT * FROM users WHERE email = '" + data.email + "'", function (err, rows) {
      if (rows.length === 1) {
        var _r = rows[0];
        if (_r.password === md5(data.password)) {
          req.session.user = _r;
          connection.query("DELETE FROM logged_in_users WHERE userid = " + _r.userid);
          connection.query("INSERT INTO logged_in_users (userid) VALUES (" + _r.userid + ")", function (err, rows) {
            res.redirect('http://' + req.headers.host + '/dashboard');
          });
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
      connection.query("SELECT * FROM users WHERE email = '" + data.email + "'", function (err, rows) {
        if (rows.length === 0) {
          connection.query("INSERT INTO users (username, email, password, userrole) values ('" + data.name + "', '" + data.email + "', '" + md5(data.password) + "', 2)");
          res.redirect('/login');
        } else {
          res.send("email exists");
        }
      });
    } else {
      res.redirect('http://' + req.headers.host + '/');
    }
  });

  app.get('/logout', function (req, res) {
    connection.query("DELETE FROM logged_in_users WHERE userid = " + req.session.user.userid + ")", function (err, rows) {
      req.session.destroy(function () {
        res.redirect('/');
      });
    });
  });

  app.get('/about', function (req, res) {
    res.send('im the about page!');
  });

  // Initialize a new socket.io application, named 'chat'
  var chat = io.of('/socket').on('connection', function (socket) {
    socket.on('load', function (data) {
      var room = findClientsSocket(io, data, '/socket');
      if (room.length === 0) {
        socket.emit('peopleinchat', {number: 0});
      } else if (room.length === 1) {
        socket.emit('peopleinchat', {
          number: 1,
          user: room[0].username,
          avatar: room[0].avatar,
          id: data
        });
      } else if (room.length >= 2) {
        chat.emit('tooMany', {boolean: true});
      }
    });
    socket.on('login', function (data) {
      var room = findClientsSocket(io, data.id, '/socket');
      if (room.length < 2) {
        socket.username = data.user;
        socket.room = data.id;
        socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
        socket.emit('img', socket.avatar);
        socket.join(data.id);
        if (room.length == 1) {
          var usernames = [],
                  avatars = [];
          usernames.push(room[0].username);
          usernames.push(socket.username);
          avatars.push(room[0].avatar);
          avatars.push(socket.avatar);
          chat.in(data.id).emit('startChat', {
            boolean: true,
            id: data.id,
            users: usernames,
            avatars: avatars
          });
        }
      } else {
        socket.emit('tooMany', {boolean: true});
      }
    });
    socket.on('disconnect', function () {
      socket.broadcast.to(this.room).emit('leave', {
        boolean: true,
        room: this.room,
        user: this.username,
        avatar: this.avatar
      });
      socket.leave(socket.room);
    });
    socket.on('msg', function (data) {
      socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
    });
    socket.on('typing', function (data) {
      socket.broadcast.to(socket.room).emit('typeingId', {user: data.user});
    });
  });
};