var net = require('net');

var HOST = '0.0.0.0';
var PORT = 1234;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);

});


// Add a 'close' event handler for the client socket
