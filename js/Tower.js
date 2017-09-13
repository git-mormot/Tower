// added by kenneth davis
// this is for testing git merge tool.
// will be changed for optimizing.
var CurveTower = function() {
	var g_tower_curve = new THREE.CatmullRomCurve3();
	var g_tower_obj = new THREE.Mesh();
	var g_stiff_coff_0 = [ 0.0, 0.001427, 0.005709, 0.012846, 0.022932, 0.035967, 0.051953, 0.071602, 0.094391, 0.120605, 0.149864, 0.182359, 0.217993, 0.25967, 0.305676, 0.355583, 0.409772, 0.467862, 0.529568, 0.599029, 0.673343, 0.751225, 0.832485, 0.915505, 1.0 ];
	var g_stiff_coff_1 = [ 0.0000, 0.009845, 0.038104, 0.083440, 0.143665, 0.217198, 0.300942, 0.395503, 0.495290, 0.597144, 0.696323, 0.789365, 0.872258, 0.942388, 0.986813, 1.0000, 0.977271, 0.914859, 0.810270, 0.644910, 0.416226, 0.131146, -0.204132, -0.573382, -0.962747 ];
	var g_stiff_coff_2 = [ -0.0000, -0.010955, -0.077869, -0.162822, -0.265434, -0.376427, -0.483841, -0.579960, -0.649958, -0.683998, -0.673865, -0.615033, -0.503136, -0.334645, -0.109745, 0.148605, 0.418909, 0.671848, 0.878056, 1.0000, 0.978996, 0.796547, 0.453146, -0.019873, -0.571400 ];
	var g_stiff_coff = g_stiff_coff_0;

	this.update = function( pTopXOffset, pTopZOffset ) {
		g_tower_curve.points = [];
		for ( var i = 0; i < g_stiff_coff.length; i++ ) {
			g_tower_curve.points.push( new THREE.Vector3( g_stiff_coff[i] * pTopXOffset, 160.0 * i / ( g_stiff_coff.length - 1 ), g_stiff_coff[i] * pTopZOffset ) );
		}

		g_tower_obj.geometry.dispose();
		g_tower_obj.geometry = new THREE.TubeGeometry( g_tower_curve, 64, 1, 12, false );
	}

	this.addToScene = function( pScene, pConfig ) {
		for ( var i = 0; i < g_stiff_coff.length; i++ ) {
			g_tower_curve.points.push( new THREE.Vector3( 0.0, 160.0 * i / ( g_stiff_coff.length - 1 ), 0.0 ) );
		}

		g_tower_obj.material = new THREE.MeshPhongMaterial( {color: 0x00ff00, transparent: true, opacity: 0.5} );
		g_tower_obj.geometry = new THREE.TubeGeometry( g_tower_curve, 64, 1, 12, false );
		g_tower_obj.name = 'CurveTower';
		pScene.add( g_tower_obj );
	}

	this.changeCurveMode = function( pMode ) {
		switch ( pMode ) {
			case 0:
				g_stiff_coff = g_stiff_coff_0;
				break;
			case 1:
				g_stiff_coff = g_stiff_coff_1;
				break;
			case 2:
				g_stiff_coff = g_stiff_coff_2;
				break;
			default:
				g_stiff_coff = g_stiff_coff_0;
				break;
		}
	}
}

