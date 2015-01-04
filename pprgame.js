var io;
var gameSocket;


// exports.{some_function} is the same as module.exports()
// it is used to export functions from a module to be used outside of module

exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', { message: "You are connected!" });

	gameSocket.on('hostCreateNewGame', hostCreateNewGame);

}

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame() {
    // Create a unique Socket.IO Room
    var thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    this.join(thisGameId.toString());
};



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
