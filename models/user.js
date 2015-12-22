// Todo model
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [7,20]
      }
    }
  });
};
