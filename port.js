var serial = require("serialport");
var repl = require("repl");

port = new serial.SerialPort('/dev/ttyUSB0', {
	baudrate: 9600
} );

port.on("data", function(data) {
	process.stdout.write(data.toString());
});


repl.start("");


