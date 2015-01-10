/* Putting a semicolon before the self-invoking function prevents the function 
 from becoming an argument. "Preventive medicine" */
;
jQuery(function($){
	'use strict';

  var counter = 1;
	var IO = {
		init: function() {
			IO.socket = io.connect();
			IO.bindEvents();
		},

		bindEvents : function() {
			IO.socket.on('connected', IO.onConnected );
			IO.socket.on('successfulLogin', IO.onSuccessfulLogin);
			IO.socket.on('newGameCreated', IO.onNewGameCreated);
			IO.socket.on('retrievedRooms', IO.onRetrievedRooms);
      IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
      IO.socket.on('beginNewGame', IO.beginNewGame);
      IO.socket.on('newWordData', IO.onNewWordData);
      IO.socket.on('chat message', IO.onChatMessage);
      IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
      IO.socket.on('gameOver', IO.gameOver);
		},

		onConnected : function() {
			var socketID = IO.socket.io.engine.id;
			console.log("This is the client ID: " + socketID);
			App.mySocketId = socketID;
		},

		onSuccessfulLogin : function(data) {
			// console.log("onSuccessfulLogin and now viewing available rooms");
			App.Host.findRooms();
			//IO.socket.emit('retrieveRooms');
		},

		onNewGameCreated : function(data) {
			//data includes: gameId, mySocketID
			// console.log("Creating new game");
			App.Host.gameInit(data);
		},

		onRetrievedRooms: function(data){
			App.Host.showRooms(data);
    },
    /**
		 * A player has successfully joined the game.
		 * @param data {{playerName: string, gameId: int, mySocketId: int}}
		 */
		playerJoinedRoom : function(data) {
		    // When a player joins a room, do the updateWaitingScreen funciton.
		    // There are two versions of this function: one for the 'host' and
		    // another for the 'player'.
		    //
		    // So on the 'host' browser window, the App.Host.updateWiatingScreen function is called.
		    // And on the player's browser, App.Player.updateWaitingScreen is called.
		    App[App.myRole].updateWaitingScreen(data);
		},

    /**
     * Both players have joined the game.
     * @param data
     */
    beginNewGame : function(data) {

      App[App.myRole].gameCountdown(data);
    },

    /**
     * A new set of words for the round is returned from the server.
     * @param data
     */
    onNewWordData : function(data) {
        // Update the current round
        App.currentRound = data.round;
        console.log("Current round: " + data.round);

        // Change the word for the Host and Player
        App[App.myRole].newWord(data);
    },

    /**
    * Chat message event back from server 
    * @param data
    */
    onChatMessage : function(data){
      $('#messages').append($('<li id='+ counter++ +'>').text(data.authorId + ": " + data.message));
      var objDiv = document.getElementById("#" + counter);
      objDiv.scrollTop = objDiv.scrollHeight;
      console.log("From: " + data.authorId + " , in game: " + data.gameId +" , Message: " + data.message);
    },

    /**
     * A player answered. If this is the host, check the answer.
     * @param data
     */
    hostCheckAnswer : function(data) {
        // if(App.myRole === 'Host') {
            App.Host.checkAnswer(data);
        // }
    },

    /**
     * Let everyone know the game has ended.
     * @param data
     */
    gameOver : function(data) {
        App[App.myRole].endGame(data);
    }


	};

	var App = {
    /**
     * Keep track of the gameId, which is identical to the ID
     * of the Socket.IO Room used for the players and host to communicate
     *
     */
    gameId: 0,

    /**
     * This is used to differentiate between 'Host' and 'Player' browsers.
     */
    myRole: '',   // 'Player' or 'Host'

    /**
     * The Socket.IO socket object identifier. This is unique for
     * each player and host. It is generated when the browser initially
     * connects to the server when the page loads for the first time.
     */
    mySocketId: '',

    /**
     * Identifies the current round. Starts at 0 because it corresponds
     * to the array of word data stored on the server.
     */
    currentRound: 0,


  /* *************************************
   *                Setup                *
   * *********************************** */

  /**
   * This runs when the page initially loads.
   */
		init: function () {
	    App.cacheElements();
	    App.showInitScreen(); 
	    App.bindEvents(); //wires the user interactions

	    // Initialize the fastclick library
	    // FastClick.attach(document.body);
		},

    /**
     * Create references to on-screen elements used throughout the game.
     */
		cacheElements: function () {
	    App.$doc = $(document);

	    // Templates
	    // These templates on index.html are stored into jQuery variables
	    App.$gameArea = $('#gameArea'); //#gameArea is id element on html page
	    App.$templateIntroScreen = $('#intro-screen-template').html();
	    App.$templateStartGame = $('#start-game-template').html();
	    App.$templateGame = $('#game-template').html();
	    // App.$templateJoinGame = $('#join-game-template').html();
      App.$hostGame = $('#host-game-template').html();
		},

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {
        // Host
        App.$doc.on('click', '#btnStartGame', App.Host.onStartClick);
        App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
        App.$doc.on('click', '#sendButton', App.Host.sendMessage);
        // var socket = io();
        // $('form').submit(function(){
        //   // var data = {
        //   //   author : "ALWAYS CHARLES", 
        //   //   message : $('#m').val()
        //   // };
        //   // fires "chat message" event to server with the message as the value
        //   IO.socket.emit('chat message', $('#m').val());
        //   $('#m').val('');
        //   return false;
        // });
        // Player
        // App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
        // App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
        // App.$doc.on('click', '.btnAnswer',App.Player.onPlayerAnswerClick);
        // App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
    },

    /* *************************************
     *             Game Logic              *
     * *********************************** */

    /**
     * Show the initial PriorPryer Title Screen
     * (with Start button)
     */
    showInitScreen: function() {
        App.$gameArea.html(App.$templateIntroScreen); //gameArea html filled by another template's html
        App.doTextFit('.title');
    },

    Host: {

    /**
     * Contains references to player data
     */
    players : [],

    /**
     * Flag to indicate if a new game is starting.
     * This is used after the first game ends, and players initiate a new game
     * without refreshing the browser windows.
     */
    isNewGame : false,

    /**
     * Keep track of the number of players that have joined the game.
     */
    numPlayersInRoom: 0,

    /**
     * A reference to the correct answer for the current round.
     */
    currentCorrectAnswer: '',

    // hostId : '',


    onStartClick: function () {
        // console.log("CLICKED \"START\": Facebook LOGIN should be prompted here");
        //TODO: Facebook Login Prompt
      var statusChangeCallback = function(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
          // Logged into your app and Facebook.
          var dataCollect = function(){
           FB.api('/me/home?fields=type,message,from,to', function(responses) {
            console.log(responses);
            // var posts = []
            var filterResponses = function(responses){
              // filters responses from api request and selects only one response
              var responseArray = responses.data;
              var filteredArray = [];
              var index;
              for ( index = 0 ; index < responseArray.length ; ++index){
                console.log((responseArray[index].type));
                if (responseArray[index].type === "status" && responseArray[index].message && responseArray[index].to){
                  console.log("Yes, status found");
                  filteredArray.push(responseArray[index]);
                }
              }
              return filteredArray;
            }
            var posts = filterResponses(responses);
            // var post_url = JSON.stringify(formatResponse(response));
            // var post_url = post_url.replace(/\"/g, "")
            if (posts.length !== 0 ){
              // $(document).ready(function(){
              var ToPeople = function (ToArray){
                // assumes data array
                var index;
                var people = "";
                for (index = 0; index < ToArray.length ; ++index){
                  if (people === ""){
                      people += JSONObjToString(ToArray[index].name);
                  }
                  else{
                    people += ", " + JSONObjToString(ToArray[index].name);
                  }
                }
                return people;
              };
              var JSONObjToString = function(obj){
                var fin = JSON.stringify(obj);
                fin = fin.replace(/\"/g, "")
                return fin;
              }; 
              var index;
              for (index = 0 ; index < posts.length ; ++index){
                console.log("Type: " + posts[index].type + "\n" + "Message: " + posts[index].message + "  From: " + JSONObjToString(posts[index].from.name) + " To: " + ToPeople(posts[index].to.data));
              }
                // var gameFinish = false;
                // var round = 0;
                // var numRounds = 1;
                // while (round < numRounds || gameFinish !== "true"){
                  // newRound(posts, round);
                  // round++;
            }
              });
            };
          dataCollect();
          IO.socket.emit('startGameAndLogin');
        } else if (response.status === 'not_authorized') {
          // The person is logged into Facebook, but not your app.
          document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
        } else {
          // The person is not logged into Facebook, so we're not sure if
          // they are logged into this app or not.
  	      console.log('not logged in');
          FB.login(function(response) {
            statusChangeCallback(response);
          }, {scope: 'public_profile,email'});
        }
      };

          FB.getLoginStatus(function(response) {
  	    console.log('got the status');
              statusChangeCallback(response);
          });
          //IO.socket.emit('startGameAndLogin');
      },

    onCreateClick: function () {
        // console.log('Clicked "Create A Game"');
        // console.log("CLICKED \"CREATE\"");
        IO.socket.emit('hostCreateNewGame');
    },

		findRooms: function() {
    	// We first neet to retrieve from server to find rooms
    	IO.socket.emit('retrieveRooms');
    },

    showRooms: function(data) {
    	App.$gameArea.html(App.$templateStartGame);
    	//Have to filter these rooms
    	// print with JSON.stringify(data.rooms, null, 4)
    	var actualRooms = [];
    	// var numberedID = /[1-9][1-9][1-9][1-9]/;

			$('#currentRooms').text("Current Rooms: " + actualRooms);

			for (var key in data.rooms){
				// console.log("EXAMINING " + key);
				if (key.length == 5 || key.length == 4){
					// NEED TO FIX TO IDENTIFY GAME ROOMS
					actualRooms.push(key);
					var $roomButton = $('<button id="'+ key +'" class="btn rooms">' + key +'</button>');
					$roomButton.appendTo($("#roomButtons"));
					// console.log("THIS IS ACCEPTED" + key);
          var room = key;
					App.$doc.on('click', '#' + key + '', function(){
            // console.log("THIS SHOULD BE A ROOM" + room);
            App.Player.onPlayerStartClick(room);
          });
					// ...
					// app.js emits event that sends data
					// pprgame.js receives data and in the method calls .join()
					// pprgame.js emits event to app.js
					// app.js changes its template based on gameID data
					// problem is button wiring to specific game room
				}
			}

    	// var rooms = filterRooms(data);
			// console.log("Rooms " + actualRooms);
    },

    gameInit: function(data) {
    	App.gameId = data.gameId;
    	App.mySocketId = data.mySocketId;

      //added
      // App.Host.hostId = data.mySocketId;
    	App.rooms = data.rooms;
    	//initialize App or game settings
      App.myRole = 'Host';
    	App.Host.numPlayersInRoom = 0;
    	App.Host.displayNewGameScreen();
    	console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
    },

    displayNewGameScreen: function() {
      // Fill the game screen with the appropriate HTML
      App.$gameArea.html(App.$templateGame);	

      // Display the URL on screen
      $('#gameURL').text(window.location.href);
      // App.doTextFit('#gameURL');

      // Show the gameId / room id on screen
      $('#spanNewGameCode').text("You are in game: " + App.gameId);

      //HOST needs to be treated as a PLAYER, so it will update variables as well
      // Update host screen
      var hostId = App.mySocketId;
      var friendlyGreeting = '<p> You are first to be here! </p>';
      $('#playersWaiting').append(friendlyGreeting);
      var hostJoin = '<p>Player ' + hostId + ' joined the game.</p>';
      $('#playersWaiting').append(hostJoin);

      // Store the new player's data on the Host.
      App.Host.players.push(hostId);
      console.log("Host " +  hostId + " should be added into: " + App.Host.players);

      // Increment the number of players in the room
      App.Host.numPlayersInRoom += 1;

    },

    filterRooms: function(rooms){
    	var actualRooms = [];
    	var numberedID = /[1-9][1-9][1-9][1-9]/;
    	for (var key in rooms){
    		var obj = rooms[key];
    		if (numberedID.test(obj)){
    			console.log("OBJ" + obj);
    			actualRooms.push(obj);
    		}
    	}
    },
      /**
     * Update the Host screen when the first player joins
     * @param data{{playerName: string}}
     */
    updateWaitingScreen: function(data) {
        // If this is a restarted game, show the screen.
        if ( App.Host.isNewGame ) {
            App.Host.displayNewGameScreen();
        }
        // console.log("updateWaitingScreen in HOST");
        // Update host screen
        var playerJoin = 'Player ' + data.playerName + ' joined the game.';
        $('#playersWaiting').append(playerJoin);

        // Store the new player's data on the Host.
        App.Host.players.push(data);
        console.log("Player " + data.PlayerName + " should be added into: " + App.Host.players);

        // Increment the number of players in the room
        App.Host.numPlayersInRoom += 1;

        // If two players have joined, start the game!
        if (App.Host.numPlayersInRoom === 2) {
            // console.log('Room is full. Almost ready!');

            // console.log("Room has these players: ");
            // console.log(App.Host.players[0] + " and ");
            // console.log(App.Host.players[1]);
            // Let the server know that two players are present.
            IO.socket.emit('hostRoomFull',App.gameId);
            console.log("hostRoomFull! Begin Game!!!");
        }
  },

  /**
   * Show the countdown screen
   */
  gameCountdown : function(hostData) {
      // console.log("gameCountdown in Host");

      // hostData contains mySocketId(hostId), gameId, players.
      // Prepare the game screen with new HTML
      App.$gameArea.html(App.$hostGame);

      // var socket = io();
      $('form').submit(function(){
        var data = {
          authorId : App.mySocketId, 
          gameId: App.gameId,
          round : App.currentRound,
          message : $('#m').val()
        };
        // fires "chat message" event to server with the message as the value
        IO.socket.emit('chat message', data);
        $('#m').val('');
        return false;
      });
      // App.doTextFit('#hostWord');

      // Begin the on-screen countdown timer
      var $secondsLeft = $('#hostWord');
      App.countDown( $secondsLeft, 5, function(){
          IO.socket.emit('hostCountdownFinished', App.gameId);
      });

      // var players = Object.keys(hostData.players)
      // console.log(players);
      // console.log(JSON.stringify(players[0]));
      // console.log(JSON.stringify(players[1]));

      // Display the players' names on screen
      $('#player1Score')
          .find('.playerName')
          .html(hostData.players[0]);

      $('#player2Score')
          .find('.playerName')
          .html(hostData.players[1]);

      // Set the Score section on screen to 0 for each player.
      $('#player1Score').find('.score').attr('id',hostData.players[0]);
      $('#player2Score').find('.score').attr('id',hostData.players[1]);
  },

  /**
   * Show the word for the current round on screen.
   * @param data{{round: *, word: *, answer: *, list: Array}}
   */
  newWord : function(data) {
      console.log("HOST VIEW");
      // Insert the new word into the DOM
      $('#hostWord').text(data.word);
      App.doTextFit('#hostWord');

      // Update the data for the current round
      App.Host.currentCorrectAnswer = data.answer;
      App.Host.currentRound = data.round;
  },

  /**
   * Check the answer clicked by a player.
   * @param data{{round: *, playerId: *, answer: *, gameId: *}}
   */
  checkAnswer : function(data) {
      // Verify that the answer clicked is from the current round.
      // This prevents a 'late entry' from a player whos screen has not
      // yet updated to the current round.
      console.log(data.playerId + " said: " + data.message);
      if (data.round === App.currentRound){

          // Get the player's score
          var $pScore = $('#' + data.authorId);
          console.log("Player: " + data.authorId);

          // Advance player's score if it is correct
          if( App.Host.currentCorrectAnswer === data.message ) {
              // Add 5 to the player's score
              $pScore.text( +$pScore.text() + 5 );

              // Advance the round
              App.currentRound += 1;

              // Prepare data to send to the server
              var data = {
                  gameId : App.gameId,
                  round : App.currentRound
              }
              console.log("Answer is correct! " + data.authorId + " answered it!");
              console.log("Before bug");

              // Notify the server to start the next round.
              IO.socket.emit('hostNextRound',data);

          } else {
              // A wrong answer was submitted, so decrement the player's score.
              // $pScore.text( +$pScore.text() - 3 );
          }
      }
  },

    /**
   * All 10 rounds have played out. End the game.
   * @param data
   */
  endGame : function(data) {
    // Get the data for player 1 from the host screen
    var $p1 = $('#player1Score');
    var p1Score = +$p1.find('.score').text();
    var p1Name = $p1.find('.playerName').text();

    // Get the data for player 2 from the host screen
    var $p2 = $('#player2Score');
    var p2Score = +$p2.find('.score').text();
    var p2Name = $p2.find('.playerName').text();

    // Find the winner based on the scores
    var winner = (p1Score < p2Score) ? p2Name : p1Name;
    var tie = (p1Score === p2Score);

    // Display the winner (or tie game message)
    if(tie){
        $('#hostWord').text("It's a Tie!");
    } else {
        $('#hostWord').text( winner + ' Wins!!' );
    }
    App.doTextFit('#hostWord');

    // Reset game data
    App.Host.numPlayersInRoom = 0;
    App.Host.isNewGame = true;
    $('#gameArea')
        .html('<div class="gameOver" class="titleWrapper">Game Over!</div>')
        .append(
            // Create a button to start a new game.
            $('<button>Start Again</button>')
                .attr('id','btnPlayerRestart')
                .addClass('btn')
                .addClass('btnGameOver')
        );
    App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
  }

  // sendMessage : function(data){
  //   $(document).ready(function(data) { console.log("I guess the form works?"); });
  // }

  },

  /* *****************************
   *        PLAYER CODE        *
   ***************************** */

		Player : {
    /**
     * A reference to the socket ID of the Host
     */
    hostSocketId: '',


    /**
     * The player's name entered on the 'Join' screen.
     */
    myName: '',

    // /**
    //  * Click handler for the 'JOIN' button
    //  */
    // onJoinClick: function () {
    //     // console.log('Clicked "Join A Game"');

    //     // Display the Join Game HTML on the player's screen.
    //     App.$gameArea.html(App.$templateGame);
    // },


    onPlayerStartClick : function(gameId) {
      // console.log("gameIdObject" + JSON.stringify(gameIdObject, null, 4));
      // var gameId = JSON.stringify(gameIdObject);
	    // console.log('Player joined room!' + gameId);
	    // collect data to send to the server
	    var data = {
	        gameId : gameId,
	        playerName : App.mySocketId
	    };

	    // Send the gameId and playerName to the server
	    IO.socket.emit('playerJoinGame', data);

	    // Set the appropriate properties for the current player.
	    App.myRole = 'Player';
	    App.Player.myName = data.playerName;
		},

    /**
     *  Click handler for the "Start Again" button that appears
     *  when a game is over.
     */
    onPlayerRestart : function() {
        // var data = {
        //     gameId : App.gameId,
        //     playerName : App.Player.myName
        // }
        // IO.socket.emit('playerRestart',data);
        // App.currentRound = 0;
        // $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
    },

    /**
		 * Display the waiting screen for player 1
		 * @param data
		 */
		updateWaitingScreen : function(data) {
      // console.log("updateWaitingScreen in PLAYER");
		    if(App.mySocketId === data.mySocketId){
		        App.myRole = 'Player';
		        App.gameId = data.gameId;
            // console.log("inside updatingWaitingScreen");
            // App.$gameArea.html(App.$templateGame);  

            //Tell player that host is waiting
            // var hostWaiting = '<p>'+ App.Host.hostId +' is waiting for more people. </p>'
            // $('#playerWaitingMessage').append(hostWaiting);

            var playerJoinging = 'You(' + App.mySocketId + ') have joined game ' + data.gameId + '. Please wait for game to begin.';
		        $('#playerWaitingMessage')
		            .append(playerJoinging);
		    }	
      },

      /**
       * Display 'Get Ready' while the countdown timer ticks down.
       * @param hostData
       */
      gameCountdown : function(hostData) {
      //Needs to be in sync with Host function

      App.$gameArea.html(App.$hostGame);
      App.doTextFit('#hostWord');

      $('form').submit(function(){
        var data = {
          authorId : App.Player.myName, 
          gameId: App.gameId,
          round : App.currentRound,
          message : $('#m').val()
        };
        // fires "chat message" event to server with the message as the value
        IO.socket.emit('chat message', data);
        $('#m').val('');
        return false;
      });

      // Begin the on-screen countdown timer
      var $secondsLeft = $('#hostWord');
      App.countDown( $secondsLeft, 5, function(){
          // Only host should emit countdownFinished
          // IO.socket.emit('hostCountdownFinished', App.gameId);
      });

      // Display the players' names on screen
      $('#player1Score').find('.playerName').html(hostData.players[0]);
      $('#player2Score').find('.playerName').html(hostData.players[1]);

      // Set the Score section on screen to 0 for each player.
      $('#player1Score').find('.score').attr('id',hostData.players[0]);
      $('#player2Score').find('.score').attr('id',hostData.players[1]);

      // console.log("gameCountdown in Player");
      App.Player.hostSocketId = hostData.mySocketId;
      // $('#gameArea')
      //     .html('<div class="gameOver">Get Ready!</div>');
      },

      /**
       * Show the word for the current round on screen.
       * @param data{{round: *, word: *, answer: *, list: Array}}
       */
      newWord : function(data) {
          console.log("PLAYER VIEW");
          // Insert the new word into the DOM
          $('#hostWord').text(data.word);
          App.doTextFit('#hostWord');

          // Update the data for the current round
          App.Host.currentCorrectAnswer = data.answer;
          App.Host.currentRound = data.round;
      },

      /**
       * Check the answer clicked by a player.
       * @param data{{round: *, playerId: *, answer: *, gameId: *}}
       */
      checkAnswer : function(data) {
          // Verify that the answer clicked is from the current round.
          // This prevents a 'late entry' from a player whos screen has not
          // yet updated to the current round.
          if (data.round === App.currentRound){

              // Get the player's score
              var $pScore = $('#' + data.playerId);

              // Advance player's score if it is correct
              if( App.Host.currentCorrectAnswer === data.answer ) {
                  // Add 5 to the player's score
                  $pScore.text( +$pScore.text() + 5 );

                  // Advance the round
                  App.currentRound += 1;

                  // Prepare data to send to the server
                  var data = {
                      gameId : App.gameId,
                      round : App.currentRound
                  }

                  // Notify the server to start the next round.
                  IO.socket.emit('hostNextRound',data);

              } else {
                  // A wrong answer was submitted, so decrement the player's score.
                  $pScore.text( +$pScore.text() - 3 );
              }
          }
      },

      /**
     * Show the "Game Over" screen.
     */
      endGame : function(data) {
        // Get the data for player 1 from the host screen
        var $p1 = $('#player1Score');
        var p1Score = +$p1.find('.score').text();
        var p1Name = $p1.find('.playerName').text();

        // Get the data for player 2 from the host screen
        var $p2 = $('#player2Score');
        var p2Score = +$p2.find('.score').text();
        var p2Name = $p2.find('.playerName').text();

        // Find the winner based on the scores
        var winner = (p1Score < p2Score) ? p2Name : p1Name;
        var tie = (p1Score === p2Score);

        // Display the winner (or tie game message)
        if(tie){
            $('#hostWord').text("It's a Tie!");
        } else {
            $('#hostWord').text( winner + ' Wins!!' );
        }
        App.doTextFit('#hostWord');

        // Reset game data
        App.Host.numPlayersInRoom = 0;
        App.Host.isNewGame = true;
        $('#gameArea')
            .html('<div class="gameOver">Game Over!</div>')
            .append(
                // Create a button to start a new game.
                $('<button>Start Again</button>')
                    .attr('id','btnPlayerRestart')
                    .addClass('btn')
                    .addClass('btnGameOver')
            );
      }

    },


    /* **************************
            UTILITY CODE
     ************************** */

  /**
   * Display the countdown timer on the Host screen
   *
   * @param $el The container element for the countdown timer
   * @param startTime
   * @param callback The function to call when the timer ends.
   */
  countDown : function( $el, startTime, callback) {

      // Display the starting time on the screen.
      $el.text(startTime);
      App.doTextFit('#hostWord');

      // console.log('Starting Countdown...');

      // Start a 1 second timer
      var timer = setInterval(countItDown,1000);

      // Decrement the displayed timer value on each 'tick'
      function countItDown(){
          startTime -= 1
          $el.text(startTime);
          App.doTextFit('#hostWord');

          if( startTime <= 0 ){
              // console.log('Countdown Finished.');

              // Stop the timer and do the callback.
              clearInterval(timer);
              callback();
              return;
          }
      }

  },

  /**
     * Make the text inside the given element as big as possible
     * See: https://github.com/STRML/textFit
     *
     * @param el The parent element of some text
     */
    doTextFit : function(el) {
        textFit(
            $(el)[0],
            {
                alignHoriz:true,
                alignVert:false,
                widthOnly:true,
                reProcess:true,
                maxFontSize:300
            }
        );
    }

	};

	IO.init();
	App.init();

}($));






