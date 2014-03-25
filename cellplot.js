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
	this.camera = new THREE.PerspectiveCamera( 45 , this.width / this.height , 1 , 10000 );
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
	this.camera.add(this.light);

	//Setup the THREE scene Object;
	this.scene=new THREE.Scene();
	this.scene.add(this.camera);

	this.controls = new THREE.TrackballControls(this.camera,this.container);
	this.projector = new THREE.Projector();

	this.axisHelper = new THREE.AxisHelper( 100 );  
	this.scene.add(this.axisHelper );


	projector=this.projector;
	controls=this.controls;
	camera=this.camera;
	scene=this.scene;
	GP=this;
	//Setup other variates
	
	this.lines=[];
	this.triangles=[];

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
					GP.Addtoselected(intersects[ 0 ].object.cellid);
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

	this.LoadData(1);
	this.onAnimate();
	return this;
}

//Function of Remove Lines from Scene
CellPlot.prototype.ClearLines=function(){
	for (var l=0; l<lines.length; l++)
	  scene.remove(this.lines[l]);
	lines=[];
}

//Function of Remove Triaggles from Scene
CellPlot.prototype.ClearTriaggles=function(){
	for (var f=0; f<triangles.length;f++)
	  scene.remove(this.triangles[f]);
	triangles=[];
}

//Function of Remove Select Object from Scene
CellPlot.prototype.ClearSelect=function()
{
	SELECTED=[];
	this.ClearLines();
	this.ClearTriaggles();
}

CellPlot.prototype.LoadData=function(para)
{
	cellplot=this;
	current_tloc=para-1;
	this.ClearSelect();
	for (var c=0;c<cellnum;c++)
	  cellid_tocurrent[c]=-1;
	if (!current_cellids[current_tloc]){// no data, need to load data
		var fpath="./ajaxfolder/"+geneid+"/g"+geneid+"_t"+current_tloc+".txt"
			console.log("load data from: "+fpath)
			$.getJSON(fpath,function (data){
				current_cellids[current_tloc]=data[0];
				var current_cellnum=current_cellids[current_tloc].length;
				drawlocs[current_tloc]=new Array(current_cellnum);
				geneexp[current_tloc]=data[3];
				for (var c=0; c<current_cellnum;c++){
					drawlocs[current_tloc][c]=new Array(3);
					for (var k=0;k<3;k++)
				drawlocs[current_tloc][c][k]= data[1][c][k]-0.5*(minloc[k]+maxloc[k]);	
				}
				var pairs=data[2][0];
				var areas=data[2][1];
				//console.log(129+': pairs'+pairs)
				contact_pairs[current_tloc]=new Array(current_cellnum);
				contact_areas[current_tloc]=new Array(current_cellnum);
				for (var c=0; c<current_cellnum;c++){
					contact_pairs[current_tloc][c]=[];
					contact_areas[current_tloc][c]=[];
				}
				for (var p=0; p<pairs.length;p++){
					//console.log("pair:" + pairs[p])
					var cloc=[0,0]
						for (var k=0; k<2;k++)
						  cloc[k]= (current_cellids[current_tloc]).indexOf(pairs[p][k]);
					// their position in the current_cellids[current_tloc]
					var temploc=[cloc,[cloc[1],cloc[0]]];
					for (var k=0;k<2;k++){
						var a=temploc[k][0],b=temploc[k][1];
						var clen=contact_areas[current_tloc][a].length
							contact_pairs[current_tloc][a][clen]=b;
						contact_areas[current_tloc][a][clen]=areas[p]
					}
				}
				cellplot.onDraw();
			});
	}
	else{ // there is already data
		console.log("have data number:"+ drawlocs[current_tloc].length)
			this.onDraw();
	}
}

