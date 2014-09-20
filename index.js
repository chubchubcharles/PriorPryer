// app is a function handler given to the actual server
var app = require('express')();
var http = require('http').Server(app);

// path module to handle file paths easily
var path = require('path');

// defines port the server listens on
http.listen(3000, function(){
          console.log('listening on *:3000');
});

// route handler called when website home hit
app.get('/', function(req, res){
      // note: sending files will require an absolute path
      res.sendFile(path.join(path.resolve('.'), 'index.html'));
});

var io = require('socket.io').listen(http);

io.on('connection', function(socket){
      console.log('a user connected');
});
