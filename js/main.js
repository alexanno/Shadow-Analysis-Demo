var jsonpolygons; //polygons for the shadow
var date = new Date();
var map = L.map('map');
var clayer;
var computationDate = new Date();

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
map.addLayer(topo2enkel);

$('#webgl').click(function(){
		$('#sunSlider').hide();
	map.removeLayer(clayer);
	map.setView(new L.LatLng(63.489981300706,9.97621768721757),9);
	clayer = new WebGLLayer();
	clayer.addTo(map);
});
var hour = 10;
$('#buildings').click(function(){
	$('#sunSlider').show();
	map.removeLayer(clayer);
	map.setView(new L.LatLng(63.4305077539775, 10.395039268075),17);
		clayer = new OSMBuildings(map).loadData();
		clayer.setDate(computationDate);
});

map.setView(new L.LatLng(63.489981300706,9.97621768721757),9);
clayer = new WebGLLayer();
clayer.addTo(map);

L.marker([63.891678,9.059992]).addTo(map);

  map.on('zoomend', function(e){
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

var hourval = 0;
var dateval = 0;
$( ".slidertime" ).slider({'max': 48, 'value':24})
.on('slide', function(ev){
	hourval = ev.value-24;
	computationDate = new Date(new Date().getTime()+hourval*3600000+dateval*3600000*24);
	updateDate();

});
$( ".sliderdate" ).slider({'max': 365, 'value':182, 'tooltip':'hide'})
.on('slide', function(ev){
	dateval = ev.value-182;
	computationDate = new Date(new Date().getTime()+hourval*3600000+dateval*3600000*24);
	updateDate();
});

updateDate();
function updateDate() {
	$('#datedisplay').text(computationDate.toLocaleString());
	if(typeof clayer !== 'undefined'){clayer.setDate(computationDate);}
}
