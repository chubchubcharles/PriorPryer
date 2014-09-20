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
server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);
// routing
app.get('/', function(req, res){
    // note: sending files will require an absolute path
    res.sendFile(path.join(path.resolve('.'), 'client/index.html'));
});

app.get('/heycharles', function(req, res) {
    res.send('Hey charles!');
});
app.post('/ho', function(req, res) {
    res.send('HO!');
});

// set up socket io to listen on the same port
var io = require('socket.io').listen(https);

io.on('connection', function(socket){
    console.log('a user connected')
;})
