function buildingLayer(){
	canvasLayer = L.CanvasLayer.extend({
	render: function(){
		},
		initredraw: function(bounds){
		}
	});
	this.alayer = new canvasLayer();
}