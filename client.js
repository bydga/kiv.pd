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
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		
		if (!window.WebSocket) {
			return;
		}
		
		setStatus("Connecting to server...");
		var connection = new WebSocket('ws://ui505bv01-lps.civ.zcu.cz:1337');
		
		connection.onopen = function () {
			var port = $('#connection-type option:selected').val(); 
			setStatus("Connected. Sending request for " + port );
			connection.send(port);
		
		};
		
		connection.onerror = function (error) {
			setStatus('Sorry, but there\'s some problem with your connection or the server is down.');
		};
		
		connection.onmessage = function (message) {
			try {
				var json = JSON.parse(message.data);
				if (json.connection == "ok") {
					setStatus("Connection ready. Type command.");
				}
				else if (json.type === 'message') {
					
					if ( json.data == "\b") {
						content.val(content.val().replace(/.$/, ""));
					}
					else if (json.data == " \b") {
						
					}
					else
					{
						content.val(content.val() + json.data);
						setStatus("Type command.");
					}
				}
				
				content.scrollTop(100000);
			} catch (e) {
				setStatus('Got unexpected data from server.');
				return;
			}			
		};
		
		
		//for special characters
		content.keydown(function(e) {
			
			if (e.which == 8 || e.which == 9) {   // backspace, tab
				connection.send(JSON.stringify({
					data: e.which
				}));
				e.preventDefault();
			}
			
			else if (e.which == 38 || e.which == 40) { //arrows
				e.preventDefault();
			}
			
		});
		
		//regular chars
		content.keypress(function(e) {
			connection.send(JSON.stringify({
				data: e.which
			}));
			e.preventDefault();
		});
		
		setInterval(function() {
			if (connection.readyState !== 1) {
				setStatus('Unable to comminucate with the WebSocket server.');
			}
		}, 3000);
	
	}
});