// Set equal to a function instead of an object because now we have other file
// pass in configuration date. (db)
// --> we need arguments (??)

var cryptojs = require('crypto-js');

module.exports = function (db) {

  // inside the object define every middleware
  return {
    requireAuthentication: function (req, res, next) {
      var token = req.get('Auth') || '';

      db.token.findOne({                               // 1) look for the token in DB
        where: {
          tokenHash: cryptojs.MD5(token).toString()
        }
      }).then(function (tokenInstance) {              // 2) look for the user with this token

        // check if token exists
        if (!tokenInstance) {                         // 3) If no token raise an error and break the chain
          throw new Error();
        }

        req.token = tokenInstance;
        return db.user.findByToken(token); // keep the chain alive

      }).then(function (user) {                       // 4) Update the request
          // Add user to the request
          req.user = user;
          next();
      }).catch(function (e) {                          // *) Catch authentication error
          console.log(e);
          res.status(401).send();
      });

    }
  };
};
