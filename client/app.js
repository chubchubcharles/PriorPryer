$(function() {
        var socket = io();
        var $window = $(window);

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
        $window.keydown(function (event) {
            if (event.which === 13) {
                setName();
            }
        });

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
}
