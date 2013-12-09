function TINCanvasLayer(){
	canvasLayer = L.CanvasLayer.extend({
	render: function(){
		var canvas = this.getCanvas();
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.globalAlpha = 0.5;

		if(jsonpolygons != undefined && map.getZoom() > 2){
			for(var i=0; i<jsonpolygons.rowCount;i++){

				var polygon = JSON.parse(jsonpolygons.rows[i].wkt);
				//var nvec = jsonpolygons.rows[i].nvec.split(' ');
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
				//var angle = getAngleBetweenVectors(sunvec,nvec);
				var angle = 0.3;
				var amount = angle/2*Math.PI;
				ctx.fillStyle = "hsl(0,0%,"+amount*100+"%)";
				ctx.fill();
				}
			}
		},
		initredraw: function(bounds){
			var bbox = [bounds.getEast(),bounds.getNorth(),bounds.getWest(),bounds.getSouth()];
			socket.emit('dbcall', bbox);
			this.redraw();
		}
	});
	this.alayer = new canvasLayer();
}