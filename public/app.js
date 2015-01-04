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
		},

		onConnected : function() {
			var socketID = IO.socket.io.engine.id;
			console.log("This is the client ID: " + socketID);
			App.mySocketId = socketID;
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
	    // App.$templateNewGame = $('#create-game-template').html();
	    // App.$templateJoinGame = $('#join-game-template').html();
	    // App.$hostGame = $('#host-game-template').html();
		},

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {
        // Host
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