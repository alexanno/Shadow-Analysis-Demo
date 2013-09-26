var jsonpolygons; //polygons for the shadow
var map = L.map('map');

// var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// var osmAttrib='Map data © OpenStreetMap contributors';
// var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

var topo2enkel = L.tileLayer.wms("http://opencache.statkart.no/gatekeeper/gk/gk.open?SERVICE=WMS&", {
    layers: 'norges_grunnkart',
    format: 'image/png',
    transparent: true,
    attribution: "Maptiles and Digital Terrain Model from <a href='http://www.statkart.no/Kart/Kartverksted/Visningstjenester/''>Kartverket</a>"
});

L.control.scale({
	position: 'topright',
	imperial: false
}).addTo(map);
L.control.locate().addTo(map);
map.setView(new L.LatLng(63.4305077539775, 10.395039268075),13);
map.addLayer(topo2enkel);

var canvasLayer = L.CanvasLayer.extend({
	render: function(){
		var canvas = this.getCanvas();
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		// ctx.fillStyle = 'grey';
		ctx.globalAlpha = 0.5;

		if(jsonpolygons != undefined && map.getZoom() > 11){
			for(var i=0; i<jsonpolygons.coordinates.length; i++){
				polygon = jsonpolygons.coordinates[i];
				ctx.beginPath();
				for(var j=0; j<polygon[0].length;j++){
					var coordinate = polygon[0][j];
					var drawpoints = map.latLngToContainerPoint(new L.LatLng(coordinate[1],coordinate[0]));
					if(i == 0){
						ctx.moveTo(drawpoints.x,drawpoints.y);
					}
					else{
						ctx.lineTo(drawpoints.x,drawpoints.y);
					}
				};
				ctx.closePath();
				ctx.fillStyle = "rgb("+
  					Math.floor(Math.random()*256)+","+
  					Math.floor(Math.random()*256)+","+
  					Math.floor(Math.random()*256)+")";
				ctx.fill();
				debugger
				// console.log(getNormalVector(polygon[0]));
			};
		}
		stackBlurCanvasRGB(canvas,0,0,canvas.width,canvas.height,25);


	}
});

var clayer = new canvasLayer();
clayer.addTo(map);


// connects to db
var socket = io.connect('http://localhost:3000');

// request polygons data
var bounds = map.getBounds();
var bbox = [bounds.getEast(),bounds.getNorth(),bounds.getWest(),bounds.getSouth()];
socket.emit('dbcall', bbox);

map.on('moveend', function(e){
	var bounds = map.getBounds();
	var bbox = [bounds.getEast(),bounds.getNorth(),bounds.getWest(),bounds.getSouth()];
	socket.emit('dbcall', bbox);
});

// recieve delaunay triangles
socket.on('dbresponse', function(polygons){
	jsonpolygons = JSON.parse(polygons);
	clayer.redraw();
});

var getNormalVector = function(polygon){
	var normal = [0,0,0];
	for(var i = 0; i<polygon.length; i++){
		var current = polygon[i];
		var next = polygon[i+1] % polygon.length;
		normal[0] = normal[0] + ((current[1]-next[1])*(current[2]+next[2]));
		normal[1] = normal[1] + ((current[2]-next[2])*(current[0]+next[0]));
		normal[2] = normal[2] + ((current[0]-next[0])*(current[1]+next[1]));
	}
	return normalizeVector(normal);
};

var normalizeVector = function(vec){
	var veclength = vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2];
	vec[0] = vec[0]/veclength;
	vec[1] = vec[1]/veclength;
	vec[2] = vec[2]/veclength;
	return vec;
};
