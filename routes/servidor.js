
conectados = [];	
con_pareja = [];
sin_pareja = [];

exports.start = function(http){	

	var io = require('socket.io').listen(http);

	io.sockets.on('connection', function(socket){ //Cada vez que un usuario se conecte					
			
		//updateConectados(socket);
		inicio_sesion(socket);
		mensaje(socket);
		cerrar_sesion(socket);
	});	

	//Esta función realiza el proceso de inicio de sesion de un cliente por parte del servidor
	function inicio_sesion(socket){
		socket.on('new user', function(data, callback){
		
			if (conectados.indexOf(data) != -1){ // Si el nick ya existe se envia false al cliente
				callback(false);
			}
			// Si no
			else{
				//enviamos true al cliente
				callback(true);
				// Guardamos el nick del usuario, para luego poder mostrarlo
				socket.nickname = data;
				// Agregamos al usuario al arreglo de conectados
				conectados.push(socket.nickname);
				//enviamos el areglo actualizado de usuarios conectados
				updateConectados();
			}
		});
	}

	function iniciar_chat(socket){
		socket.on('new chat', function(data){
			io.sockets.emit('mensaje inicio', conectados);
		});
	}

	//Esta función hace emit con los usuarios conectados, de esta forma el cliente los recibe 	
	function updateConectados(){
		io.sockets.emit('usernames', conectados);
	}

	//Esta funcion recibe el mensaje enviado desde el cliente	
	function mensaje(socket){
		socket.on('send message', function(data){
			//	
			io.sockets.emit('new message', {msg: data, nick: socket.nickname});
			//socket.broadcast.emit('new message', data);
		});
	}
	
	function cerrar_sesion(socket){	/*
			Este evento se emite cuando algun usuario se desconecta del servidor
			una gran ayuda de socket.io
		*/
		socket.on('disconnect', function(data){
			//esto es cuando alguien se va sin haber elegido un nick
			if(!socket.nickname) return;
			//la función splice nos ayudará a eliminar ese nick que ya no está conectado
			conectados.splice(conectados.indexOf(socket.nickname),1);
			//llamamos a la función para enviar los usuarios que estan en linea
			updateConectados();
		});	
	}
}
