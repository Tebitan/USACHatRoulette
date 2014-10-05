
var express = require('express'),                 //hacemos el require a express
    app     = express(),                          //iniciamos nuestra aplicacion con express
    server  = require('http').createServer(app),  //creamos un servidor http, necesario para usar socket.io
    io      = require('socket.io').listen(server),//socket que usaremos
    rutas   = require('./routes'),
    servidor = require('./routes/servidor');



server.listen(3000);

//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

// Rutas

//app.get('/', rutas.index);
app.get("/", function(req, res){
  res.sendfile(__dirname + '/views/index.html');
});

servidor.start(server);

console.log("Servidor ejecutándose en: Localhost:3000.");


