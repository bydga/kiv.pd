var WebSocket = require("websocket").server;
var http = require("http");
var serial = require("serialport");
var repl = require("repl");


//  serial.list(function (err, ports) {
//    ports.forEach(function(port) {
//      console.log(port);
//    });
//  });
//  

console.log("Starting server...");
//   available additional config properties: databits, stopbits, parity
devices = {
	'/dev/ttyUSB0': {
		baudrate: 9600,
		port: null,
		parser: serial.parsers.readline("\n") 
	}
//	'/dev/ttyS1':
//	{
//		baudrate: 9600,
//		port: null
//	}
};
var allowedOrigins = ["http://ui505bv01-lps.civ.zcu.cz" ];
clients = [];

var httpServer = http.createServer(function(req, res) {}).listen(1337, function() { });
var webSocketServer = new WebSocket({
	httpServer: httpServer
});

//init port devices
for( var deviceName in devices)
{
	devices[deviceName].port = new serial.SerialPort(deviceName, devices[deviceName]);
	devices[deviceName].port.on("data", function(name) {
		return function (data) {
			//console.log("Received " + data.toString());
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].portName == name) {
					var json = JSON.stringify({
						type: "message", 
						data: data.toString()
					});
					clients[i].socket.sendUTF(json);
				}
			}
		}
	}(deviceName));
}

console.log("Devices opened");

webSocketServer.on("request", function(request) {
	if (allowedOrigins.length > 0 && allowedOrigins.indexOf(request.origin) == -1) {
		request.reject(); 
		console.log("rejected client from " + request.origin);
		return;
	}
		
	var connectionObject = {
		socket: request.accept(null, request.origin),
		portName: null
	};
	
	var index = clients.push(connectionObject) -1;
	
	//incomming message from one of the clients
	connectionObject.socket.on("message", function(message) {
		
		if (connectionObject.portName == null) { //first message from user is the protocol
			connectionObject.portName = message.utf8Data;
			
			var json = JSON.stringify({
				connection: "ok"
			});
			
			connectionObject.socket.sendUTF(json);
			console.log("Client connected to port " + connectionObject.portName);
		}
		else //regular command
		{
			devices[connectionObject.portName].port.write(message.utf8Data + "\r\n");
		}
	});
	
	//client disconnects, remove him
	connectionObject.socket.on("close", function(connection) {
		clients.splice(index,1);
		console.log("client disconnected from " + connectionObject.portName);
	});
});

console.log("Server accepting connections.");
repl.start("commands> ");
