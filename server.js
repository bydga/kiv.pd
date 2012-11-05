var http = require('http').createServer(function(req, res) {}),
io = require('socket.io').listen(http, {
	'log level':2	
}),
serial = require("serialport"),
repl = require("repl");


console.log("Starting server...");
http.listen(1337);
//   available additional config properties: databits, stopbits, parity
devices = {
	'/dev/ttyUSB0': {
		baudrate: 9600,
		port: null
	//parser: serial.parsers.readline("\n") 
	}
//	'/dev/ttyS1':
//	{
//		baudrate: 9600,
//		port: null
//	}
};
var allowedOrigins = ["http://ui505bv01-lps.civ.zcu.cz" ];
clients = [];

//init port devices
for( var deviceName in devices)
{
	devices[deviceName].port = new serial.SerialPort(deviceName, devices[deviceName]);
	devices[deviceName].port.on("data", function(name) {
		return function (data) {
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].portName == name) {
					
					clients[i].socket.emit("message", {
						content: data.toString()
					});
				}
			}
		}
	}(deviceName));
}

console.log("Devices opened");

io.sockets.on('connection', function (socket) {
	var connectionObject = {
		socket: socket,
		portName: null
	};
	
	var index = clients.push(connectionObject) -1;
  
	socket.on('connectTo', function (data) {
    
		connectionObject.portName = data.port;
		console.log("Client connected to port " + connectionObject.portName);
		socket.emit('connectTo', {
			result: "ok"
		});
	});
	
	socket.on('message', function (data) {
    
		var buf = new Buffer(1);
		buf[0] = data.data;
			
		devices[connectionObject.portName].port.write(buf);
	});
	//client disconnects, remove him
	socket.on("disconnect", function() {
		clients.splice(index,1);
		console.log("client disconnected from " + connectionObject.portName);
	});
});

console.log("Server accepting connections.");
repl.start("nodejs> ");
