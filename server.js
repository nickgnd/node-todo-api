var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

// todos will be our model
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

  function findElementInArray(id, todos) {
    return new Promise(function (resolve, reject) {
      var match = false;
      todos.some(function (e) {
        if (e.id === todoId) {
          match = true;
          resolve(e);
        }
      });
      if (!match) {
        reject('Element not found');
      }
    });
  }

  findElementInArray(todoId, todos).then(function(todo) {
    res.json(todo);
  }).catch(function() {
    res.status(404).send();
  });

});

app.listen(PORT, function () {
  console.log("Express listening on PORT " + PORT);
});
