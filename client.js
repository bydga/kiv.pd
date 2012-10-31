$(document).ready(function(){
	
	var content = $('#content');
	var input = $('#input');
	var status = $('#status');
	
	function setStatus(disableInput, text)
	{
		status.html(text);
		disableInput ? input.attr("disabled", "disabled") : input.removeAttr("disabled");
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
			input.attr('disabled', 'disabled').val('Sorry, but your browser doesn\' support websockets.');
			return;
		}
		
		setStatus(true, "Connecting to server...");
		var connection = new WebSocket('ws://ui505bv01-lps.civ.zcu.cz:1337');
		
		connection.onopen = function () {
			var port = $('#connection-type option:selected').val(); 
			setStatus(true, "Connected. Sending request for " + port );
			connection.send(port);
			
		};
		
		connection.onerror = function (error) {
			setStatus(true, 'Sorry, but there\'s some problem with your connection or the server is down.');
		};
		
		connection.onmessage = function (message) {
			try {
				var json = JSON.parse(message.data);
				if (json.connection == "ok") {
					setStatus(false, "Connection ready. Type command.");
				}
				else if (json.type === 'message') {
					content.append(json.data.replace("\r", "<br>"));
					setStatus(false, "Type command.");
				}
				
				content.scrollTop(100000);
			} catch (e) {
				setStatus(true, 'Got unexpected data from server.');
				return;
			}			
		};
		
		input.keydown(function(e) {
			if (e.keyCode === 13) {
				var msg = $(this).val();				
				connection.send(msg);
				$(this).val('');
				setStatus(false,"Sending command...");

			}
		});
		
		setInterval(function() {
			if (connection.readyState !== 1) {
				setStatus(true, 'Unable to comminucate with the WebSocket server.');
			}
		}, 3000);
	
	}
});