// SELECT ST_AsText(ST_DelaunayTriangles(ST_Multi(ST_Collect(tgeo)))) FROM terraintrondheim WHERE terraintrondheim.tgeo && ST_MakeEnvelope(7034200,0569580,7034300,0569694,32632);

var express = require('express');
var pg = require('pg');
var app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.use(express.static(__dirname + '/assets'));


io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 2);                    // reduce logging

// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
io.set('transports', [
	'websocket'
	, 'htmlfile'
	, 'xhr-polling'
	, 'jsonp-polling'
	]);

app.listen(3000);
server.listen(3001);
console.log('Listening on port 3000');

var connString = 'tcp://steffenp@localhost:5431/steffenp';

io.sockets.on('connection', function(socket){
	console.log("connected to client");
	socket.on('dbcall', function(bbox){
		// var query = "SELECT tpgeo As nvec,ST_AsGeoJSON(t2geo) As WKT FROM terraintrondheim WHERE terraintrondheim.t2geo && ST_MakeEnvelope("+bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3]+") ORDER BY tpgeo;";
		var query = "SELECT ST_AsGeoJSON(t2geo) As WKT FROM terraintrondheim WHERE terraintrondheim.t2geo && ST_MakeEnvelope("+bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3]+");";
		pg.connect(connString, function(err, client, done){
			if(client != null){
				client.query(query, function(err, result) {
					if(result.rows[0] != undefined) {
						console.log(result);
						socket.emit('dbresponse', result);
					}
					done();
				});
			}
		});
	});
});