var Tower = function( pScene, pConfig ) {

	var scope = this;
	var g_scene = pScene;
	var g_config = pConfig;
	var g_anim_data = null;
	var g_anim_data_ex = null;
	var g_tower_obj, g_tower_obj_ref, g_tick_mark_obj;
	var g_3d_historic_obj = null;
	var g_critical_circle_obj = null;

	var g_clock = new THREE.Clock( false );
	var g_remain_time = 0;
	var g_current_frame = 0;
	var g_current_frame_ex = 0;

	var g_historic_plot_ctx;
	var g_live_plot_ctx;
	var g_twist_plot_ctx;

	var g_font;

	var g_polar_tick_label_obj = null;

	var g_red_mat = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	var g_blue_mat = new THREE.MeshBasicMaterial( { color: 0x0000ff } );

	var POLAR_GRID_HEIGHT = 1.0;
	var RAD = 3.14 / 180.0;
	var TOWER_HEIGHT = 160.0;

	this.tick_time = 0.1;
	this.vibra_scale = 1.0;

	this.setup = function() {

		// create tower object ( using box geo ).
		var geometry = new THREE.CylinderGeometry( g_config.height * 0.01, g_config.height * 0.01, g_config.height, 16, 1 );
		var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, transparent: true, opacity: 0.5} );
		var cube = new THREE.Mesh( geometry, material );
		cube.position.y = g_config.height * 0.5;
		cube.castShadow = true;
		var tower_obj = new THREE.Object3D();
		tower_obj.name = 'tower';
		tower_obj.add( cube );
		// g_scene.add( tower_obj );
		// g_tower_obj = tower_obj;

		g_tower_obj = new CurveTower();
		g_tower_obj.addToScene( g_scene );

		var path = "map/skybox/";
		var format = '.jpg';
		var urls = [
				path + 'px' + format, path + 'nx' + format,
				path + 'py' + format, path + 'ny' + format,
				path + 'pz' + format, path + 'nz' + format
			];
		var reflectionCube = new THREE.CubeTextureLoader().load( urls );
		reflectionCube.format = THREE.RGBFormat;

		geometry = new THREE.CylinderGeometry( g_config.height * 0.0025, g_config.height * 0.0025, g_config.height, 16, 1 );
		material = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: reflectionCube} );
		cube = new THREE.Mesh( geometry, material );
		cube.position.y = g_config.height * 0.5;
		tower_obj = new THREE.Object3D();
		tower_obj.name = 'tower_ref';
		tower_obj.add( cube );
		g_scene.add( tower_obj );
		g_tower_obj_ref = tower_obj;

		// create tick mark object.
		geometry = new THREE.SphereGeometry( 0.5 );
		material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
		g_tick_mark_obj = new THREE.Mesh( geometry, material );
		g_tick_mark_obj.name = 'tick_mark';
		g_scene.add( g_tick_mark_obj );

		// create polar grid.
		var radius = TOWER_HEIGHT;
		var radials = 16;
		var circles = 20;
		var divisions = 64;

		var helper = new THREE.PolarGridHelper( radius, radials, circles, divisions, 0x888888, 0x444444 );
		helper.position.y = POLAR_GRID_HEIGHT;
		g_scene.add( helper );

		// create NESW mark.
		var loader = new THREE.FontLoader();
		loader.load( 'js/helvetiker_regular.typeface.json', function ( font ) {

			g_font = font;

			var textShape_N = new THREE.BufferGeometry();
			var textShape_E = new THREE.BufferGeometry();
			var textShape_S = new THREE.BufferGeometry();
			var textShape_W = new THREE.BufferGeometry();
			var matLite = new THREE.MeshBasicMaterial( {
				color: 0xff0000,
				// transparent: true,
				// opacity: 0.4,
				side: THREE.DoubleSide
			} );

			// FIX : optimize following code.

			var text = _generateLabelMesh( 'N', 10, 2, -Math.PI * 0.5, 0, matLite );
			text.position.set( 0, POLAR_GRID_HEIGHT, -TOWER_HEIGHT - 5.0 );
			g_scene.add( text );

			text = _generateLabelMesh( 'E', 10, 2, -Math.PI * 0.5, -Math.PI * 0.5, matLite );
			text.position.set( TOWER_HEIGHT + 5.0, POLAR_GRID_HEIGHT, 0 );
			g_scene.add( text );

			text = _generateLabelMesh( 'S', 10, 2, -Math.PI * 0.5, Math.PI, matLite );
			text.position.set( 0, POLAR_GRID_HEIGHT, TOWER_HEIGHT + 5.0 );
			g_scene.add( text );

			text = _generateLabelMesh( 'W', 10, 2, -Math.PI * 0.5, Math.PI * 0.5, matLite );
			text.position.set( -TOWER_HEIGHT - 5.0, POLAR_GRID_HEIGHT, 0 );
			g_scene.add( text );

			var _x = Math.cos( Math.PI * 0.25 ) * ( TOWER_HEIGHT + 5.0 );
			var _z = Math.sin( Math.PI * 0.25 ) * ( TOWER_HEIGHT + 5.0 );

			text = _generateLabelMesh( '%', 10, 2, -Math.PI * 0.5, -Math.PI * 0.25, g_blue_mat );
			text.position.set( _x, POLAR_GRID_HEIGHT, -_z );
			g_scene.add( text );

			text = _generateLabelMesh( '%', 10, 2, -Math.PI * 0.5, -Math.PI * 0.75, g_blue_mat );
			text.position.set( _x, POLAR_GRID_HEIGHT, _z );
			g_scene.add( text );

			text = _generateLabelMesh( '%', 10, 2, -Math.PI * 0.5, -Math.PI * 1.25, g_blue_mat );
			text.position.set( -_x, POLAR_GRID_HEIGHT, _z );
			g_scene.add( text );

			text = _generateLabelMesh( '%', 10, 2, -Math.PI * 0.5, -Math.PI * 1.75, g_blue_mat );
			text.position.set( -_x, POLAR_GRID_HEIGHT, -_z );
			g_scene.add( text );

			generatePolarTickLabel( font, TOWER_HEIGHT, 4, 11 );

			function _generateLabelMesh( pStr, pSize, pDivision, pRotX, pRotY, pMat ) {
				var shapes = font.generateShapes( pStr, pSize, pDivision );
				var geometry = new THREE.ShapeGeometry( shapes );
				geometry.computeBoundingBox();
				var xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
				geometry.translate( xMid, 0, 0 );
				geometry.rotateX( pRotX );
				geometry.rotateY( pRotY );
				var textShape = new THREE.BufferGeometry();
				textShape.fromGeometry( geometry );
				var text = new THREE.Mesh( textShape, pMat );

				return text;
			}

		} );

		// create critical circle.
		generateCriticalCircle();

		// for 2D plotters.
		g_historic_plot_ctx = document.getElementById("historic-view-container").getContext("2d");
		g_live_plot_ctx = document.getElementById("live-view-container").getContext("2d");
		g_twist_plot_ctx = document.getElementById("twist-view-container").getContext("2d");
		
	}

	this.loadAnimData = function() {
		$.ajax({
			url: "sample.data", 
			dataType: 'json',
			success: function( result ) {
	        	g_anim_data = result;
	        	console.log( 'data loaded ');

	        	draw2DPlotterCoord( g_historic_plot_ctx );
	        	draw2DPlotterCoord( g_live_plot_ctx );
				
				//3D plotter
				/*
				var pointGeometry = new THREE.Geometry();

				for ( var i = 0; i < 3000; i ++ ) {

					var star = new THREE.Vector3();

					star.set ( -g_anim_data.x[i] * 20, POLAR_GRID_HEIGHT, g_anim_data.y[i] * 20 );

					pointGeometry.vertices.push( star )

				}

				var pointMaterial = new THREE.PointsMaterial( { 
					color: 0x000000, 
					sizeAttenuation: false, 
					size: 3
				} )

				g_3d_historic_obj = new THREE.Object3D();

				var pointsObj = new THREE.Points( pointGeometry, pointMaterial );
				g_3d_historic_obj = pointsObj;
				*/
				// var lineGeometry = pointGeometry.clone();
				// var lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
				// var linesObj = new THREE.Line( lineGeometry, lineMaterial );
				// g_3d_historic_obj.add( linesObj );

				// g_scene.add( g_3d_historic_obj );
	    	}
	    });

	    $.ajax({
			url: "sample-twsw.json", 
			dataType: 'json',
			success: function( result ) {
				g_anim_data_ex = result;
				drawTwistPlotter(0);
			}
		});
	}

	this.update = function() {
		if ( g_anim_data == null || g_anim_data_ex == null || g_clock.running == false ) return;
		g_remain_time += g_clock.getDelta();
		while ( g_remain_time > this.tick_time ) {
			tick();
			g_remain_time -= this.tick_time;
		}

		renderFrame();
	}

	this.play = function() {
		g_clock.start();
	}

	this.pause = function() {
		g_clock.stop();
	}

	this.stop = function() {
		g_clock.stop();
		g_current_frame = 0;
		g_current_frame_ex = 0;
		tick();
		g_current_frame = 0;
		g_current_frame_ex = 0;
	}

	this.updatePolarTickLabel = function() {
		generatePolarTickLabel( g_font, TOWER_HEIGHT, 4, 11 );
		generateCriticalCircle();
	}

	this.changeCurveMode = function( pMode ) {
		g_tower_obj.changeCurveMode( pMode );
	}

	function tick() {

		g_current_frame = ( g_current_frame + 1 ) % g_anim_data.x.length;
		g_current_frame_ex = ( g_current_frame_ex + 1 ) % g_anim_data_ex.twist.length;

	}

	function renderFrame() {
		var scale = scope.vibra_scale;
		var dx = g_anim_data.x[ g_current_frame ] * scale; 
		var dy = g_anim_data.y[ g_current_frame ] * scale;
		var rot_z = Math.atan( dx / 160.0 );
		var rot_x = Math.atan( dy / 160.0 );

		// g_tower_obj.rotation.set( rot_x, 0.0, rot_z );
		g_tower_obj.update( -dx, dy );
		g_tick_mark_obj.position.set( -dx, 1.0, dy );

		
		drawHistoricPlotter( g_current_frame );
		drawLiveTopDownPlotter( g_current_frame );
		drawTwistPlotter( g_current_frame_ex );

		var date = new Date( g_anim_data.time[ g_current_frame ] );
		$('#record-time-value').text( date.toGMTString() );

		date = new Date( g_anim_data_ex.time[ g_current_frame_ex ] );
		$('#twist-stat-value').text( date.toGMTString() );
	}

	function draw2DPlotterCoord( ctx ) {
		// 2D plotter
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1;
		for ( var i = 1; i <= 10; i++ ) {
			ctx.beginPath();
			ctx.arc( 150, 150, i * 15, 0, 2 * Math.PI );
			ctx.stroke();
		}

		for ( var i = 0; i < 16; i++ ) {
			if ( i % 2 == 0 )
				ctx.lineWidth = 2;
			else
				ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo( 150, 150 );
			ctx.lineTo( Math.cos( i * Math.PI / 8.0 ) * 150 + 150, Math.sin( i * Math.PI / 8.0 ) * 150 + 150 );
			ctx.stroke();
		}

		// draw critical circle with red color.
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc( 150, 150, 150 * scope.vibra_scale * 0.025, 0, 2 * Math.PI );
		ctx.stroke();

		var step = 6;
		var radials = 4;
		var radius = 150.0;
		ctx.font = "12px Arial";
		ctx.fillStyle="#000000";
		for ( var j = 1; j < step; j++ ) {
			for ( var i = 0; i < radials; i++ ) {
				var x = Math.cos( i * 2.0 * Math.PI / radials ) * ( j / ( step - 1 ) ) * radius + 150.0 - 6.0;
				var z = Math.sin( i * 2.0 * Math.PI / radials ) * ( j / ( step - 1 ) ) * radius + 150.0;
				ctx.fillText( ( ( j / ( step - 1 ) ) * ( 100.0 ) / scope.vibra_scale ).toFixed( 1 ), x, z );
			}
		}
	}

	function _lerpColor( a, b, amount ) { 
	    var ah = parseInt(a.replace(/#/g, ''), 16),
	        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
	        bh = parseInt(b.replace(/#/g, ''), 16),
	        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
	        rr = ar + amount * (br - ar),
	        rg = ag + amount * (bg - ag),
	        rb = ab + amount * (bb - ab);

	    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
	}

	function drawHistoricPlotter( frame_id ) {
		// if ( frame_id == 0 ) {
			g_historic_plot_ctx.clearRect( 0, 0, 300, 300 );
			draw2DPlotterCoord( g_historic_plot_ctx );
		// }
		// g_historic_plot_ctx.fillStyle="#000000";
		for ( var i = 0; i < frame_id; i++ ) {
			g_historic_plot_ctx.fillStyle = _lerpColor( '#000000', '#ff0000', i / 3000.0 );
			g_historic_plot_ctx.fillRect( 150 - g_anim_data.x[i] * ( scope.vibra_scale * 150.0 / 100.0 ), 150 + g_anim_data.y[i] * ( scope.vibra_scale * 150.0 / 100.0 ), 2, 2 );
		}

		g_historic_plot_ctx.fillStyle ='#ffffff';
		g_historic_plot_ctx.fillRect( 150 - g_anim_data.x[frame_id] * ( scope.vibra_scale * 150.0 / 100.0 ), 150 + g_anim_data.y[frame_id] * ( scope.vibra_scale * 150.0 / 100.0 ), 3, 3 );
	}

	function drawLiveTopDownPlotter( frame_id ) {
		g_live_plot_ctx.clearRect( 0, 0, 300, 300 );
		draw2DPlotterCoord( g_live_plot_ctx );

		g_live_plot_ctx.beginPath();
		g_live_plot_ctx.strokeStyle = "#000000";
		g_live_plot_ctx.lineCap = "round";
		g_live_plot_ctx.lineWidth = 5;
		g_live_plot_ctx.moveTo( 150, 150 );
		g_live_plot_ctx.lineTo( 150 - g_anim_data.x[frame_id] * ( scope.vibra_scale * 150.0 / 100.0 ), 150 + g_anim_data.y[frame_id] * ( scope.vibra_scale * 150.0 / 100.0 ) );
		g_live_plot_ctx.stroke();
	}

	function drawTwistPlotter( frame_id ) {
		var twist = g_anim_data_ex.twist[ frame_id ] * scope.vibra_scale * RAD;

		$('#twist-angle-value').text( g_anim_data_ex.twist[ frame_id ].toFixed(2) );

		g_twist_plot_ctx.clearRect( 0, 0, 300, 300 );
		g_twist_plot_ctx.fillStyle = "#000000";
		g_twist_plot_ctx.beginPath();
		g_twist_plot_ctx.arc( 150, 150, 150, 0 + twist, Math.PI + twist );
		g_twist_plot_ctx.fill();

		g_twist_plot_ctx.fillStyle = "#ffffff";
		g_twist_plot_ctx.beginPath();
		g_twist_plot_ctx.arc( 150, 150, 150, Math.PI + twist, 0 + twist );
		g_twist_plot_ctx.fill();
		// g_twist_plot_ctx.stroke();
	}

	function generateTextMesh( pFont, pText, pSize, pMat ) {
		var shapes = pFont.generateShapes( pText, pSize, 2 );
		var geometry = new THREE.ShapeGeometry( shapes );
		geometry.computeBoundingBox();
		var xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
		geometry.translate( xMid, 0, 0 );
		geometry.rotateX( -Math.PI * 0.5 );
		// textShape_N.fromGeometry( geometry );
		var textMesh = new THREE.Mesh( geometry, pMat );
		// text.position.set( 0, POLAR_GRID_HEIGHT, -100 );
		// g_scene.add( text );
		return textMesh;
	}

	function generatePolarTickLabel( pFont, pRadius, pRadials, pStep ) {
		if ( g_polar_tick_label_obj != null ) {
			g_polar_tick_label_obj.children.forEach( function( el ) {
				el.geometry.dispose();
				el.material.dispose();
				g_scene.remove( el );
				delete el;
			} );
			// console.log(g_polar_tick_label_obj.children);
		}

		g_scene.remove( g_polar_tick_label_obj );
		g_polar_tick_label_obj = null;

		g_polar_tick_label_obj = new THREE.Object3D();

		for ( var j = 1; j < pStep; j++ ) {
			for ( var i = 0; i < pRadials; i++ ) {
				var x = Math.cos( i * 2.0 * Math.PI / pRadials ) * ( j / ( pStep - 1 ) ) * pRadius;
				var z = Math.sin( i * 2.0 * Math.PI / pRadials ) * ( j / ( pStep - 1 ) ) * pRadius;
				var textMesh = generateTextMesh( pFont, ( ( j / ( pStep - 1 ) ) * pRadius / scope.vibra_scale ).toFixed( 1 ), 3, g_red_mat );
				textMesh.position.set( x, POLAR_GRID_HEIGHT, z );
				// textMesh.rotation.y = -i * 2.0 * Math.PI / pRadials;
				g_polar_tick_label_obj.add( textMesh );
			}
		}

		// add percentage tick label
		for ( var j = 1; j < pStep; j++ ) {
			for ( var i = 0; i < pRadials; i++ ) {
				var x = Math.cos( i * 2.0 * Math.PI / pRadials + Math.PI * 0.25 ) * ( j / ( pStep - 1 ) ) * pRadius;
				var z = Math.sin( i * 2.0 * Math.PI / pRadials + Math.PI * 0.25 ) * ( j / ( pStep - 1 ) ) * pRadius;
				var textMesh = generateTextMesh( pFont, ( ( j / ( pStep - 1 ) ) * pRadius * 100.0 / TOWER_HEIGHT / scope.vibra_scale ).toFixed( 1 ), 3, g_blue_mat );
				textMesh.position.set( x, POLAR_GRID_HEIGHT, z );
				// textMesh.rotation.y = -i * 2.0 * Math.PI / pRadials;
				g_polar_tick_label_obj.add( textMesh );
			}
		}

		g_scene.add( g_polar_tick_label_obj );
	}

	function generateCriticalCircle() {
		var _critical_radius = TOWER_HEIGHT * scope.vibra_scale * 0.025;

		if ( g_critical_circle_obj != null ) {
			g_critical_circle_obj.geometry.dispose();
			g_critical_circle_obj.geometry = new THREE.RingGeometry( _critical_radius, _critical_radius + 1, 64, 1 );
		} else {
			g_critical_circle_obj = new THREE.Mesh( new THREE.RingGeometry( _critical_radius, _critical_radius + 1, 64, 1 ), g_red_mat );
			g_critical_circle_obj.rotation.x = -Math.PI * 0.5;
			g_critical_circle_obj.position.y = POLAR_GRID_HEIGHT;
			g_scene.add( g_critical_circle_obj );
		}
	}

}
