var fs = require('fs');
var express = require('express');
var https = require('https');
var key = fs.readFileSync('./key.pem');
var cert = fs.readFileSync('./cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var path = require('path');
var PORT = 8000;
var HOST = 'localhost';
app = express();
var server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);
// set up socket io to listen on the same port
var io = require('socket.io').listen(server);
var fbnames = {};
var scores = {};
var numPlayers = 0;

app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('add user', function (name) {
        console.log('adding user');
        socket.name = name;
        fbnames[name] = name;
        scores[name] = 0;
        ++numPlayers;

        // get the list of mutual friends and posts
        if (numPlayers === 1) {
            console.log('first player');
            socket.emit('request players', {
                name: name
            }); 
        } else if (numPlayers >= 2) {
            socket.emit('enable start');
        }
    });
});