// <script>
//   // This is called with the results from from FB.getLoginStatus().
//   function statusChangeCallback(response) {
//     console.log('statusChangeCallback');
//     console.log(response);
//     // The response object is returned with a status field that lets the
//     // app know the current login status of the person.
//     // Full docs on the response object can be found in the documentation
//     // for FB.getLoginStatus().
//     if (response.status === 'connected') {
//       // Logged into your app and Facebook.
//       testAPI(); 
//       document.getElementById('button').innerHTML = "<input type='button' onclick='startGame(false, newGame())' value='Start Game!'/>";
//       // reveal the start game button
//     } else if (response.status === 'not_authorized') {
//       // The person is logged into Facebook, but not your app.
//       document.getElementById('status').innerHTML = 'Please log ' +
//         'into this app.';
//     } else {
//       // The person is not logged into Facebook, so we're not sure if
//       // they are logged into this app or not.
//       document.getElementById('status').innerHTML = 'Please log ' +
//         'into Facebook.';
//     }
//   }

//   // This function is called when someone finishes with the Login
//   // Button.  See the onlogin handler attached to it in the sample
//   // code below.
//   function checkLoginState() {
//     FB.getLoginStatus(function(response) {
//       statusChangeCallback(response);
//     });
//   }

//   window.fbAsyncInit = function() {
//   FB.init({
//     appId      : process.env.FB_APP_ID,
//     cookie     : true,  // enable cookies to allow the server to access 
//                         // the session
//     xfbml      : true,  // parse social plugins on this page
//     version    : 'v2.1' // use version 2.1
//   });

