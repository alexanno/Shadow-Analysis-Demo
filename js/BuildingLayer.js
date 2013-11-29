function buildingLayer(){
	canvasLayer = L.CanvasLayer.extend({
	render: function(){

		
		
		},
		initredraw: function(bounds){
			// var bbox = [bounds.getEast(),bounds.getNorth(),bounds.getWest(),bounds.getSouth()];
			// socket.emit('dbcall', bbox);
			// this.redraw();
		}
	});
	this.alayer = new canvasLayer();
}