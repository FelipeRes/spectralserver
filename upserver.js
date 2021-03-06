var net = require('net');
var JsonSocket = require('json-socket');
var HOST = '0.0.0.0';
var PORT = 1234;

var server = net.createServer(onClientConnected);  
var games = {};

server.listen(PORT, HOST, function() {  
    console.log('server listening on %j', server.address());
});

function onClientConnected(socket) {
    socket = new JsonSocket(socket);
    var completeData = '';
    socket.on('connect', function() {
      console.log("A new client has conected");
    });
    socket.on('data', function(data) {
      completeData += data;
      var dataArray = completeData.split('&');
      if(dataArray.length > 1) {
        ProcessData(socket,dataArray[0]);
        completeData = dataArray[1];
      }
    });

    socket.on('close',  function () {
      console.log("A connection was closed");
      console.log(socket.typeConnection );
      if(socket.typeConnection != undefined && socket.typeConnection == "host"){
        console.log('connection from %s closed', games[socket.key]);
        delete games[socket.key]
        socket.sendMessage({"protocol":"close_game","result":"sucess","message":"Your game are closed"});
      }else if(socket.typeConnection != undefined && socket.typeConnection == "phantom" && games[socket.key] != undefined){
        for(var i =0; i<games[socket.key].phantoms.length;i++){
          if(games[socket.key].phantoms[i].id == socket.id){
            games[socket.key].phantoms.splice(i, 1);
            console.log('The phantom instance was destroyed');
          }
        }
      }
    });
    socket.on('error', function (err) {
      console.log("A error was occured");
    });
  };

  async function ProcessData(socket, data){
    try{
      jsonData = JSON.parse(data);
    }catch(err){
      console.log("Ocorreu um erro: %j",err);
      return;
    }
    if(jsonData.protocol == "create_game"){
      try{
        await CreateGame(socket,data);
      }catch(err){
        console.log("Ocorreu um erro na criacao do jogo: %j",err);
        return;
      }
    }
    if(jsonData.protocol == "update_game"){
      try{
        await UpdateGame(socket,data);
      }catch(err){
        console.log("Ocorreu um erro na atualizacao do jogo: %j",err);
        return;
      }
    }
    if(jsonData.protocol == "join_game"){
      try{
        await JoinGame(socket,data);
      }catch(err){
        console.log("Ocorreu um erro na entrada do jogo: %j",err);
        return;
      }
    }
    if(jsonData.protocol == "sync_game"){
      try{
        await SyncGame(socket, data);
      }catch(err){
        console.log("Ocorreu um erro na sincronizacao do jogo: %j",err);
        return;
      }
    }
  }
  

  function CreateGame(socket, data){
    if(games[jsonData.sessionId] == undefined){
      socket.key = jsonData.sessionId;
      socket.typeConnection = "host";
      games[jsonData.sessionId] = {"host":jsonData.host,"phantoms":[],"agents":jsonData.agents};
      console.log("The new game was created! Host: " + jsonData.host.label)
      socket.sendMessage({"protocol":"create_game","result":"sucess","message":"Your game was creatd with sucess!"});
    }else{
      socket.sendMessage({"protocol":"create_game","result":"fail","message":"A game instance with this Id already is online!"});
    }
  }
  function JoinGame(socket, data){
    if(games[jsonData.sessionId] != undefined){
      if(games[jsonData.sessionId].phantoms.length <= 2){
        socket.key = jsonData.sessionId;
        socket.typeConnection = "phantom";
        socket.id = jsonData.client.id;
        console.log("A new player was joined to server: %j",jsonData.client);
        games[jsonData.sessionId].phantoms.push(jsonData.client);
        socket.sendMessage({"protocol":"join_game","result":"sucess","message":"Your game was creatd with sucess!","host":games[jsonData.sessionId].host,"phantoms":games[jsonData.sessionId].phantoms,"agents":games[jsonData.sessionId].agents});
      }else{
        socket.sendMessage({"protocol":"join_game","result":"fail","message":"This game already have 3 phantoms!"});
      }
    }else{
      socket.sendMessage({"protocol":"join_game","result":"fail","message":"There is nothing game session online with this Ids!"});
    }
  }
  function UpdateGame(socket, data){
    games[jsonData.sessionId].host = jsonData.host;
    games[jsonData.sessionId].agents = jsonData.agents;
    socket.sendMessage({"protocol":"update_game","result":"sucess","message":"Your game was updated!","phantoms":games[jsonData.sessionId].phantoms})
  }
  function SyncGame(socket, data){
    if(games[jsonData.sessionId] != undefined){
      for(var i = 0; i <  games[jsonData.sessionId].phantoms.length; i++) {
        if (games[jsonData.sessionId].phantoms[i].id == jsonData.client.id) {
          games[jsonData.sessionId].phantoms[i] = jsonData.client;
          break;
        }
      }
      socket.sendMessage({"protocol":"sync_game","result":"sucess","message":"Your game was creatd with sucess!","host":games[jsonData.sessionId].host,"phantoms":games[jsonData.sessionId].phantoms,"agents":games[jsonData.sessionId].agents});
    }else{
      socket.sendMessage({"protocol":"sync_game","result":"fail","message":"The server was closed unexpectedly!"});
    }
  }