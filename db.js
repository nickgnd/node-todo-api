// return db connection

var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
  dialect: 'sqlite',
  storage: __dirname + '/data/todo-api-development.sqlite'
  }); // create instance of Sequelize
}


var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js') // load sequelize model from separate files
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
