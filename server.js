var express = require('express');
var bodyParser = require('body-parser'); // => middleware
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

// every Json request comes in is parsed by express
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Todo API Root");
});

// GET - /todos
app.get('/todos', function(req, res) {
  var query = req.query;
  // var filteredTodos = todos;
  var where = {}

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
  }).then(function(todos) {
    res.status(200).json(todos);
  }, function(e) {
    res.status(500).send();
  });

});

// GET - /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);

  // search for known id
  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) {
      res.status(200).json(todo.toJSON());
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });
});

// POST - /todos
app.post('/todos', function(req, res) {
  var body = req.body;

  // whitelistening element
  var body = _.pick(body, 'completed', 'description');

  // with callbacks
  db.todo.create(body).then(function(todo) { // success callback
    res.status(201).json(todo.toJSON());
  }, function(e) { // error callback
    res.status(422).json(e);
  });

  // // with promises ?
  // db.todo.create({
  //   description: body.description.trim(),
  //   completed: body.completed
  // }).then(function (todo) {
  //   return res.status(201).json(todo);
  // }).catch(function (e) {
  //   return res.status(422).json(e);
  // });

});

// PUT - /todos/:id
app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  // whitelistening element
  var body = _.pick(req.body, 'completed', 'description');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function(todo) {
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
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);

  db.todo.destroy({
    where: {
      id: todoId
    }
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

app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function (user) {
    res.status(200).json(user.toPublicJSON());
  }, function (status) {
    res.status(status).send();
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
