//****************************************
//This is a new file base on function.js
//
//This file contain the class of canvas
//****************************************


//***************************************
//CellPlot is the basic class of cell plot
//***************************************

//The Init of the Class CellPlot
CellPlot=function(container){
	this.width=container.clientWidth;
	this.height=container.clientHeight;
	this.container=container;
	CP=this;

	//Add Element CellPlot.Inof
	htmlinfo=document.createElement("div");
	htmlinfo.className="info";
	container.appendChild(htmlinfo);
	this.info=new CellPlot.Info(htmlinfo);
	
	//Add Element CellPlot.Canvas
	htmlcanvas=document.createElement("div");
	htmlcanvas.className="canvas";
	container.appendChild(htmlcanvas);
	this.canvas=new CellPlot.Canvas(htmlcanvas);

	//Add Element CellPlot.Slide
	htmlslide=document.createElement("div");
	htmlslide.id="CellPlot_Slide";
	htmlslide.className="slide";
	container.appendChild(htmlslide);
	this.slide=new CellPlot.Slide(htmlslide);

	this.control=new CellPlot.Control();
	return this;
}

CellPlot.prototype.RGB2HTML=function(red, green, blue)
{
	var decColor =0x1000000+ blue + 0x100 * green + 0x10000 *red ;
	return '#'+decColor.toString(16).substr(1);
}


//*************************************
//CellPlot.Canvas is the class to draw picture
//*************************************

//The Init of the Class CellPlot.Canvas
CellPlot.Canvas=function(container)
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
	//Setup other variates

	this.lines=[];
	this.triangles=[];
	this.showneighor=false;
	this.bygenexp=false;
	this.showseg=false;

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
			vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
			projector.unprojectVector( vector, camera );
			ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
			// create an array containing all objects in the scene with which the ray intersects
			allinter = ray.intersectObjects( scene.children );
			intersects=[];
			for (i=0; i<allinter.length; i++){
				if (allinter[i].object.name){
					intersects[intersects.length]=allinter[i];
				}
			}
			//clear data unless Ctrl is pressed
			//	 if (ctrlDown===false )
			//	 {
			//	  ColorCells(selected_cellids,[])
			//	  SELECTED=[];
			//	  selected_cellids=[]
			//	 }
			if ( intersects.length > 0 )//if click something
			  if ( intersects[ 0 ].object.cellid ){//and the clicked stuff is a ball
				  console.log("clicked:" + intersects[ 0 ].object.name);
				  //add to selected cell ids only when it is not there yet
				  if ((selected_cellids).indexOf(intersects[ 0 ].object.cellid)<0)
					CP.canvas.Addtoselected(intersects[ 0 ].object.cellid);
				  SELECTED[SELECTED.length] = intersects[ 0 ].object
					  //if (event.button===rightClick)
					  //{console.log("right")}
			  }
			toappearstr='';
			for (c=0;c<selected_cellids.length;c++)
			  toappearstr=toappearstr+","+cellnames[selected_cellids[c]];
			//$('#selected_cell').html("sellected_cell:	"+toappearstr);
			CP.info.ChangeElement("selected_cell","selected cell:	"+toappearstr);
			if (toappearstr==='')
			  //$('#displayneighor').html(toappearstr);
			  CP.info.ChangeElement("neighbors_of_select_cell","neighbors of select cell:   "+toappearstr);
		}
		console.log("mouse down, current cells:"+ selected_cellids);
	}


	this.container.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
	this.container.addEventListener( 'mousedown', this.onDocumentMouseDown, false );

	this.LoadData(1);
	this.onAnimate();
	//this.SlideBar();
}

//Function of Remove Lines from Scene
CellPlot.Canvas.prototype.ClearLines=function(){
	for (l=0; l<this.lines.length; l++)
	  this.scene.remove(this.lines[l]);
	this.lines=[];
}

//Function of Remove Triaggles from Scene
CellPlot.Canvas.prototype.ClearTriaggles=function(){
	for (f=0; f<triangles.length;f++)
	  scene.remove(this.triangles[f]);
	triangles=[];
}

//Function of Remove Select Object from Scene
CellPlot.Canvas.prototype.ClearSelect=function()
{
	SELECTED=[];
	this.ClearLines();
	this.ClearTriaggles();
}

