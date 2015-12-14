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
  var body = req.body;

  // whitelistening element
  var body = _.pick(body, 'completed', 'description');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return res.status(400).send();
  }

  body.id = todoNextId++; // before set body.id equal to todoNextId and then increment it

  // trim body.description
  body.description = body.description.trim();
  todos.push(body);

  res.status(201).json(body);
});

// PUT - /todos/:id
app.put('/todos/:id', function(req, res) {
  var body = req.body;
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  // whitelistening element
  var body = _.pick(body, 'completed', 'description');
  var validAttributes = {};


  if (!matchedTodo) {
    return res.status(404).send(); // IMPORTANT: user return to exit from the block, otherwise it continue
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    console.log("here");
    console.log(_.isBoolean(body.completed));
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    // is not valid
    return res.status(422).json({"error": "unprocessable entity"});
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    // is not valid
    return res.status(422).json({"error": "unprocessable entity"});
  }


  _.extend(matchedTodo, validAttributes);
  id = matchedTodo.id
  res.status(204).location('/todos/' + id).send();


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
