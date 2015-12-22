// Todo model
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('todo', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 250]
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        // isIn: [[true, false]]
        isBoolean: function (value) {
          if (typeof value !== 'boolean') {
            throw new Error('Completed must be a boolean');
          }
        }
      }
    }
  });
};


// Note: SQLite uses dynamic typing. It does not enforce data type constraints.
// Data of any type can (usually) be inserted into any column.
// https://www.sqlite.org/faq.html#q3
