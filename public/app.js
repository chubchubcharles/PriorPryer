/* Putting a semicolon before the self-invoking function prevents the function 
 from becoming an argument. "Preventive medicine" */
;
jQuery(function($){
	'use strict';

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
      IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
		},

		onConnected : function() {
			var socketID = IO.socket.io.engine.id;
			console.log("This is the client ID: " + socketID);
			App.mySocketId = socketID;
		},

		onSuccessfulLogin : function(data) {
			console.log("onSuccessfulLogin and now viewing available rooms");
			App.Host.findRooms();
			//IO.socket.emit('retrieveRooms');
		},

		onNewGameCreated : function(data) {
			//data includes: gameId, mySocketID
			console.log("Creating new game");
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
		    App.Player.updateWaitingScreen(data);
		}

	};

	var App = {
		gameId: 0,
		mySocketId: '',


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
	    // App.$hostGame = $('#host-game-template').html();
		},

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {
        // Host
        App.$doc.on('click', '#btnStartGame', App.Host.onStartClick);
        App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);

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
        // App.doTextFit('.title');
    },

    Host: {

    //Host variables:
    	//players: []
    	//isNewGame : false
    	//numPlayersInRoom : 0
    	//currentCorrectAnswer: ''
    onStartClick: function () {
        console.log("CLICKED \"START\": Facebook LOGIN should be prompted here");
        //TODO: Facebook Login Prompt

        IO.socket.emit('startGameAndLogin');
    },

    onCreateClick: function () {
        // console.log('Clicked "Create A Game"');
        console.log("CLICKED \"CREATE\"");
        IO.socket.emit('hostCreateNewGame');
    },

    numPlayersInRoom: 0,
    rooms: 0,

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
				console.log(key);
				if (key.length == 5 || key.length == 4){
					// NEED TO FIX TO IDENTIFY GAME ROOMS
					actualRooms.push(key);
					var $roomButton = $('<button id="btnJoinGame" class="btn rooms">' + key +'</button>')
					$roomButton.appendTo($("#roomButtons"));
					// hopefully buttons have listeners

					// downstream events should be carefully considered
					App.$doc.on('click', '#btnJoinGame', App.Player.onPlayerStartClick(key));
					// ...
					// app.js emits event that sends data
					// pprgame.js receives data and in the method calls .join()
					// pprgame.js emits event to app.js
					// app.js changes its template based on gameID data
					// problem is button wiring to specific game room
				}
			}

    	// var rooms = filterRooms(data);
			console.log("Rooms " + actualRooms);
    },

    gameInit: function(data) {
    	App.gameId = data.gameId;
    	App.mySocketId = data.mySocketId;
    	App.rooms = data.rooms;
    	//initialize App or game settings
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
    }
  },



  	//THIS FUNCTION IS NOT BEING CALLED ATM
    /**
   * Update the Host screen when the first player joins
   * @param data{{playerName: string}}
   */
  updateWaitingScreen: function(data) {
      // If this is a restarted game, show the screen.
      if ( App.Host.isNewGame ) {
          App.Host.displayNewGameScreen();
      }
      // Update host screen
      $('#playersWaiting')
          .append('<p/>')
          .text('Player ' + data.playerName + ' joined the game.');

      // Store the new player's data on the Host.
      App.Host.players.push(data);

      // Increment the number of players in the room
      App.Host.numPlayersInRoom += 1;

      // If two players have joined, start the game!
      if (App.Host.numPlayersInRoom === 2) {
          // console.log('Room is full. Almost ready!');

          // Let the server know that two players are present.
          IO.socket.emit('hostRoomFull',App.gameId);
          console.log("hostRoomFull! Begin Game!!!");
      }
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


    onPlayerStartClick: function(gameId) {
	    // console.log('Player clicked "Start"');
	    // collect data to send to the server
	    var data = {
	        gameId : +(gameId),
	        playerName : App.mySocketId
	    };

	    // Send the gameId and playerName to the server
	    IO.socket.emit('playerJoinGame', data);

	    // Set the appropriate properties for the current player.
	    App.myRole = 'Player';
	    App.Player.myName = data.playerName;
		},

    /**
		 * Display the waiting screen for player 1
		 * @param data
		 */
		updateWaitingScreen : function(data) {
		    if(App.mySocketId === data.mySocketId){
		        App.myRole = 'Player';
		        App.gameId = data.gameId;

		        $('#playerWaitingMessage')
		            .append('<p/>')
		            .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
		    }	
		   console.log("after bug");

}

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

//   function filterResponses(responses){
//     // filters responses from api request and selects only one response
//     var responseArray = responses.data;
//     var filteredArray = [];
//     var index;
//     for ( index = 0 ; index < responseArray.length ; ++index){
//       console.log((responseArray[index].type));
//       if (responseArray[index].type === "status" && responseArray[index].message && responseArray[index].to){
//         console.log("Yes, status found");
//         filteredArray.push(responseArray[index]);
//       }
//     }
//     return filteredArray;
//   }

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