var fs = require('fs'), path = require('path'),
http = require('http').createServer(function(request, response) { 
	var url = require('url').parse(request.url, true)
	var filePath = '.' + url.pathname;
	if (filePath == './')
		filePath = './index.html';
         
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
     
	fs.exists(filePath, function(exists) {
     
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, {
						'Content-Type': contentType
					});
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
}),
io = require('socket.io').listen(http, {
	'browser client minification': true,
	'browser client etag': true,
	'browser client gzip': true,
	'log level':1	
}),
serial = require("serialport"),
repl = require("repl");


console.log("Starting server...");
http.listen(80);
//   available additional config properties: databits, stopbits, parity
devices = {
	'/dev/ttyUSB0': {
		baudrate: 9600,
		port: null
	}
//	,'/dev/ttyS1':
//	{
//		baudrate: 9600,
//		port: null
//	}
};

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



//repl.start("nodejs> ");