//   // Now that we've initialized the JavaScript SDK, we call 
//   // FB.getLoginStatus().  This function gets the state of the
//   // person visiting this page and can return one of three states to
//   // the callback you provide.  They can be:
//   //
//   // 1. Logged into your app ('connected')
//   // 2. Logged into Facebook, but not your app ('not_authorized')
//   // 3. Not logged into Facebook and can't tell if they are logged into
//   //    your app or not.
//   //
//   // These three cases are handled in the callback function.

//   FB.getLoginStatus(function(response) {
//     statusChangeCallback(response);
//   });

//   };

//   // Load the SDK asynchronously
//   (function(d, s, id) {
//     var js, fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) return;
//     js = d.createElement(s); js.id = id;
//     js.src = "//connect.facebook.net/en_US/sdk.js";
//     fjs.parentNode.insertBefore(js, fjs);
//   }(document, 'script', 'facebook-jssdk'));

//   function startGame(parameter, callback){
//     $(document).ready(function(){
//       document.getElementById('start').innerHTML = "New Game!";
//     });
//     // why doesn't newGame() need to be called in callback method??
//     // callback();
//     return;
//   }

//   // Here we run a very simple test of the Graph API after login is
//   // successful.  See statusChangeCallback() for when this call is made.
//   function testAPI() {
//     console.log('Welcome!  Fetching your information.... ');
//     // Facebook GRAPH API request = LOGGING
//     FB.api('/me', function(response) {
//       console.log('Successful login for: ' + response.name);
//       document.getElementById('status').innerHTML =
//         'Thanks for logging in, ' + response.name + '!';
//     });
//   }

