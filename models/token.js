// The model stores in the table only the tokenHash,
// the token is a virtual attributes not stored in the table !

var cryptojs = require('crypto-js');

module.exports = function (sequelize, DataTypes) {

  return sequelize.define('token', {
    token: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [1]
      },
      set: function (value) {
        var hash = cryptojs.MD5(value).toString();

        this.setDataValue('token', value);
        this.setDataValue('tokenHash', hash);
      }
    },
    tokenHash: {
      type: DataTypes.STRING
    }
  });
};
