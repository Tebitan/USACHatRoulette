
var uuid = require('node-uuid');

conectados 		= [];
rooms_sinPareja	= [];
rooms_conPareja	= [];

exports.start = function(http){	
	var io = require('socket.io').listen(http);
	io.sockets.on('connection', function(socket){ //Cada vez que un usuario se conecte							
		//updateConectados(socket);
		inicio_sesion(socket);
		manejo_chat(socket);		
		mensaje(socket);
		desinscribir_pareja(socket);
		detener(socket);
		cerrar_sesion(socket);
	});	

	//Esta función realiza el proceso de inicio de sesion de un cliente por parte del servidor
	function inicio_sesion(socket){
		socket.on('nuevo usuario', function(data, callback){	
			if (conectados.indexOf(data) != -1 ){ // Si el nick ya existe se envia false al cliente
				callback(false);
			}
			// Si no
			else{
				//id_room = null;
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
	function manejo_chat(socket){
		socket.on('nuevo chat', function(data){
			var indice = -1;
			for(var i = 0; i < rooms_sinPareja.length; i++){ 	//se busca un usuario sin pareja que este esperando
				if(rooms_sinPareja[i].nickname != data && rooms_sinPareja[i].nickname != socket.nickname){
					indice = i;										
					break;
				}
			}						
			//si no se encontro pareja
			if(indice == -1){//crear room y esperar
				//socket.pareja = null;
				rooms_sinPareja.push(socket);
				socket.emit('pareja esperando', function(data){
				});
				//callback(false);
			}
			//si no
			else{//unirse al room con la pareja encontrada
				socket.pareja = rooms_sinPareja[indice]; //Asignamos la pareja encontrada a quien buscaba
				rooms_sinPareja[indice].pareja = socket;
				rooms_sinPareja.splice(indice,1);	//elimino al usuario encontrado de la lista de sin pareja
				socket.emit('pareja encontrada', socket.pareja.nickname);
				socket.pareja.emit('pareja encontrada', socket.nickname);

				//callback(true);
			}			
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
			socket.emit('nuevo mensaje', {msg: data, nick: socket.nickname});
			socket.pareja.emit('nuevo mensaje', {msg: data, nick: socket.nickname});
			//socket.broadcast.emit('new message', data);
		});
	}
	function detener(socket){
		socket.on('parar chat', function(data){
			if(rooms_sinPareja.indexOf(socket)!= -1){//si estaba esperando pareja
			rooms_sinPareja.splice(rooms_sinPareja.indexOf(socket),1);//me quito de la lista
			}
			if(data != ""){

				socket.pareja.emit('pareja abandono', data);
			}
		});
	}
	function desinscribir_pareja(socket){
		socket.on('desinscribe', function(data){			
				socket.pareja.emit('pareja cambio', data);			
		});
	}
	function cerrar_sesion(socket){	/*
			Este evento se emite cuando algun usuario se desconecta del servidor
			una gran ayuda de socket.io
		*/
		socket.on('disconnect', function(data){
			if(rooms_sinPareja.indexOf(socket)!= -1){//si estaba esperando pareja
				rooms_sinPareja.splice(rooms_sinPareja.indexOf(socket),1);//me quito de la lista
			}
			//esto es cuando alguien se va sin haber elegido un nick
			if(!socket.nickname) return;
			//la función splice nos ayudará a eliminar ese nick que ya no está conectado
			conectados.splice(conectados.indexOf(socket.nickname),1);
			//avisamos a la pareja que el usuario abandono el chat
			socket.pareja.emit('pareja abandono', data);
			//llamamos a la función para enviar los usuarios que estan en linea
			updateConectados();
		});	
	}
}
