var jsonpolygons; //polygons for the shadow
var date = new Date();
var map = L.map('map');
var clayer;

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

$('#tin').button('toggle');
clayer = new TINCanvasLayer().alayer;
clayer.addTo(map);

$('#tin').click(function(){
	map.removeLayer(clayer);
	clayer = new TINCanvasLayer().alayer;
	clayer.addTo(map);
});

$('#webgl').click(function(){
	map.removeLayer(clayer);
	clayer = new WebGLLayer().alayer;
	clayer.addTo(map);
});

// connects to db
var socket = io.connect('http://localhost:3000');

// request polygons data
var bounds = map.getBounds();
var bbox = [bounds.getEast(),bounds.getNorth(),bounds.getWest(),bounds.getSouth()];
socket.emit('dbcall', bbox);

map.on('moveend', function(e){
	clayer.initredraw(map.getBounds());
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