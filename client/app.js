$(function() {
    var socket = io();
    setName();
    var $window = $(window);
    var seconds = 60;
    var canPlay = false;

    $('.inputMessage').keypress(function(event) {
        if (event.which == '13') {
            event.preventDefault();
            $('.inputMessage').append('<div>' + $(this).val() + ' <span onclick="$(this).parent().remove();">X</span> </div>');
            var value = $(this).val('');
            alert(value.filter_input({regex:'[a-z]'}));
        }
    });


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

    // var contentType = document.getElementById('iframe_id').contentWindow.document.body.innerHTML;
    // console.log(contentType);

    FB.getLoginStatus(function(response) {
          if (response.status === 'connected') {

            FB.api('/me', function(response) {
            $(".textboxMessage").text("Good to see you, " + response.name + "!");
            $(".textboxMessage").show("slow", "swing");
            $(".textboxMessage").show().delay(5000).fadeOut();
            console.log('Good to see you, ' + response.name + '.');
            });
          }
          else {
            console.log('User cancelled login or did not fully authorize.');
            $(".textboxMessage").text("User cancelled login or did not fully authorize.");
            $(".textboxMessage").show("slow", "swing");
            $(".textboxMessage").show().delay(5000).fadeOut();
            FB.login(function(response) {
                //handle response

            }, {
                scope: 'user_friends, email',
                return_scopes: true
            });
          }
    });
    //keep putting chrome functions
  }

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     d.getElementsByTagName('head')[0].appendChild(js);
   }(document));

    //loads Facebook SDK 

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



        function retrievePosts(){
            FB.api('/56759922819/posts?access_token=261908037266353|2ce35b4ab45577936ec23dd940a36570&limit=10', function(response) {    
                console.log(response);
            });
        }

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
        
        // click events
        function runTimer () {
            console.log('seconds: ' + seconds);
            $("").show();
            if (seconds > 0) {
                --seconds;
            $(".counter").text(seconds);
            $(".counter").show("slow", "swing");
                setTimeout(runTimer, 1000);
            } else if (seconds === 0) {
                socket.emit('time out');
            }
        }
                 
        function startRound () {
            // display a post
                                 
            // start the timer
            seconds = 60;
            runTimer();
            socket.emit('round start');
            canPlay = false;
        }
        
        //$startBttn.click (function () {
        $window.keydown (function () {
            if (canPlay) {
                startRound();
            }
                        
        });
                     
        socket.on('find players', function () {
            //renderMFS();
            console.log('find a player');
        });

        socket.on('enable start', function () {
            // allow the begin button to be pressed
            console.log('start enabled');
            canPlay = true;
        });

});
