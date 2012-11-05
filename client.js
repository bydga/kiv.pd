$(document).ready(function(){
	
	var content = $('#content');
	var status = $('#status');
	
	function setStatus(text)
	{
		status.html(text);
	}
	
	$('#connect').click(function() {
		
		$('#select').hide();
		$('#communication').show();
		connect();
	});
	
	function connect()
	{
		
		var socket = io.connect('http://ui505bv01-lps.civ.zcu.cz:1337', {
			reconnect: false
		});		
		
		socket.on('connecting', function () {
			setStatus("Connecting to server...");
		});
		
		socket.on('connect_failed', function () {
			setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
		});
		
		socket.on('connect', function () {
			setStatus("Connected to server, sending desired port request.");
			socket.emit('connectTo', {
				port: $('#connection-type option:selected').val()
			});
		});
		
		socket.on('error', function () {
			setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
		});
		
		socket.on('disconnect', function () {
			setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
		});
		
		socket.on('reconnecting', function () {
			setStatus('Connection to server lost, trying to reconnect');
		});
		
		socket.on('reconnect', function () {
			setStatus('Reconnected. Type command.');
		});
		
		socket.on('reconnect_failed', function () {
			setStatus('Reconnect failed. Try to reload the page.');
		});
		
		socket.on('connectTo', function (data) {
			if (data.result == "ok") {
				setStatus("Connection ready. Type command.");
			}
			else {
				setStatus('Sorry, Connection to this port rejected');
			}
		});
			
		socket.on('message', function (data) {
			if ( data.content == "\b") {
				content.val(content.val().replace(/.$/, ""));
			}
			else if (data.content == " \b") {
						
			}
			else {
				content.val(content.val() + data.content);
				setStatus("Type command.");
			}
			content.scrollTop(100000);
		});
		
		
		//for special characters
		content.keydown(function(e) {
			
			console.log("keydown " + e.which);
			if (e.which == 8 || e.which == 9) {   // backspace, tab
				socket.emit('message', {
					data: e.which
				});
				e.preventDefault();
			}
			
			else if (e.which == 38 || e.which == 40) { //arrows
				e.preventDefault();
			}
			
		});
		
		//regular chars
		content.keypress(function(e) {
			if (e.which > 9) {
				
				console.log("keypress " + e.which);
				socket.emit('message', {
					data: e.which
				});
				e.preventDefault();
			}
		});
	}
});