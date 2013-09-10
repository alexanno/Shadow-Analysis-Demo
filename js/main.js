var map = L.map('map').setView([60, 10], 13);

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

var topo2enkel = L.tileLayer.wms("http://opencache.statkart.no/gatekeeper/gk/gk.open?SERVICE=WMS&", {
    layers: 'norges_grunnkart',
    format: 'image/png',
    transparent: true,
    attribution: "Maptiles from <a href='http://www.statkart.no/Kart/Kartverksted/Visningstjenester/''>Kartverket</a>"
});

// start the map in South-East England
L.control.scale({
	position: 'topright',
	imperial: false
}).addTo(map);
L.control.locate().addTo(map);
map.setView(new L.LatLng(63.4305077539775, 10.395039268075),10);
map.addLayer(topo2enkel);