//   function newGame(){
//         // Facebook GRAPH API request = HOME FEED POSTS THAT HAVE type, message, from, to fields, which are usually
//     // wall posts
//    FB.api('/me/home?fields=type,message,from,to', function(responses) {
//       var posts = []
//       posts = filterResponses(responses);
//       // var post_url = JSON.stringify(formatResponse(response));
//       // var post_url = post_url.replace(/\"/g, "")
//       if (posts.length !== 0 ){
//         $(document).ready(function(){
//         // $('#posts').prepend('<img id="post" src=' + post_url + '/>');
//         //         for (index = 0 ; index < posts.length ; ++index){
//         //   document.getElementById('posts').innerHTML = document.getElementById('posts').innerHTML + "\n" +  
//         //   "Type: " + posts[index].type + "\n"
//         //   + "Message: " + posts[index].message;
//         //   // " From: " + JSONObjToString(posts[index].from.name) + " To: " + ToPeople(posts[index].to.data);
//         // }

//           var gameFinish = false;
//           var round = 0;
//           var numRounds = 1;
//           while (round < numRounds || gameFinish !== "true"){
//             newRound(posts, round);
//             round++;
//           }
//         });
//       }
//       else {
//         $(document).ready(function(){
//           document.getElementById('posts').innerHTML = "No posts available based on request!";
//         });
//       }
      

