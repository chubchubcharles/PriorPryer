/* Putting a semicolon before the self-invoking function prevents the function 
 from becoming an argument. "Preventive medicine" */
;
jQuery(function($)){
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
			console.log(IO.socket.socket.sessionid);
		}

}
	};

	IO.init();

}($));