module.exports = function (id, todos) {
    return new Promise(function (resolve, reject) {
      var match = false;
      todos.some(function (e) {
        if (e.id === id) {
          match = true;
          resolve(e);
        }
      });
      if (!match) {
        reject('Element not found.');
      }
    });
  }
