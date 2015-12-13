var express = require('express');
var bodyParser = require('body-parser'); // => middleware
// var findElement = require('./findElement.js');

var _ = require('underscore');

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
  res.json(todos);
});

// GET - /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }

});

// POST - /todos
app.post('/todos', function(req, res) {
  body = req.body;

  // whitelistening element
  body = _.pick(body, 'completed', 'description');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.id = todoNextId++; // before set body.id equal to todoNextId and then increment it

  // trim body.description
  body.description = body.description.trim();
  todos.push(body);

  res.status(201).json(body);
});


// DELETE - /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    todos = _.without(todos, matchedTodo)
    res.status(204).send();
  } else {
    res.status(404).json({"error": "element not found"});
  }
});

app.listen(PORT, function () {
  console.log("Express listening on PORT " + PORT);
});
