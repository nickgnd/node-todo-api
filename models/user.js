// USER model

var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
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
    // instanceMethods should be an object {}
    instanceMethods: {
      toPublicJSON: function () {
        var json = this.toJSON();
        return _.omit(json, 'password', 'salt', 'password_hash');
      }
    }
  });
};
