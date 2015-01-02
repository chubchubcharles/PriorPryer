var io;
var gameSocket;


// exports.{some_function} is the same as module.exports()
// it is used to export functions from a module to be used outside of module

exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', { message: "You are connected!" });





	// var answer;
	// // broadcast.emit will send to all except socket sender  
	// socket.broadcast.emit('user connected');
 //  socket.on('chat message', function(msg){
 //    // console.log("Message:" + msg);
 //    // console.log("Answer:" + answer);
 //  	// server upon receiving "chat message" event, also fires an event with the same name with the msg
 //    io.emit('chat message', msg); 
 //    if (msg === answer){
 //      io.emit('correct answer');
 //    }
 //  });
 //  socket.on('new question', function(msg){
 //    // console.log("New Question, Answer is " + msg);
 //    answer = msg;
 //  });
 //  socket.on('disconnect', function(msg){
 //    io.emit('disconnect', "user disconnected");
 //  });
}