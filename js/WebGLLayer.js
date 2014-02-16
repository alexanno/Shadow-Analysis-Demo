	 var WebGLLayer = L.CanvasLayer.extend({
    setDate: function(){}
    ,
    onRemove: function(){
      this.scene.remove(this.plane);
      var container = document.getElementsByClassName('leaflet-overlay-pane')[0];
      container.removeChild(this.renderer.domElement);
      map.off({
       'viewreset': this._reset,
       'move': this._render
     }, this);
    },

    onAdd: function(){

      var self = this;

      map.setView(this.midLatLng,9);

      var width = map.getSize().x;
      var height = map.getSize().y;
      var aspect = width/height;
      var zoom = map.getZoom();

      var scene = new THREE.Scene();
      this.scene = scene;

      var renderer = new THREE.WebGLRenderer();
      renderer.setSize(width,height);
      this.renderer = renderer;

      var container = document.getElementsByClassName('leaflet-overlay-pane')[0];
      container.appendChild(renderer.domElement);

      var changeDiff = height/890 * Math.pow(2,zoom)/Math.pow(2,9) * 80;

      var camera = new THREE.OrthographicCamera( -aspect * changeDiff/2, aspect * changeDiff/2, changeDiff/2, -changeDiff/2, -40, 40 );
      this.camera = camera;
      camera.lookAt(0,0,0);
      scene.add(camera);

      renderer.setSize(width, height);
      renderer.shadowMapEnabled = true;
      renderer.shadowMapSoft = true;
      renderer.shadowMapType = THREE.PCFShadowMap;


      var terrainLoader = new THREE.TerrainLoader();
      terrainLoader.load('http://localhost:3000/terrain.bin', function(data){

       var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);
       for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        geometry.vertices[i].z = data[i] / 65535 * 10;
      }

      var material = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.2,
        shading: THREE.FlatShading
      });

      var plane = new THREE.Mesh(geometry, material);
      this.plane = plane;
      plane.castShadow = true;
      plane.receiveShadow = true;

      scene.add(plane);

    });

      var directionalLight = new THREE.DirectionalLight(0xffffff);
      this.directionalLight = directionalLight;
      directionalLight.position.set(25,25,50);
      directionalLight.target.position.set(0,0,0);
      directionalLight.castShadow = true;

      directionalLight.shadowCameraTop = 50;
      directionalLight.shadowCameraBottom = -50;
      directionalLight.shadowCameraLeft = 50;
      directionalLight.shadowCameraRight = -50;
      directionalLight.shadowCameraNear = 0;
      directionalLight.shadowCameraFar = 200;

      directionalLight.shadowMapWidth = 2048;
      directionalLight.shadowMapHeight = 2048;

      directionalLight.shadowBias = -0.0001;
      directionalLight.shadowDarkness = 1;

      scene.add(directionalLight);

      var controls = new THREE.TrackballControls(camera);
      this.controls = controls;

      this.layerCenter = map.latLngToLayerPoint(this.midLatLng);

      this.canvas = renderer.domElement;

      var radius = 50;
      this.radius = radius;
      var theta = 5;
      this.theta = theta;

      this.render();


      map.on('zoomstart', this._hide, this);
      map.on('zoomend', this._show, this);

      map.on('zoomend', function(e){
        console.log(this);
        clayer.redraw();
      });

      map.on('zoomstart', function(e){
        clayer.zoom = map.getZoom();
      })

    },

    _hide: function () {
      if(this.canvas) this.canvas.style.display = "none"
    },

  _show: function () {
    if(this.canvas) this.canvas.style.display = "inline-block"
  },

redraw: function(){

  console.log("REDRAWN!");

  var currentzoom = map.getZoom();
  var height = map.getSize().y;
  var width = map.getSize().x;
  var aspect = width/height;

  var projectedPoint = this.layerCenter;
  var projectedCurrent = map.latLngToLayerPoint(this.midLatLng);

  var offsetx, offsety;

  offsetx = (projectedCurrent.x - projectedPoint.x)
  offsety = (projectedCurrent.y - projectedPoint.y);

  var scalezoom = Math.pow(2,currentzoom)/Math.pow(2,9);

  this.canvas.style[L.DomUtil.TRANSFORM] = "translate("+offsetx+"px,"+offsety+"px) "+"scale("+scalezoom+")";

  this.zoom = currentzoom;

},

render: function(){

  this.theta += 1;
  this.directionalLight.position.x = this.radius * Math.sin( THREE.Math.degToRad( this.theta ) );
  this.directionalLight.position.y = this.radius * Math.cos( THREE.Math.degToRad( this.theta ) );

  this.controls.update();
  this.renderer.render(this.scene, this.camera);
  this.requestAnimationFrame.call(window,this.render);
}
});