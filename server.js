var PORT = 1234;
var io = require('socket.io').listen(PORT);

var users = {};
io.sockets.on('connection', function (socket) {
  socket.on('register', function (data) {
    users[data.name] = socket;
    socket.set('name', data.name);
    console.log('Register: ' + data.name);
    socket.emit('system', {code:0, from:'system', msg:'註冊成功'});
    var list = [];
    for(var key in users)
    	list.push(key);
    socket.emit('list', {list:list});
    socket.broadcast.emit('list', {list: list});
  });

  socket.on('disconnect', disconnect);
  socket.on('disconnectByUser', disconnect);
  

  socket.on('private', function(data){
  	socket.get('name', function(err, name){
  		if(users.hasOwnProperty(data.sendto)){
  			users[data.sendto].emit('chat', {from: name,type:'private', msg: data.msg});
  		} else {
  			socket.emit('system', {code:1, from:'system', msg:'無此ID'});
  		}
  	});
  });

  socket.on('public', function(data){
  	socket.get('name', function(err, name){
  		socket.broadcast.emit('chat', {from: name, type:'public', msg: data.msg});
  	});
  });

  function disconnect(){

  	socket.get('name', function(err, name){
  		console.log('Disconnected: ' + name);
  		delete users[name];
  		var list = [];
  		for(var key in users)
	    	list.push(key);
	    socket.broadcast.emit('list', {list: list});
	    console.log('broadcast: disconnect');
  	});
  	  
  }

});