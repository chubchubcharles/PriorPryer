// setup for application
// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path')

// Create a new instance of Express 
var app = express();

// Import the PriorPryer game file.
var ppr = require('./pprgame');

// Create a simple Express application

  // Serve static html, js, css and image files from the 'path'
  app.use(express.static(path.join(__dirname,'public')));

// Create a Node.js based http server on port 3000
var server = require('http').createServer(app).listen(3000, function(){
  console.log('listening on *:3000');
});

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Listens for Socket.IO Connections. Once connected, game logic.
io.sockets.on('connection', function (socket){
  ppr.initGame(io, socket);
});