CellPlot.Canvas.prototype.LoadData=function(para)
{
	cellplot=this;
	current_tloc=para-1;
	CP.info.ChangeElement("current_time","current time:	"+current_tloc);
	this.ClearSelect();
	for (c=0;c<cellnum;c++)
	  cellid_tocurrent[c]=-1;
	if (!current_cellids[current_tloc]){// no data, need to load data
		fpath="./ajaxfolder/"+geneid+"/g"+geneid+"_t"+current_tloc+".txt"
			console.log("load data from: "+fpath)
			$.getJSON(fpath,function (data){
				current_cellids[current_tloc]=data[0];
				current_cellnum=current_cellids[current_tloc].length;
				drawlocs[current_tloc]=new Array(current_cellnum);
				geneexp[current_tloc]=data[3];
				for (c=0; c<current_cellnum;c++){
					drawlocs[current_tloc][c]=new Array(3);
					for (k=0;k<3;k++)
				drawlocs[current_tloc][c][k]= data[1][c][k]-0.5*(minloc[k]+maxloc[k]);	
				}
				pairs=data[2][0];
				areas=data[2][1];
				//console.log(129+': pairs'+pairs)
				contact_pairs[current_tloc]=new Array(current_cellnum);
				contact_areas[current_tloc]=new Array(current_cellnum);
				for (c=0; c<current_cellnum;c++){
					contact_pairs[current_tloc][c]=[];
					contact_areas[current_tloc][c]=[];
				}
				for (p=0; p<pairs.length;p++){
					//console.log("pair:" + pairs[p])
					cloc=[0,0]
						for (k=0; k<2;k++)
						  cloc[k]= (current_cellids[current_tloc]).indexOf(pairs[p][k]);
					// their position in the current_cellids[current_tloc]
					temploc=[cloc,[cloc[1],cloc[0]]];
					for (k=0;k<2;k++){
						a=temploc[k][0],b=temploc[k][1];
						clen=contact_areas[current_tloc][a].length
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

CellPlot.Canvas.prototype.ClearData=function(){
	current_cellids=[];
}

CellPlot.Canvas.prototype.DrawObject=function(inputlocs,cellids)
{
	current_cellnum=inputlocs.length;
	//clear previous balls
	for (b=0;b<balls.length;b++)
	  this.scene.remove(balls[b]);
	balls = new Array(current_cellnum);
	for (c=0;c<current_cellnum;c++){
		cid=cellids[c];
		tempmaterial=new THREE.MeshLambertMaterial({color: signedcolors[cid]});
		balls[c]=new THREE.Mesh(new THREE.SphereGeometry(10), tempmaterial);
		balls[c].id=c;
		balls[c].cellid= cid;
		balls[c].name=cellnames[cid];
		scene.add(balls[c]);
		balls[c].position.set(inputlocs[c][0],inputlocs[c][1],inputlocs[c][2]);
	}
}

CellPlot.Canvas.prototype.ColorCells=function(givencellids,colorpara)//one element: color the same, []:back to original color
{
	for (c=0; c<givencellids.length;c++){
		cid=givencellids[c];
		if (cellid_tocurrent[cid]>-1){
			tobecolorobject=scene.getObjectByName(cellnames[cid], true);
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
CellPlot.Canvas.prototype.onDraw=function()
{
	this.DrawObject(drawlocs[current_tloc],current_cellids[current_tloc]);
	for (c=0; c<current_cellids[current_tloc].length;c++)
	  cellid_tocurrent[current_cellids[current_tloc][c]]=c;
	this.ColorCells(selected_cellids,choosencolor);//highlight cells in selection
	if (this.showneighor)   
	  this.GetNeighbors();
	if (this.bygeneexp)
	  this.ByGeneExp();
	if (this.showseg)
	  this.Showsegmentation();
}

CellPlot.Canvas.prototype.onAnimate=function()
{
	window.requestAnimationFrame(this.onAnimate.bind(this));
	//requestAnimationFrame(this.onAnimate);
	//Update Renderer
	this.renderer.clear();
	this.controls.update();
	this.renderer.render( scene, camera );
	//Update Other
	if (mouse_move.x<1 && mouse_move.y<1){
		vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
		projector.unprojectVector( vector, camera );
		ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		// create an array containing all objects in the scene with which the ray intersects
		allinter = ray.intersectObjects( scene.children );
		intersects=[];
		for (i=0; i<allinter.length; i++)
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
					//$('#mouseovercell').html(intersects[ 0 ].object.name);
					CP.info.ChangeElement("mouseover_cell","mouseover cell:	"+intersects[0].object.name);
				}
			}
		}else{ // there are no intersections
			// restore previous intersection object (if it exists) to its original color, if they element is not selected already
			if (INTERSECTED){
				if (INTERSECTED.cellid && SELECTED.indexOf(INTERSECTED)<0)
				  INTERSECTED.material.color.setHex( signedcolors[INTERSECTED.cellid]);
				INTERSECTED = null;
				//$('#mouseovercell').html("");
				CP.info.ChangeElement("mouseover_cell","mouseover cell: ");
			}
		}
		this.controls.update();
	}
}

CellPlot.Canvas.prototype.Addtoselected=function(cid)
{
	if (selected_cellids.length==0||selected_cellids.indexOf(cid)<0){//not there yet
		selected_cellids[selected_cellids.length]=cid;
		selected_cell_str=cellnames[selected_cellids[0]];
		for (s=1;s<selected_cellids.length;s++)
		  selected_cell_str=selected_cell_str+','+cellnames[selected_cellids[s]];
		//$('#selectedcell').html(selected_cell_str);
		CP.info.ChangeElement("selected_cell","selected_cell:	"+selected_cell_str);
		//change color of the newly added cell
		this.ColorCells([cid],choosencolor);
		//this.Colortreenode([cid],'yellow');
	}
}

CellPlot.Canvas.prototype.ColorCells=function(givencellids,colorpara)//one element: color the same, []:back to original color
{
	for (var c=0; c<givencellids.length;c++){   
		var cid=givencellids[c];
		if (cellid_tocurrent[cid]>-1){
			var tobecolorobject=this.scene.getObjectByName(cellnames[cid], true);
			if (tobecolorobject){
				if (colorpara.length===0)//back to the original color
				  tobecolorobject.material.color.setHex( signedcolors[cid]); 
				else if (colorpara.length===givencellids.length)// color things accordingly
				  tobecolorobject.material.color.setHex( colorpara[c]); 
				else // everything as one
				  tobecolorobject.material.color.setHex( colorpara);
			}
		}
	}
}
CellPlot.Canvas.prototype.GetNeighbors=function()// for the neighor of selected cells, color the neigbors, link a line, and display their names
{
	this.showneighor=true;
	// clear lines each time they draw
	this.ClearLines();
	var l=0;
	var todisplay="";
	var allneibhorcellids=[];
	for (var c=0; c<selected_cellids.length;c++){
		// check if the cell is still there
		var cid=selected_cellids[c];
		var ballid=cellid_tocurrent[cid];
		if (ballid>-1){
			allneibhorcellids[allneibhorcellids.length]=cid;
			console.log(contact_pairs[current_tloc]);
			var pstart=drawlocs[current_tloc][ballid];
			console.log("in "+ current_tloc+", choosen to get neibhors of "+cellnames[cid]);
			console.log("the neighbors are: "+contact_pairs[current_tloc][ballid]);
			var pairid=contact_pairs[current_tloc][ballid];
			for (var p=0;p<pairid.length;p++){
				var pair_ballid=pairid[p];
				//draw lines for this interaction, and line have attributes area
				var lineGeometry = new THREE.Geometry();
				var vertArray = lineGeometry.vertices;
				var pend=drawlocs[current_tloc][pair_ballid];
				vertArray.push( new THREE.Vector3(pstart[0],pstart[1],pstart[2]), new THREE.Vector3(pend[0],pend[1],pend[2]) );
				lineGeometry.computeLineDistances();
				var lineMaterial = new THREE.LineBasicMaterial( { color: linecolor} );
				this.lines[l]= new THREE.Line( lineGeometry, lineMaterial );
				this.lines[l].area=contact_areas[current_tloc][ballid];
				scene.add(this.lines[l]);
				allneibhorcellids[allneibhorcellids.length]=current_cellids[current_tloc][pair_ballid];
				todisplay=todisplay+", "+balls[pair_ballid].name;
				l=l+1;
			}
		}
	}
	CP.info.ChangeElement("neighbors_of_select_cell","neighbors_of_select_cell:   "+todisplay);	
	var othercells=this.Allother_currentcells(allneibhorcellids);
	//Transpcells(othercells,0.5);
	//Transpcells(allneibhorcellids,1);
}

CellPlot.Canvas.prototype.Allother_currentcells=function(givencellids) // all the other current cells ids on the screen
{
	var othercells=[];
	clist=current_cellids[current_tloc];
	for (var c=0; c<clist.length;c++){
		if ((givencellids).indexOf(clist[c])<0)// not exit
		  othercells[othercells.length]=clist[c];
	}
	return othercells;
}

CellPlot.Canvas.prototype.ByGeneExp=function()
{
	var currentcolor=new Array(current_cellids[current_tloc].length);
	for (var c=0; c<current_cellids[current_tloc].length;c++){
		var tempcolor=[0,0,0];
		if(isNaN(geneexp[current_tloc][c]))// not a number
		  tempcolor=[100,100,100];
		else{
			for (var k=0; k<3;k++){
				tempcolor[k]=Math.max(1,Math.min(255,Math.floor(300*(colortable[Math.floor((!geneexp[current_tloc][c])?0:geneexp[current_tloc][c]*64)][k]))));
			}
			var tempv=CP.RGB2HTML(tempcolor[0],tempcolor[1],tempcolor[2]);
			currentcolor[c]='0x';
			currentcolor[c]=currentcolor[c]+tempv[1]+tempv[2]+tempv[3]+tempv[4]+tempv[5]+tempv[6];
		}
		signedcolors[current_cellids[current_tloc][c]]=currentcolor[c];
	}
	this.ColorCells(current_cellids[current_tloc],currentcolor);
}
//*******************************
//CellPlot.Info is the class to show infomation
//*******************************

//Init of the class
CellPlot.Info=function(container)
{
	this.element=[];
	this.container=container;

	this.AddElement("current_time","current time:	");
	this.AddElement("time_choosen","time choosen:	");
	this.AddElement("mouseover_cell","mouseover cell:	");
	this.AddElement("selected_cell","selected cell:	");
	this.AddElement("neighbors_of_select_cell","neighbors of select cell:	");
}

//Create Element
CellPlot.Info.prototype.AddElement=function(id,data)
{
	ele=document.createElement("p");
	ele.id=id;
	ele.className="info";
	ele.innerHTML=data;
	this.container.appendChild(ele);
	this.element[id]=ele;
}

//Change the Data
CellPlot.Info.prototype.ChangeElement=function(id,data)
{
	this.element[id].innerHTML=data;
}



//***********************************
//CellPlot.Slide is the class of slide to control time 
//***********************************


CellPlot.Slide=function(container)
{
	$('#CellPlot_Slide').slider(
				{
					range : "min",
	value : rawtimelist[0],
	min: rawtimelist[0],
	max: rawtimelist[rawtimelist.length-1],
	change: function(event,ui) { CP.canvas.LoadData(ui.value);} ,
	slide : function(event,ui) { CP.info.ChangeElement("time_choosen","time choosen :"+ui.value);}  
				});
}


//********************************
//CellPlot.Control is the class to control the whole project
//********************************


CellPlot.Control=function()
{
	this.autoplay=null;
	this.ifplay=false;
}

CellPlot.Control.prototype.MoveForward=function()
{
	cvalue = $('#CellPlot_Slide').slider( "option", "value" );
	$('#CellPlot_Slide').slider("value",cvalue+1)
}

CellPlot.Control.prototype.MoveBackward=function()
{
	cvalue = $('#CellPlot_Slide').slider( "option", "value" );
	$('#CellPlot_Slide').slider("value",cvalue-1)
}

CellPlot.Control.prototype.Replay=function()
{
	$('#CellPlot_Slide').slider("value",1)
}

CellPlot.Control.prototype.AutoPlay=function()
{
	this.autoplay=setInterval(this.MoveForward,1000);
	this.ifplay=true;
}

CellPlot.Control.prototype.StopPlay=function()
{
	clearInterval(this.autoplay);
	this.ifplay=false;
}

CellPlot.Control.prototype.PlayandPause=function()
{
	if(this.ifplay)
	  this.StopPlay();
	else
	  this.AutoPlay();
}

CellPlot.Control.prototype.Reset=function()
{
	CP.canvas.ClearData();
	CP.canvas.ClearSelect();
	$('#CellPlot_Slide').slider("option","max",rawtimelist[rawtimelist.length-1]);
	this.Replay();
}

CellPlot.Control.prototype.ClearColor=function()
{
	CP.canvas.showneighor=false;
	CP.canvas.bygeneexp=false;
	for (var c=0; c<cellnum;c++)
	  signedcolors[c]=graycolor;
	CP.canvas.ColorCells(current_cellids[current_tloc],[]);
}

CellPlot.Control.prototype.ClearSelection=function()
{
	CP.canvas.ColorCells(selected_cellids,[]);
	//Colortreenode(selected_cellids,'black');
	selected_cellids=[];
	SELECTED=[];
	CP.info.ChangeElement("selected_cell","selected cell: ");
}

CellPlot.Control.prototype.ColorbyCellType=function()
{
	this.ClearColor();
	for (var c=0; c<cellnum;c++)
	  signedcolors[c]=typecolors[c];
	CP.canvas.ColorCells(current_cellids[current_tloc],[]);
}

CellPlot.Control.prototype.ColorbyGeneExp=function()
{
	this.ClearColor();
	CP.canvas.bygeneexp=true;
	CP.canvas.ByGeneExp();
}
