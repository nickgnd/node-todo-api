// Set equal to a function instead of an object because now we have other file
// pass in configuration date. (?)
// --> we need arguments (?)

module.exports = function (db) {

  // inside the object define every middleware
  return {
    requireAuthentication: function (req, res, next) {
      var token = req.get('Auth');

      db.user.findByToken(token).then(function (user) {
        // Add user to the request
        req.user = user;
        next();
      }, function () {
        res.status(401).send();
      });
    }
  };
};
