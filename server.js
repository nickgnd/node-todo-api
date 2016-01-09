var express = require('express');
var bodyParser = require('body-parser'); // => middleware
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

// middleware
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

// every Json request comes in is parsed by express
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET - /todos
app.get('/todos', middleware.requireAuthentication, function(req, res) {
  var query = req.query;

  var where = {
    userId: req.user.get('id')  // use ".get('id')"" instead of ".id" to follow
  };                            // the 'Encapsulation' pattern:
                                // is best practice to make the value itself
                                // protected/private (not accessible with a
                                // direct call like req.user.id) and instead
                                // only provide a public getter method.

  if (query.hasOwnProperty('completed') && _.contains(['true', 'false'], query.completed)) {
    where.completed = eval(query.completed);
  }

  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      // NOT WORK ON POSTGRES -> use $iLike instead
      // http://docs.sequelizejs.com/en/latest/docs/querying/#operators
      $like: '%' + query.q + '%'
    }
  }

  db.todo.findAll({
    where: where
  }).then(function (todos) {
    res.status(200).json(todos);
  }, function (e) {
    res.status(500).send();
  });

});

// GET - /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = parseInt(req.params.id, 10);

  var where = {
    userId: req.user.get('id'),
    id: todoId
  };

  // search for known id and userId
  db.todo.findOne({where: where}).then(function (todo) {
    if (!!todo) {
      res.status(200).json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });
});

// POST - /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
  // whitelistening element
  var body = _.pick(req.body, 'completed', 'description');

  // with callbacks
  db.todo.create(body).then(function(todo) { // success callback

    // req.user is add after the authentication (see middleware)
    req.user.addTodo(todo).then(function () {

      // we need to Reload todo's instance beacuse we add to it the association
      // with the user
      return todo.reload();

    }).then(function (todo) {
      res.status(201).json(todo.toJSON());
    });
  }, function (e) { // error callback
    res.status(422).json(e);
  });

});

// PUT - /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var where = {
    userId: req.user.get('id'),
    id: todoId
  };
  // whitelistening element
  var body = _.pick(req.body, 'completed', 'description');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findOne({where: where}).then(function(todo) {
    if (!!todo) {

      todo.update(attributes).then(function(todo) { //follow up to todo.update(...)
        res.status(201).json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });

    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });

});


// DELETE - /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var where = {
    userId: req.user.get('id'),
    id: todoId
  };

  db.todo.destroy({
    where: where
  }).then(function(rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({
        "error": "element not found"
      });
    } else {
      res.status(204).send();
    }
  }, function(e) {
    res.status(500).json(e);
  });

});

// POST - /users
app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user) { // success callback
    res.status(201).json(user.toPublicJSON());
  }, function(e) { // error callback
    res.status(422).json(e);
  });

});

// POST - /users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');
  var userInstance;

  db.user.authenticate(body).then(function (user) { // this fnct run after authentication
    var token = user.generateToken('authentication');
    userInstance = user;

    // save the token in db
    return db.token.create({
      token: token // it will be converted -> hash
    });

    // if (token) {
    //   res.status(200).header('Auth', token).json(user.toPublicJSON());
    // } else {
    //   res.status(500).send();
    // }
  }).then(function (tokenInstance) { // this fnct run after token is created
    res.status(200).header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
  }).catch(function (status) { // this fnct run if smthg went wrong
    res.status(status).send();
  });

});


// DELETE - /users/logout
app.delete('/users/logout',  middleware.requireAuthentication, function(req, res) {
  req.token.destroy().then(function () {
    res.status(204).send();
  }).catch(function (e) {
    // console.log(e);
    res.status(500).send();
  });
});


// sequelize.sync() will, based on your model definitions, create any missing tables.
// If force: true it will first drop tables before recreating them.
// --> Use it to re-create the schema of the DB
// --> Use it with attention in production.
// db.sequelize.sync({force: true}).then(function() {
db.sequelize.sync({force: true}).then(function() {
  app.listen(PORT, function() {
    console.log("Express listening on PORT " + PORT);
  });
});
