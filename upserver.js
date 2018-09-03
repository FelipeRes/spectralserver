var net = require('net');
var JsonSocket = require('json-socket');
var HOST = '0.0.0.0';
var PORT = 1234;

var server = net.createServer(onClientConnected);  
var games = {};

server.listen(PORT, HOST, function() {  
    //console.log('server listening on %j', server.address());
});

function onClientConnected(socket) {
    socket = new JsonSocket(socket);
    console.log("A new client has conected");
    var completeData = '';

    socket.on('data', function(data) {
      //var info = ''+data;
      //console.log(info);
      completeData += data;
      //console.log(completeData);
      var dataArray = completeData.split('&');
      //console.log("Size:"+dataArray.length)
      if(dataArray.length > 1) {
        ProcessData(socket,dataArray[0]);
        completeData = dataArray[1];
      }
      //console.log("Splited data :"+result);

      //console.log(games[jsonData.sessionId].phantoms);

    });

    socket.on('close',  function () {
      
    });
    socket.on('error', function (err) {
      
    });
  };

  function ProcessData(socket, data){
    try{
      jsonData = JSON.parse(data);
      //console.log("Processed data: %j",jsonData.length);
    }catch(err){
      //console.log("Ocorreu um erro: %j",err);
      return;
    }

    if(jsonData.protocol == "create_game"){
      games[jsonData.sessionId] = {"host":jsonData.host,"phantoms":[],"agents":jsonData.agents};
      console.log("The new game was created! Host: " + jsonData.host.label)
      socket.sendMessage({"protocol":"create_game","result":"sucess","message":"Your game was creatd with sucess!"});
    }
    if(jsonData.protocol == "update_game"){
      games[jsonData.sessionId].host = jsonData.host;
      games[jsonData.sessionId].agents = jsonData.agents;
      console.log("The game has updated: %j",games[jsonData.sessionId])
      socket.sendMessage({"protocol":"update_game","result":"sucess","message":"Your game was updated","phantoms":games[jsonData.sessionId].phantoms})
    }
    if(jsonData.protocol == "join_game"){
      console.log("A new player was joined to server: "+jsonData.client);
      games[jsonData.sessionId].phantoms.push(jsonData.client);
      console.log("Phantoms of the game: "+games[jsonData.sessionId].phantoms);
    }
  }
  
  