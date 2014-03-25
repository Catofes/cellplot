//****************************************
//This is a new file base on function.js
//
//This file contain the class of canvas
//****************************************


//The Init of the Class CellPlot
function CellPlot(container)
{
	this.width=container.clientWidth;
	this.height=container.clientHeight;
	this.container=container;

	//Setup The THREE render Object;
	this.renderer=new THREE.WebGLRenderer({antialias: true});
	this.renderer.setSize(this.width,this.height);
	this.container.appendChild(this.renderer.domElement);
	this.renderer.setClearColorHex(0xFFFFFF,1.0);

	//Setup The THREE camera Object;
	this.camera = new THREE.PerspectiveCamera( 45 , width / height , 1 , 10000 );
	this.camera.position.x = 500;
	this.camera.position.y = 100;
	this.camera.position.z = 100;
	this.camera.up.x = 0;
	this.camera.up.y = 0;
	this.camera.up.z = 1;
	this.camera.lookAt( {x:0, y:0, z:0 } );

	//Setup the THREE light Object;
	this.light = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0); 
	this.light.position.set( 0, 100, 100 );
	this.camera.add(light);

	//Setup the THREE scene Object;
	this.scene=new THREE.Scene();
	this.scene.add(camera);

	this.controls = new THREE.TrackballControls(camera,container);
	this.projector = new THREE.Projector();


	//Setup other variates

	//**********************
	//Private function below
	//**********************


	//Mouse Move function
	this.onDocumentMouseMove=function(event)
	{
		event.preventDefault();
		mouse_move.x = ( (event.clientX-container.offsetLeft + $(window).scrollLeft()) / container.clientWidth ) * 2 - 1;
		mouse_move.y = - ( (event.clientY- container.offsetTop+ $(window).scrollTop()) / container.clientHeight ) * 2 + 1;
	}
	
	//Mouse Click function
	this.onDocumentMouseDown=function(event)
	{
		if (mouse_move.x<1 && mouse_move.y<1){
			event.preventDefault();
			var vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
			projector.unprojectVector( vector, camera );
			var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			// create an array containing all objects in the scene with which the ray intersects
			var allinter = ray.intersectObjects( scene.children );
			var intersects=[];
			for (var i=0; i<allinter.length; i++){
				if (allinter[i].object.name){
					intersects[intersects.length]=allinter[i];
				}
			}
			//clear data unless Ctrl is pressed
			//	 if (ctrlDown===false )
			//	 {
			//	  Colorcells(selected_cellids,[])
			//	  SELECTED=[];
			//	  selected_cellids=[]
			//	 }
			if ( intersects.length > 0 )//if click something
			  if ( intersects[ 0 ].object.cellid ){//and the clicked stuff is a ball
				  console.log("clicked:" + intersects[ 0 ].object.name);
				  //add to selected cell ids only when it is not there yet
				  if ((selected_cellids).indexOf(intersects[ 0 ].object.cellid)<0)
					Addtoselected(intersects[ 0 ].object.cellid);
				  SELECTED[SELECTED.length] = intersects[ 0 ].object
					  //if (event.button===rightClick)
					  //{console.log("right")}
			  }
			toappearstr='';
			for (var c=0;c<selected_cellids.length;c++)
			  toappearstr=toappearstr+","+cellnames[selected_cellids[c]];
			$('#selectedcell').html(toappearstr);
			if (toappearstr==='')
			  $('#displayneighor').html(toappearstr);
		}
		console.log("mouse down, current cells:"+ selected_cellids);
	}


	this.container.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
	this.container.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
	
	
	return this;
}

//Function of Remove Lines from Scene
CellPlot.prototype.ClearLines=function(){
	for (var l=0; l<lines.length; l++)
	  scene.remove(lines[l]);
	lines=[];
}

//Function of Remove Triaggles from Scene
CellPlot.prototype.ClearTriaggles=function(){
	for (var f=0; f<triangles.length;f++)
	  scene.remove(triangles[f]);
	triangles=[];
}

//Function of Remove Select Object from Scene
CellPlot.prototype.ClearSelect=function()
{
	SELECTED=[];
	ClearLines();
	ClearTriaggles();
}

CellPlot.prototype.LoadData=function(para)
{
	ClearSelect();
}
