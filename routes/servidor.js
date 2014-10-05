
conectados 	= [];	
con_pareja 	= [];
sin_pareja 	= [];
rooms 	   	= [];

exports.start = function(http){	

	var io = require('socket.io').listen(http);

	io.sockets.on('connection', function(socket){ //Cada vez que un usuario se conecte					
			
		//updateConectados(socket);

		inicio_sesion(socket);
		iniciar_chat(socket);
		mensaje(socket);
		cerrar_sesion(socket);
	});	

	//Esta función realiza el proceso de inicio de sesion de un cliente por parte del servidor
	function inicio_sesion(socket){
		socket.on('nuevo usuario', function(data, callback){
		
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
				//... a la de sin_pareja
				sin_pareja.push(socket.nickname);
				//enviamos el areglo actualizado de usuarios conectados
				updateConectados();
			}
		});
	}

	function iniciar_chat(socket){
		socket.on('nuevo chat', function(data, callback){
			
			for(var i = 0; i < sin_pareja.length; i++){

				if(sin_pareja[i] != socket.nickname){
																														
				}
			}

			io.sockets.emit('listo chat', conectados);


		});
	}

	//Esta función hace emit con los usuarios conectados, de esta forma el cliente los recibe 	
	function updateConectados(){
		io.sockets.emit('nicks', conectados);
	}

	//Esta funcion recibe el mensaje enviado desde el cliente	
	function mensaje(socket){
		socket.on('enviar mensaje', function(data){
			//	
			io.sockets.emit('nuevo mensaje', {msg: data, nick: socket.nickname});
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
