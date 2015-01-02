// setup for application
// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path')

// Create a new instance of Express 
var app = express();

// Import the PriorPryer game file.
// var ppr = require('./priorpryer');

// Create a simple Express application

  // Serve static html, js, css and image files from the 'path'
  app.use(express.static(path.join(__dirname,'public')));


var http = require('http').Server(app);
var io = require('socket.io')(http);
// io = server, client = client

// io server instance listens for "connection" event and then console.logs
io.sockets.on('connection', function(client){
  var answer;
	// broadcast.emit will send to all except socket sender  
	client.broadcast.emit('user connected');
  client.on('chat message', function(msg){
    // console.log("Message:" + msg);
    // console.log("Answer:" + answer);
  	// server upon receiving "chat message" event, also fires an event with the same name with the msg
    io.emit('chat message', msg); 
    if (msg === answer){
      io.emit('correct answer');
    }
  });
  client.on('new question', function(msg){
    // console.log("New Question, Answer is " + msg);
    answer = msg;
  });
  client.on('disconnect', function(msg){
    io.emit('disconnect', "user disconnected");
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


