var io;
var gameSocket;


// exports.{some_function} is the same as module.exports()
// it is used to export functions from a module to be used outside of module

exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', { message: "You are connected!" });
  gameSocket.on('startGameAndLogin', startGameAndLogin);
  gameSocket.on('retrieveRooms', retrieveRooms)
	gameSocket.on('hostCreateNewGame', hostCreateNewGame);
  gameSocket.on('playerJoinGame', playerJoinGame);

}

/* *******************************
   *                             *
   *       HOST FUNCTIONS        *
   *                             *
   ******************************* */

function startGameAndLogin() {
  //"Start" button clicked on and facebook login prompts login
  //TODO: Facebook Login here

  //After login success
  this.emit('successfulLogin');

}

function retrieveRooms() {
  console.log("SHOWING ALL ROOMS IN SERVER");
  console.log(gameSocket.adapter.rooms);
  this.emit('retrievedRooms', {rooms: gameSocket.adapter.rooms});
}

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame() {
    console.log("CREATING NEW GAME IN SERVER");
    // Create a unique Socket.IO Room
    var thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

    // Join the Room and wait for the players
    this.join(thisGameId.toString());
};

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    console.log('Player ' + data.playerName + ' attempting to join game: ' + data.gameId );

    // A reference to the player's Socket.IO socket object
    var sock = this;

    // Look up the room ID in the Socket.IO manager object.
    // var room = gameSocket.manager.rooms["/" + data.gameId];
    var room = data.gameId;

    // If the room exists...
    if( room != undefined ){
        // attach the socket id to the data object.
        data.mySocketId = sock.id;

        // Join the room
        sock.join(data.gameId);

        console.log('Player ' + data.playerName + ' joining game: ' + data.gameId );

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(data.gameId).emit('playerJoinedRoom', data);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('error',{message: "This room does not exist."} );
    }
}



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
