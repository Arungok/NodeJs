module.exports = function (appObj) {
  var conn = appObj.connection;
  conn.connect(function () {
    getUsers(appObj.connection);
  });

  var app = appObj.app;
  app.get('/usercount', function (req, res) {
    var strQuery = "SELECT * FROM users u JOIN logged_in_users lu ON lu.userid = u.userid";
    conn.query(strQuery, function (err, rows) {
      if (err) {
        throw err;
      } else {
        console.log(rows);
      }
    });
  });

};

function getUsers(connection) {
  var strQuery = "select * from user";
  connection.query(strQuery, function (err, rows) {
    if (err) {
      throw err;
    } else {
      console.log(rows);
    }
  });
}

function getLoggedInUsers(connection) {

}