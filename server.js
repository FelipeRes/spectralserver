var net = require('net');
var JsonSocket = require('json-socket');
// Configuration parameters
var HOST = '40.76.40.113';
var PORT = 1234;
 
// Create Server instance 
var server = net.createServer(onClientConnected);  
var games = {};
 
server.listen(PORT, HOST, function() {  
  console.log('server listening on %j', server.address());
});
 
function onClientConnected(sock) {
  sock = new JsonSocket(sock);  
  console.log(sock)
  var remoteAddress = sock.remoteAddress + ':' + sock.remotePort;
  console.log('new client connected: %s', remoteAddress);

  sock.on('data', function(data) {
    var info = '';
    info += data;
    jsonData = JSON.parse(info);
    if(jsonData.protocol == "create_game"){
      sock.key = jsonData.sessionId;
      sock.isHost = true;
      games[jsonData.sessionId] = {"host_agents":jsonData.host_agents,"client_agents":[]};
      console.log(games);
      sock.sendMessage({"response":games[jsonData.sessionId]});
    }
    if(jsonData.protocol == "update_game"){
      games[jsonData.sessionId] = {"host_agents":jsonData.host_agents,"client_agents":games[jsonData.sessionId].client_agents};
      sock.sendMessage({"client_agents":games[jsonData.sessionId].client_agents});
    }
    if(jsonData.protocol == "join_game"){
      sock.key = jsonData.sessionId;
      sock.client_id = jsonData.client_agents.id;
      games[jsonData.sessionId].client_agents.push(jsonData.client_agents);
      sock.sendMessage({"host_agents":games[jsonData.sessionId].host_agents});
    }
    if(jsonData.protocol == "sync_game"){
      if(jsonData.sessionId in games){
        for(var i = 0; i <  games[jsonData.sessionId].client_agents.length; i++) {
          if (games[jsonData.sessionId].client_agents[i].name == jsonData.client_agents.name) {
            games[jsonData.sessionId].client_agents[i] = jsonData.client_agents;
              break;
          }
      }
        //= {"host_agents":games[jsonData.sessionId].host_agents,"client_agents":jsonData.client_agents};
        sock.sendMessage({"host_agents":games[jsonData.sessionId].host_agents});
      }else{
        sock.sendMessage("The host disconnected");
      }
    }
  });
  sock.on('close',  function () {
    if(sock.isHost!=undefined){
      console.log('connection from %s closed', sock.key);
      delete games[sock.key]
    }
    if(sock.client_id!=undefined){
      console.log('the player %s diconnected from game', sock.client_id);
      console.log(games[sock.key])
      for(var i = 0; i <  games[sock.key].client_agents.length; i++) {
        if (games[sock.key].client_agents[i].id == sock.client_id) {
          games[jsonData.sessionId].client_agents.splice(i,1);
          break;
        }
      }
    }
    console.log(games);
  });
  sock.on('error', function (err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  });
};