CellPlot.prototype.DrawObject=function(inputlocs,cellids)
{
	var current_cellnum=inputlocs.length;
	//clear previous balls
	for (var b=0;b<balls.length;b++)
	  scene.remove(balls[b]);
    balls = new Array(current_cellnum);
	for (var c=0;c<current_cellnum;c++){
		cid=cellids[c];
		var tempmaterial=new THREE.MeshLambertMaterial({color: signedcolors[cid]});
		balls[c]=new THREE.Mesh(new THREE.SphereGeometry(10), tempmaterial);
		balls[c].id=c;
		balls[c].cellid= cid;
		balls[c].name=cellnames[cid];
		scene.add(balls[c]);
		balls[c].position.set(inputlocs[c][0],inputlocs[c][1],inputlocs[c][2]);
	}
}

CellPlot.prototype.Colorcells=function(givencellids,colorpara)//one element: color the same, []:back to original color
{
	for (var c=0; c<givencellids.length;c++){
		var cid=givencellids[c];
		if (cellid_tocurrent[cid]>-1){
			var tobecolorobject=scene.getObjectByName(cellnames[cid], true);
			if (tobecolorobject){
				if (colorpara.length===0)//back to the original color
				  tobecolorobject.material.color.setHex( signedcolors[cid]); 
				else if (colorpara.length===givencellids.length)// color things accordingly
				  tobecolorobject.material.color.setHex( colorpara[c]); 
				else // everything as one
				  tobecolorobject.material.color.setHex( colorpara);
			}
		}//if (cellid_tocurrent[cid]>0)  
	}//for (var c=0; c<givencellids.length;c++)
}


//Function of Draw Object from Data
CellPlot.prototype.onDraw=function()
{
	this.DrawObject(drawlocs[current_tloc],current_cellids[current_tloc]);
	for (var c=0; c<current_cellids[current_tloc].length;c++)
	  cellid_tocurrent[current_cellids[current_tloc][c]]=c;
	this.Colorcells(selected_cellids,choosencolor);//highlight cells in selection
	if (showneighor)   
	  GetNeighbors();
	if (bygeneexp)
	  Bygeneexp();
	if (showseg)
	  Showsegmentation();
}

CellPlot.prototype.onAnimate=function()
{
	window.webkitRequestAnimationFrame(this.onAnimate.bind(this));
	//requestAnimationFrame(this.onAnimate);
	//Update Renderer
	this.renderer.clear();
	this.controls.update();
	this.renderer.render( scene, camera );
	//Update Other
	if (mouse_move.x<1 && mouse_move.y<1){
		var vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		// create an array containing all objects in the scene with which the ray intersects
		var allinter = ray.intersectObjects( scene.children );
		var intersects=[];
		for (var i=0; i<allinter.length; i++)
		  if (allinter[i].object.name)
			intersects[intersects.length]=allinter[i];
		if ( intersects.length > 0 ){
			// if the closest object intersected is not the currently stored intersection object
			if ( intersects[ 0 ].object != INTERSECTED ){
				// restore previous intersection object (if it exists) to its original color
				if ( INTERSECTED)
				  INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				if ( intersects[ 0 ].object.name){
					INTERSECTED.material.color.setHex( highlightcolor );
					// update text, if it has a "name" field.
					$('#mouseovercell').html(intersects[ 0 ].object.name);
				}
			}
		}else{ // there are no intersections
			// restore previous intersection object (if it exists) to its original color, if they element is not selected already
			if (INTERSECTED){
				if (INTERSECTED.cellid && SELECTED.indexOf(INTERSECTED)<0)
				  INTERSECTED.material.color.setHex( signedcolors[INTERSECTED.cellid]);
				INTERSECTED = null;
				$('#mouseovercell').html("");
			}
		}
		this.controls.update();
	}
}

CellPlot.prototype.Addtoselected=function(cid)
{
	if (selected_cellids.length==0||selected_cellids.indexOf(cid)<0){//not there yet
		selected_cellids[selected_cellids.length]=cid;
		var selected_cell_str=cellnames[selected_cellids[0]];
		for (var s=1;s<selected_cellids.length;s++)
		  selected_cell_str=selected_cell_str+','+cellnames[selected_cellids[s]];
		$('#selectedcell').html(selected_cell_str);

		//change color of the newly added cell
		this.Colorcells([cid],choosencolor);
		//this.Colortreenode([cid],'yellow');
	}
}

