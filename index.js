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
    res.sendFile(path.join(path.resolve('.'), 'client/index.html'));
});

// set up socket io to listen on the same port
var io = require('socket.io').listen(http);
//var serverLogic = require('ppryer.js');

io.on('connection', function(socket){
    console.log('a user connected');
      
});

//---------configuring http -----------

// using https server
var express = require('express');
var https = require('https');
var fs = require('fs');

// This line is from the Node.js HTTPS documenttation.
var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);



