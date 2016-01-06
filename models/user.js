// USER model

var bcrypt = require('bcrypt');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true // specific validation provided by Sequelize
      }
    },
    salt : {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL, // not stored in the DB
      allowNull: false,
      validate: {
        len: [7,20]
      },
      set: function (value) {
        var salt = bcrypt.genSaltSync(10); // generate salt
        var hashedPassword = bcrypt.hashSync(value, salt); // generate hashed pwd

        // update value
        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function (resolve, reject) {

            // basic validation
            if (typeof body.email !== 'string' || typeof body.password !== 'string') {
              return reject(400); // status --> 400
            }

            // findOne where email and in the callback verify pwd
            user.findOne({ where: {email: body.email}}).then(function (user) {

              // guard clause: check user existence and password match
              if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                return reject(401); // status --> 401
              }

              resolve(user);

            }, function (e) {
              return reject(500); // status --> 500
            });

        });
      },
      findByToken: function (token) {
        return new Promise(function (resolve, reject) {
          try {
            var secret = 'abc123!°°&&%';
            var decodedJWT = jwt.verify(token, 'francia98');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, secret);
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

            user.findById(tokenData.id).then(function (user) {
              if (user) {
                resolve(user);
              } else {
                reject(); // ex. if id provided not exists inside DB
              }
            }, function (e) {
              reject(); // ex. if findById fails --> DB not connected
            });
          } catch (e) { // ex. token is invalid format
            reject();
          }
        });
      }
    },
    // instanceMethods should be an object {}
    instanceMethods: {
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.omit(json, 'password', 'salt', 'password_hash');
      },
      generateToken: function (type) { // JWT
        if (!_.isString(type)) {
          return undefined;
        }

        try {
          var stringData = JSON.stringify({id: this.get('id'), type: type});
          var secret = 'abc123!°°&&%';
          var encryptedData = cryptojs.AES.encrypt(stringData, secret).toString();
          var token = jwt.sign({
            token: encryptedData
          }, 'francia98');

          return token;

        } catch (e) {
          // console.log(e);
          return undefined;
        }

      }
    }
  });

  return user;
};
