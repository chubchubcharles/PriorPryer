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
var cors = require('cors');
app = express();
app.use(cors());
var server = https.createServer(https_options, app).listen(PORT);
console.log('HTTPS Server listening on port:%s', PORT);
// set up socket io to listen on the same port
var io = require('socket.io').listen(server);
var fbnames = {};
var scores = {};
var numPlayers = 0;
var round = 0;
var MAX_ROUNDS = 5;
var MAX_PLAYERS = 4;
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket){
        console.log('a user connected');

        socket.on('add user', function (name) {
            if (numPlayers < MAX_PLAYERS) {
                console.log('adding user');
                socket.name = name;
                fbnames.push(name);
                scores.push(0);
                ++numPlayers;

                // get the list of mutual friends and posts
                if (numPlayers === 1) {
                    console.log('first player');
                    socket.emit('find players', {
                        name: name
                    }); 
                } else if (numPlayers >= 2) {
                    socket.emit('enable start');
                }
            }
        });

        socket.on('round start', function() {
            ++round;
        });

        socket.on('time out', function() {
            if ((round > 0 && round < MAX_ROUNDS) && numPlayers >= 2) {
                socket.emit('enable start');
            } else if (round === MAX_ROUNDS) && numPlayers >= 2) {
                round = 0;
                socket.emit('enable start');
            } else if (numPlayers === 1) {
                round = 0;
                socket.emit('find players', {
                    name: name
                });
            }
        });

        socket.on('disconnect', function(socket) {
            --numPlayers;
            console.log('a user disconnected');
            round = 0;
            fbnames.splice(name, 0);
            scores.splice(name, 0);
        });
});