//     });
//   }

//   function newRound(posts, round){
//     document.getElementById('posts').innerHTML = document.getElementById('posts').innerHTML + "\n" +  
//     "QUESTION: Type: " + posts[round].type.toString() + "\n" + "Message: " + posts[round].message.toString() + "\n" +
//     "WHO IS THIS???";
//     var answer = posts[round].from.name.toString();
//     console.log(answer);
//     socket.emit('new question', answer);
//     // document.getElementById('posts').innerHTML = document.getElementById('posts').innerHTML + "\n" +  
//     //   "ANSWER is .... " + JSONObjToString(posts[round].from.name) + " to " + ToPeople(posts[round].to.data);
//     // to might give data array with mutliple id : name value pairs.
//     socket.on('correct answer', function(msg){
//       $('#messages').append($('<li>').text("New Round"));
//       return;
//     })
//     return;
//   }

  // function filterResponses(responses){
  //   // filters responses from api request and selects only one response
  //   var responseArray = responses.data;
  //   var filteredArray = [];
  //   var index;
  //   for ( index = 0 ; index < responseArray.length ; ++index){
  //     console.log((responseArray[index].type));
  //     if (responseArray[index].type === "status" && responseArray[index].message && responseArray[index].to){
  //       console.log("Yes, status found");
  //       filteredArray.push(responseArray[index]);
  //     }
  //   }
  //   return filteredArray;
  // }

//   function formatResponse(response){
//     // converts response into url
//     var url = "http://facebook.com/" + response.id;
//     console.log(url);
//     return url;
//   }

//   function JSONObjToString(obj){
//     var final = JSON.stringify(obj);
//     final = final.replace(/\"/g, "")
//     return final;
//   }

//   function ToPeople(ToArray){
//     // assumes data array
//     var index;
//     var people = "";
//     for (index = 0; index < ToArray.length ; ++index){
//       if (people === ""){
//           people += JSONObjToString(ToArray[index].name);
//       }
//       else{
//         people += ", " + JSONObjToString(ToArray[index].name);
//       }
//     }
//     return people;
//   }

// </script>

