var express = require('express');
var findElement = require('./findElement.js');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
  id: 1,
  description: 'Cooks for everybody',
  completed: false
}, {
  id: 2,
  description: 'Buy chicken and senape',
  completed: false
}, {
  id: 3,
  description: 'Clean the kitchen',
  completed: true
}];

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

  findElement(todoId, todos).then(function(todo) {
    res.json(todo);
  }).catch(function(e) {
    console.log(e);
    res.status(404).send();
  });

});

app.listen(PORT, function () {
  console.log("Express listening on PORT " + PORT);
});
