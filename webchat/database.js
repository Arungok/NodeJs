module.exports = function (appObj) {
  appObj.connection.connect(function () {
    getUsers(appObj.connection);
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