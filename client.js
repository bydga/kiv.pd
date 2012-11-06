$(document).ready(function(){
	
	var content = $('#content');
	var status = $('#status');
	
	function setStatus(text)
	{
		status.html(text);
	}
	
	setStatus("Fetching available devices...");
	
	var socket = io.connect('http://ui505bv01-lps.civ.zcu.cz', {
		reconnect: false
	});		
		
	socket.on('options', function (data) {
		setStatus("Got devices.");
		for( var i in data.data)
		{
			$('#connection-type').append($('<option>', {
				value : data.data[i].key
			}).text(data.data[i].readable)); 
		}
	});

	socket.on('connecting', function () {
		setStatus("Connecting to server...");
	});
		
	socket.on('connect_failed', function () {
		setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
	});
		
	socket.on('connect', function () {
		});
		
	socket.on('error', function () {
		setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
	});
		
	socket.on('disconnect', function () {
		setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
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
				
			socket.emit('message', {
				data: e.which
			});
			e.preventDefault();
		}
	});
		
	
	
	$('#connect').click(function() {
		
		$('#select').hide();
		$('#communication').show();
		setStatus("Connected to server, sending desired port request.");
		socket.emit('connectTo', {
			port: $('#connection-type option:selected').val()
		});
	});
	
	
});