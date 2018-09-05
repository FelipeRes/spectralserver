var net = require('net');
var HOST = '0.0.0.0';
var PORT = 1234;

var server = net.createServer(onClientConnected);  
server.listen(PORT, HOST, function() {  
  console.log('server listening on %j', server.address());
});
 
function onClientConnected(socket) {
  
  console.log("A new client has conected")
  socket.on('data', function(data) {
   
  });
  socket.on('close', function(data) {
    console.log('CLOSED: ' + socket.remoteAddress +' '+ socket.remotePort);
});
socket.on('error', function (err) {
    console.log(err);
  });
};

