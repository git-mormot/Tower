if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var camera, scene, renderer, dirLight, hemiLight, controls;
var stats;
var tower;
var clock = new THREE.Clock();



function init() {
	var container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 300, 300, 300 );	

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
	scene.fog.color.setHSL( 0.6, 0, 1 );
	
	// LIGHTS
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );

	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;

	var d = 1000;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = 0.0001;

	// GROUND
	var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );
	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	// ground.position.y = -33;
	scene.add( ground );

	ground.receiveShadow = true;

	// SKYDOME
	var vertexShader = 'varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }';
	var fragmentShader = 'uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main() { float h = normalize( vWorldPosition + offset ).y; gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 ); }';
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 10 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );
	scene.fog.color.copy( uniforms.bottomColor.value );
	var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.soft = true;
	renderer.shadowMap.renderReverseSided = false;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3( 0.0, 40.0, 0.0 );
	// controls.maxPolarAngle = Math.PI * 0.5;
	// controls.enablePan = false;
	controls.update();
	// controls.enableDamping = true;
	// controls.dampingFactor = 0.25;
	// controls.enableZoom = false;

	// STATS
	stats = new Stats();
	container.appendChild( stats.dom );

	tower = new Tower( scene, { height: 160.0} );
	tower.setup();
	tower.loadAnimData();

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onKeyDown ( event ) {
	switch ( event.keyCode ) {
		case 72: // h
		// hemiLight.visible = !hemiLight.visible;
		// tower.toggle3DHistoricPlotter();
		break;
		case 68: // d
		// dirLight.visible = !dirLight.visible;
		break;
		case 49:
			tower.changeCurveMode(0);
			break;
		case 50:
			tower.changeCurveMode(1);
			break;
		case 51:
			tower.changeCurveMode(2);
			break;
	}
}

function animate() {
	requestAnimationFrame( animate );
	tower.update();
	render();
	stats.update();
}

function render() {
	var delta = clock.getDelta();
	// for ( var i = 0; i < mixers.length; i ++ ) {
	// 	mixers[ i ].update( delta );
	// }
	renderer.render( scene, camera );
}

$(document).ready( function() {
	$('#ex1').slider({
		// formatter: function(value) {
		// 	return 'Current value: ' + value;
		// }
	});

	$('#ex2').slider({});

	$("#ex1").on("slide", function(slideEvt) {
		$("#speed-scale-value").text( 'Speed(*' + slideEvt.value + '):');
		tower.tick_time = 0.1 / slideEvt.value;
	});

	$("#ex2").on("slideStop", function(slideEvt) {
		$("#vibra-scale-value").text( 'Vibra(*' + slideEvt.value + '):');
		tower.vibra_scale = slideEvt.value;
		tower.updatePolarTickLabel();
	});
	
	$("#speed-scale-value").text( 'Speed(*' +$('#ex1').slider( 'getValue' ) + '):');
	$("#vibra-scale-value").text( 'Vibra(*' +$('#ex2').slider( 'getValue' ) + '):');

	$('.play .btn').on( 'click', function() {
		if ( $(this).find('.fa').hasClass( 'fa-play') ) {
			$(this).find('.fa').removeClass( 'fa-play' );
			$(this).find('.fa').addClass( 'fa-pause' );
			tower.play();
		} else {
			$(this).find('.fa').removeClass( 'fa-pause' );
			$(this).find('.fa').addClass( 'fa-play' );
			tower.pause();
		}
	} );

	$('.stop .btn').on( 'click', function() {
		if ( $('.play .btn').find('.fa').hasClass( 'fa-pause') ) {
			$('.play .btn').find('.fa').removeClass( 'fa-pause' );
			$('.play .btn').find('.fa').addClass( 'fa-play' );
		}
		tower.stop();
	} );

	$('#plotter-switch').on( 'click', function() {
		if ( $(this).text() == 'Historic') {
			$('#historic-view-container').hide();
			$('#live-view-container').show();
			$(this).text( 'Live' );
		} else {
			$('#historic-view-container').show();
			$('#live-view-container').hide();
			$(this).text( 'Historic' );
		}
	} );

	init();
	animate();

} );