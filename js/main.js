var jsonpolygons; //polygons for the shadow
var date = new Date();
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
map.setView(new L.LatLng(63.4305077539775, 10.395039268075),11);
map.addLayer(topo2enkel);

var canvasLayer = L.CanvasLayer.extend({
	render: function(){
		var canvas = this.getCanvas();
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.globalAlpha = 0.5;

	
		if(jsonpolygons != undefined && map.getZoom() > 2){
			for(var i=0; i<jsonpolygons.rowCount;i++){

				var polygon = JSON.parse(jsonpolygons.rows[i].wkt);
				var nvec = jsonpolygons.rows[i].nvec.split(' ');
				ctx.beginPath();
				var coordinates = polygon.coordinates[0];
				for(var j=0; j<coordinates.length;j++){
					var coordinate = coordinates[j];
					var drawpoints = map.latLngToContainerPoint(new L.LatLng(coordinate[1],coordinate[0]));
					drawpoints.x	 = (0.5 + drawpoints.x) << 0;
					drawpoints.y = (0.5 + drawpoints.y) << 0;
					if(j == 0){
						ctx.moveTo(drawpoints.x,drawpoints.y);
					}
					else{
						ctx.lineTo(drawpoints.x,drawpoints.y);
					}
				}
				var sunvec = getSunVector(map.getCenter());
				var angle = getAngleBetweenVectors(sunvec,nvec);
				var amount = angle/2*Math.PI;
				ctx.fillStyle = "hsl(0,0%,"+amount*100+"%)";
				ctx.fill();
			}
		}
		// stackBlurCanvasRGB(canvas,0,0,canvas.width,canvas.height,25);
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
socket.on('dbresponse', function(result){
	jsonpolygons = result;
	console.log(result);
	clayer.redraw();
});

function getSunVector(latLng){
	var sunsphere = SunCalc.getSunPosition(date,latLng.lat,latLng.lng);
	var sunvec = [Math.sin(sunsphere.altitude)*Math.cos(sunsphere.azimuth),Math.sin(sunsphere.altitude)*Math.sin(sunsphere.azimuth),Math.cos(sunsphere.altitude)];
	return sunvec;
}

function getAngleBetweenVectors(sunvec,nvec){
	var dot = sunvec[0]*nvec[0]+sunvec[1]*nvec[1]+sunvec[2]*nvec[2];
	var lensun = Math.sqrt(sunvec[0]*sunvec[0]+sunvec[1]*sunvec[1]+sunvec[2]*sunvec[2]); 
	var lennvec = Math.sqrt(nvec[0]*nvec[0]+nvec[1]*nvec[1]+nvec[2]*nvec[2]);
	return Math.acos(dot/(lensun*lennvec));
}