function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}
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
		console.log("got data");
		console.log(data);
		
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
		
	content.bind("cut copy paste",function(e) {
		e.preventDefault();
	});
		
	//for special characters
	content.keydown(function(e) {
			
		if (e.which == 8 || e.which == 9) {   // backspace, tab
			socket.emit('message', {
				data: e.which
			});
			e.preventDefault();
		}
			
		else if (e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40  || e.which == 46) { //arrows
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
	
	var vars = getUrlVars();
	var port = vars['id'];
	socket.emit('connectTo', {
		port: port
	});
	
	
});