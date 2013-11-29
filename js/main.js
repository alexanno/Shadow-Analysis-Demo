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

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});		

L.control.scale({
	position: 'topright',
	imperial: false
}).addTo(map);
L.control.locate().addTo(map);
map.setView(new L.LatLng(63.4305077539775, 10.395039268075),18);
// map.setView(new L.LatLng(61.512,8.286),11);
// map.setView(new L.LatLng(52.52064, 13.37356),18);
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
	map.setView(new L.LatLng(52.52064, 13.37356),18);
	clayer = new WebGLLayer().alayer;
	clayer.addTo(map);
});
var hour = 10;
$('#buildings').click(function(){
	map.removeLayer(clayer);
	map.setView(new L.LatLng(63.4305077539775, 10.395039268075),18);
	$.getJSON("http:localhost:3000/buildings_trh.geojson",function(buildings){
	// var jsonbuildings = $.parseJSON(buildings);
	var osmb = new OSMBuildings(map).setData(buildings);
	osmb.setDate(new Date(2013,06,02,hour));
	map.addLayer(osmb);
	setInterval(function(){
		hour +=0.1;
		osmb.setDate(new Date(2013,06,02,hour));
	}),10000
	});

});

// connects to db
var socket = io.connect('http://localhost:3001');

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