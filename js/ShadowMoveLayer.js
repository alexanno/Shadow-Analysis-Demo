function WebGLLayer(){
	canvasLayer = L.CanvasLayer.extend({
		render: function(){
			this.camera.position.x += 1;
			this.camera.position.y += 1;
			this.camera.position.z += 1;
			this.renderer.render(this.scene, this.camera);
			this.requestAnimationFrame.call(window,this.render);
		},
		onRemove: function(){
			var container = document.getElementsByClassName('leaflet-overlay-pane')[0];
			container.removeChild(this.renderer.domElement);
			map.off({
				'viewreset': this._reset,
				'move': this._render
			}, this);
		},
		onAdd: function(){
			var width = map.getSize().x;
			var height = map.getSize().y;

			var container = document.getElementsByClassName('leaflet-overlay-pane')[0];

			var view_angle = 45,
			aspect = width / height,
			near = 0.1,
			far = 10000;


			var renderer = new THREE.WebGLRenderer();
			var camera =
			new THREE.PerspectiveCamera(
				view_angle,
				aspect,
				near,
				far);

			var scene = new THREE.Scene();
			this.scene = scene;

			scene.add(camera);

			camera.position.z = 300;
			this.camera = camera;

			renderer.setSize(width, height);

			var geom = new THREE.Geometry();
			var v1 = new THREE.Vector3(0,0,0);
			var v2 = new THREE.Vector3(600,0,0);
			var v3 = new THREE.Vector3(600,600,0);
			geom.vertices.push(v1);
			geom.vertices.push(v2);
			geom.vertices.push(v3);

			geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
			geom.computeFaceNormals();

			var mesh= new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
			scene.add(mesh);

			this.renderer = renderer;
			this.render();

			container.appendChild(renderer.domElement);
		},

		initredraw: function(){
			this.redraw();
		}
	});
this.alayer = new canvasLayer();
}