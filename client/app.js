$(function() {
    var socket = io();
    setName();
    // var $window = $(window);

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '261908037266353', // App ID //Remember to hide this appID
      channelURL : 'https://10.21.210.204:8000/channel.html', // Channel File
      status     : true, // check login status
      oauth      : true, // enable OAuth 2.0
      xfbml      : true,  // parse XFBML
      version    : 'v2.1'
    });

    //
    // All your canvas and getLogin stuff here
    //

    FB.getLoginStatus(function(response) {
          if (response.status === 'connected') {
            console.log('Logged in.');
          }
          else {
            FB.login(function(response) {
              onLogin(response);
              console.log("Not Logged in.");
            }, {scope: 'user_friends, email'});
          }
    });
  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     d.getElementsByTagName('head')[0].appendChild(js);
   }(document));

    //loads Facebook SDK 

    //asks users to login
    function onLogin(response) {
      if (response.status == 'connected') {
        FB.api('/me?fields=first_name', function(data) {
          var welcomeBlock = document.getElementById('fb-welcome');
          welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
        });
      }
    }

    // var socket = io.connect('https://localhost:3000/',{secure: true});
        // var $currentIFrame = document.getElementById("myframe").contentDocument;
        // alert($currentIFrame);
        // var invocation = new XMLHttpRequest();
        // var url = 'https://';
   
        // function callOtherDomain() {
        //     if(invocation) {    
        //         invocation.open('GET', url, true);
        //         invocation.onreadystatechange = handler;
        //         invocation.send(); 
        //     }
        // }

        function sendRequest() {
            // Get the list of selected friends
            var sendUIDs = '';
            var mfsForm = document.getElementById('mfsForm');
            for(var i = 0; i < mfsForm.friends.length; i++) {
                if(mfsForm.friends[i].checked) {
                    sendUIDs += mfsForm.friends[i].value + ',';
                }
            }

            // Use FB.ui to send the Request(s)
            FB.ui({method: 'apprequests',
                    to: sendUIDs,
                    title: 'My Great Invite',
                    message: 'Check out this Awesome App!',
                    }, callback);
        }

        function callback(response) {
            console.log(response);
        }

        function renderMFS() {
        // First get the list of friends for this user with the Graph API
        FB.api('/me/friends', function(response) {
            var container = document.getElementById('mfs');
            var mfsForm = document.createElement('form');
            mfsForm.id = 'mfsForm';

            // Iterate through the array of friends object and create a checkbox for each one.
            for(var i = 0; i < Math.min(response.data.length, 10); i++) {
            var friendItem = document.createElement('div');
            friendItem.id = 'friend_' + response.data[i].id;
            friendItem.innerHTML = '<input type="checkbox" name="friends" value="'
            + response.data[i].id
            + '" />' + response.data[i].name;
            mfsForm.appendChild(friendItem);
            }
            container.appendChild(mfsForm);

            // Create a button to send the Request(s)
            var sendButton = document.createElement('input');
            sendButton.type = 'button';
            sendButton.value = 'Send Request';
            sendButton.onclick = sendRequest;
            mfsForm.appendChild(sendButton);
        });
        }

        function setName () {
            // get the fb name
            console.log('set name');
            var name = 'bob';
            socket.emit('add user', name);
        }
/*
        // click events
        $joinButton.click(function () {
            setName();
        });
*/
        /* click on start (function () {
            socket.emit("round start");            
        });*/
/*
        $window.keydown(function (event) {
            if (event.which === 13) {
                setName();
            }
        });
*/
        // socket events
        socket.on('find players', function () {
            renderMFS();
        });

        socket.on('enable start', function () {
            // allow the begin button to be pressed
            console.log('start enabled');
        });

        socket.on('start round', function () {

        });
});
