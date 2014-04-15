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
	
	htmlrow=document.createElement("div");
	htmlrow.className="row";
	container.appendChild(htmlrow);

	htmlleft=document.createElement("div");
	htmlleft.className="col-md-6";
	htmlrow.appendChild(htmlleft);

	htmlright=document.createElement("div");
	htmlright.className="col-md-6";
	htmlrow.appendChild(htmlright);

	//Add Element CellPlot.Inof
	htmlinfo=document.createElement("div");
	htmlinfo.className="info";
	htmlleft.appendChild(htmlinfo);
	this.info=new CellPlot.Info(htmlinfo);


	//Add Element CellPlot.Canvas
	htmlcanvas=document.createElement("div");
	htmlcanvas.className="canvas";
	htmlleft.appendChild(htmlcanvas);
	this.canvas=new CellPlot.Canvas(htmlcanvas);

	//Add Element CellPlot.Slide
	htmlslide=document.createElement("div");
	htmlslide.id="CellPlot_Slide";
	htmlslide.className="slide";
	htmlleft.appendChild(htmlslide);
	this.slide=new CellPlot.Slide(htmlslide);

	htmlbutton=document.createElement("div");
	htmlbutton.id="CellPlot_Button";
	htmlleft.appendChild(htmlbutton);
	this.button=new CellPlot.Button(htmlbutton);

	htmltree=document.createElement("div");
	htmltree.id="CellPlot_Tree";
	htmltree.className="tree";
    htmlright.appendChild(htmltree);
	this.tree=new CellPlot.Tree(htmltree);
	
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
	this.trianglesobject=[];
	this.showneighbor=false;
	this.bygenexp=false;
	this.showseg=false;

	//**********************
	//Private function below
	//**********************

	absleft=0;
	abstop=0;
	obj=container;
	while (obj.offsetParent){
		abstop += obj.offsetTop;
		absleft += obj.offsetLeft;
		obj = obj.offsetParent;
	}

	//Mouse Move function
	this.onDocumentMouseMove=function(event)
	{
		event.preventDefault();
		mouse_move.x = ( (event.clientX-absleft + $(window).scrollLeft()) / container.clientWidth ) * 2 - 1;
		mouse_move.y = - ( (event.clientY- abstop+ $(window).scrollTop()) / container.clientHeight ) * 2 + 1;
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
			for (c=0;c<selected_cellids.length;c++){
			  toappearstr=toappearstr+","+cellnames[selected_cellids[c]];
			  $("#cellnode_"+selected_cellids[c]).children()[0].style.fill="#ff0000";
			}
			//$('#selected_cell').html("sellected_cell:	"+toappearstr);
			CP.info.ChangeElement("selected_cell","selected cell:	"+toappearstr);
			if (toappearstr==='')
			  //$('#displayneighbor').html(toappearstr);
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
	for (f=0; f<this.triangles.length;f++)
	  scene.remove(this.triangles[f]);
	this.triangles=[];
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
	CP.info.ChangeElement("current_time","current time:	"+para);
	this.ClearSelect();
	for (c=0;c<cellnum;c++)
	  cellid_tocurrent[c]=-1;
	if (!current_cellids[current_tloc]){// no data, need to load data
		fpath="./ajaxfolder/"+geneid+"/g"+geneid+"_t"+current_tloc+".txt";
		console.log("load data from: "+fpath);
		$.getJSON(fpath,function (data){
			current_cellids[current_tloc]=data[0];
			current_cellnum=current_cellids[current_tloc].length;
			drawlocs[current_tloc]=new Array(current_cellnum);
			geneexp[current_tloc]=data[3];
			for(c=0; c<current_cellnum;c++){
				drawlocs[current_tloc][c]=new Array(3);
				for(k=0;k<3;k++) drawlocs[current_tloc][c][k]= data[1][c][k]-0.5*(minloc[k]+maxloc[k]);	
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
				cloc=[0,0];
				for (k=0; k<2;k++)
				  cloc[k]= (current_cellids[current_tloc]).indexOf(pairs[p][k]);
				// their position in the current_cellids[current_tloc]
				temploc=[cloc,[cloc[1],cloc[0]]];
				for (k=0;k<2;k++){
					a=temploc[k][0],b=temploc[k][1];
					clen=contact_areas[current_tloc][a].length;
					contact_pairs[current_tloc][a][clen]=b;
					contact_areas[current_tloc][a][clen]=areas[p];
				}
			}
			if(!cellplot.showseg)cellplot.onDraw();
		});
	}
	else{ // there is already data
		console.log("have data number:"+ drawlocs[current_tloc].length);
		if(!this.showseg)this.onDraw();
	}
	if(this.showseg){
		if (!segp_locs[current_tloc]){
			var fpath="./ajaxfolder/"+geneid+"/s"+geneid+"_t"+current_tloc+".txt";
			console.log("load seg information from:	"+fpath);
			$.getJSON(fpath,function (data){
				segp_locs[current_tloc]=data[0];
				segf_pids[current_tloc]=data[1];
				segc_fids[current_tloc]=data[2];
				for (var i=0; i<segp_locs[current_tloc].length;i++){
					for (var k=0; k<3;k++){
						segp_locs[current_tloc][i][k]=segp_locs[current_tloc][i][k]-0.5*(minloc[k]+maxloc[k]);
					}
				}
				for (var i=0; i<(segf_pids[current_tloc]).length;i++){
					for (var k=0; k<(segf_pids[current_tloc][i]).length; k++){
						segf_pids[current_tloc][i][k]=segf_pids[current_tloc][i][k]-1;
					}
				}

				for (var i=0;i<(segc_fids[current_tloc]).length;i++){
					for (var k=0; k<(segc_fids[current_tloc][i]).length;k++){
						segc_fids[current_tloc][i][k]=segc_fids[current_tloc][i][k]-1;
					}
				}
				cellplot.onDraw();
			});
		}else{
			console.log("have seg data number:"+current_tloc);
			cellplot.onDraw();
		}
	}
}

CellPlot.Canvas.prototype.ClearData=function(){
	current_cellids=[];
	segp_locs=[];
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

CellPlot.Canvas.prototype.DrawTriaggles=function(p_locs,f_pids,fs,colorcode)
{
	for (var f=0; f<fs.length; f++){
		var triangleGeometry = new THREE.Geometry();
		for (var k=0;k<3;k++){
			trianglepid=f_pids[fs[f]][k];
			triangleploc=p_locs[trianglepid];
			triangleGeometry.vertices.push(new THREE.Vector3(triangleploc[0],triangleploc[1],triangleploc[2]));
		}
		triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
		trianglemterial=new THREE.MeshBasicMaterial({color:colorcode,side:THREE.DoubleSide,transparent : 1});
		triid=this.triangles.length;
		this.triangles[triid] = new THREE.Mesh(triangleGeometry,trianglemterial);
		scene.add(this.triangles[triid]);
		this.triangles[triid].material.opacity=0.2;
		this.triangles[triid].prop="triangle";
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
	if (this.showneighbor)   
	  this.GetNeighbors();
	if (this.bygeneexp)
	  this.ByGeneExp();
	if (this.showseg)
	  this.ShowSegmentation();
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
CellPlot.Canvas.prototype.GetNeighbors=function()// for the neighbor of selected cells, color the neigbors, link a line, and display their names
{
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
			//console.log(contact_pairs[current_tloc]);
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

CellPlot.Canvas.prototype.ShowSegmentation=function()
{
	for (i=0;i<this.triangles.length;i++)
	  this.scene.remove(this.triangles[i]);
	this.triangles=[];
	for (var s=0; s<selected_cellids.length; s++){
		var cloc=cellid_tocurrent[selected_cellids[s]];
		if (cloc>-1)
		{  
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ )
			  color += letters[(Math.pow(s,3*i))%16];     
			this.DrawTriaggles(segp_locs[current_tloc],segf_pids[current_tloc],segc_fids[current_tloc][cloc],color);
		}
	}

}

CellPlot.Canvas.prototype.ColorOffsprings=function()
{
	for (var c=0; c<cellnum;c++)
	  signedcolors[c]=graycolor;
	//change the color of cells's lineage
	for (var c=0; c<selected_cellids.length;c++){   
		cname=cellnames[selected_cellids[c]];
		dfloc=(dfnames).indexOf(cname);
		dfrange=offsprange[dfloc];
		for (var d=dfrange[0]; d<dfrange[1]+1;d++)
		{
			dfname=dfnames[d-1];
			loc=cellnames.indexOf(dfname);
			signedcolors[loc]=highlightcolor;
		}
	}   
	this.ColorCells(current_cellids[current_tloc],[]);
}

//*****************************
//CellPlot.Tree is a tree
//*******************************

CellPlot.Tree=function(container)
{
	// Calculate total nodes, max label length
	this.totalNodes = 0;
	this.maxLabelLength = 0;
	// variables for drag/drop
	this.selectedNode = null;
	this.draggingNode = null;
	// panning variables
	this.panSpeed = 200;
	this.panBoundary = 30; // Within 20px from edges will pan when dragging.
	// Misc. variables
	var i = 0;
	this.duration = 200;
	var root;
	this.root=root;

	// size of the diagram
	this.viewerWidth = container.clientWidth;
	this.viewerHeight = container.clientHeight;
	//this.viewerWidth=800;
	//this.viewerHeight=600;

	this.tree = d3.layout.tree()
		.size([this.viewerHeight, this.viewerWidth]);

	// define a d3 diagonal projection for use by the node paths later on.
	this.diagonal = d3.svg.diagonal()
		.projection(function(d) {
			return [d.y, d.x];
		});

	this.sortTree();
	_this=this;
	var zoom=function() {
		_this.svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	this.zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

	this.baseSvg = d3.select("#CellPlot_Tree").append("svg")
		.attr("width", this.viewerWidth)
		.attr("height", this.viewerHeight)
		.attr("class", "overlay")
		.call(this.zoomListener);
	// Append a group which holds all nodes and which the zoom Listener can act upon.
	this.svgGroup = this.baseSvg.append("g");

	this.click=function(d) {
		if (d3.event.defaultPrevented) return; // click suppressed
		//d = toggleChildren(d);
		//_this.update(d);
		$("#cellnode_"+d.cellid).children()[0].style.fill="#ff0000";
		_this.centerNode(d);
		CP.canvas.Addtoselected(d.cellid);
	}
	this.zoomListener.scale(0.5);
	this.LoadData("test.json");
}

CellPlot.Tree.prototype.LoadData=function(name)
{
	_this=this;
	var data=[];
	newdata=function(){
		this.cellid;
		this.name;
		this.color;
		this.children=[];
		return this;
	}
	for(i=0;i<dlist.length;i++){
		cellid=dlist[i];
		data[cellid]=new newdata();
		data[cellid].cellid=dlist[i];
		data[cellid].name=cellnames[dlist[i]];
		data[cellid].children=[];
		data[cellid].color=CP.RGB2HTML(colorbygene[cellid][0],colorbygene[cellid][1],colorbygene[cellid][2]);
	}
	var thefi=0;
	for(i=0;i<dlist.length;i++){
		if(mlist[i]==-2){
			thefi=i;
			continue;
		}
		data[mlist[i]].children.push(data[dlist[i]]);
	}
	data=data[0];
	//console.log(data[thefi]);
	_this.visit(data, function(d) {
		_this.totalNodes++;
		_this.maxLabelLength = Math.max(d.name.length, _this.maxLabelLength);

	}, function(d) {
		return d.children && d.children.length > 0 ? d.children : null;
	});
	_this.root = data;
	_this.root.x0 = _this.viewerHeight / 2;
	_this.root.y0 = 0;

	// Layout the tree initially and center on the root node.
	_this.update(_this.root);
	_this.centerNode(_this.root);

}
// A recursive helper function for performing some setup by walking through all nodes
CellPlot.Tree.prototype.visit=function(parent, visitFn, childrenFn) {
	if (!parent) return;

	visitFn(parent);

	var children = childrenFn(parent);
	if (children) {
		var count = children.length;
		for (var i = 0; i < count; i++) {
			this.visit(children[i], visitFn, childrenFn);
		}
	}
}

/*
// Call visit function to establish maxLabelLength
visit(treeData, function(d) {
totalNodes++;
maxLabelLength = Math.max(d.name.length, maxLabelLength);

}, function(d) {

PCA是Principal component analysis的缩写，	return d.children && d.children.length > 0 ? d.children : null;
});
*/

// sort the tree according to the node names

CellPlot.Tree.prototype.sortTree=function() {
	this.tree.sort(function(a, b) {
		return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
	});
}
// Sort the tree initially incase the JSON isn't in a sorted order.

// TODO: Pan function, can be better implemented.

CellPlot.Tree.prototype.pan=function(domNode, direction) {
	var speed = this.panSpeed;
	if (panTimer) {
		clearTimeout(panTimer);
		translateCoords = d3.transform(this.svgGroup.attr("transform"));
		if (direction == 'left' || direction == 'right') {
			translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
			translateY = translateCoords.translate[1];
		} else if (direction == 'up' || direction == 'down') {
			translateX = translateCoords.translate[0];
			translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
		}
		scaleX = translateCoords.scale[0];
		scaleY = translateCoords.scale[1];
		scale = this.zoomListener.scale();
		this.svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
		d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
		this.zoomListener.scale(this.zoomListener.scale());
		this.zoomListener.translate([translateX, translateY]);
		panTimer = setTimeout(function() {
			this.pan(domNode, speed, direction);
		}, 50);
	}
}

// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

CellPlot.Tree.prototype.centerNode=function(source) {
	scale = this.zoomListener.scale();
	x = -source.y0;
	y = -source.x0;
	x = x * scale + this.viewerWidth / 2;
	y = y * scale + this.viewerHeight / 2;
	d3.select('g').transition()
		.duration(this.duration)
		.attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
	this.zoomListener.scale(scale);
	this.zoomListener.translate([x, y]);
}

CellPlot.Tree.prototype.update=function(source) {
	// Compute the new height, function counts total children of root node and sets tree height accordingly.
	// This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
	// This makes the layout more consistent.
	_this=this;
	var levelWidth = [1];
	var childCount = function(level, n) {

		if (n.children && n.children.length > 0) {
			if (levelWidth.length <= level + 1) levelWidth.push(0);

			levelWidth[level + 1] += n.children.length;
			n.children.forEach(function(d) {
				childCount(level + 1, d);
			});
		}
	};
	childCount(0, this.root);
	var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
	this.tree = this.tree.size([newHeight, this.viewerWidth]);

	// Compute the new tree layout.
	var nodes = this.tree.nodes(this.root).reverse(),
		links = this.tree.links(nodes);

	// Set widths between levels based on maxLabelLength.
	nodes.forEach(function(d) {
		d.y = (d.depth * (_this.maxLabelLength * 10)); //maxLabelLength * 10px
		// alternatively to keep a fixed scale one can set a fixed depth per level
		// Normalize for fixed-depth by commenting out below line
		// d.y = (d.depth * 500); //500px per level.
	});

	// Update the nodes…
	node = this.svgGroup.selectAll("g.node")
		.data(nodes, function(d) {
			return d.id || (d.id = ++i);
		});

	// Enter any new nodes at the parent's previous position.

	var nodeEnter = node.enter().append("g")
		//	   .call(dragListener)
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		})
		.attr("id", function(d){
			return "cellnode_"+d.cellid;
		})
	.on('click', this.click);
	nodeEnter.append("circle")
		.attr('class', 'nodeCircle')
		.attr("r", 0)
		.style("fill", function(d) {
			return d.selected ? "lightsteelblue" : "#fff";
		});

	nodeEnter.append("text")
		.attr("x", function(d) {
			return d.children || d._children ? -10 : 10;
		})
	.attr("dy", ".35em")
		.attr('class', 'nodeText')
		.attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		})
		.attr("fill",function(d) {
			return d.color
		})
	.text(function(d) {
		return d.name;
	})
	.style("fill-opacity", 0);

	// phantom node to give us mouseover in a radius around it
	nodeEnter.append("circle")
		.attr('class', 'ghostCircle')
		.attr("r", 30)
		.attr("opacity", 0.2) // change this to zero to hide the target area
		.style("fill", "red")
		.attr('pointer-events', 'mouseover')
		.on("mouseover", function(node) {
			overCircle(node);
		})
	.on("mouseout", function(node) {
		outCircle(node);
	});

	// Update the text to reflect whether node has children or not.
	node.select('text')
		.attr("x", function(d) {
			return d.children || d._children ? -10 : 10;
		})
	.attr("text-anchor", function(d) {
		return d.children || d._children ? "end" : "start";
	})
	.text(function(d) {
		return d.name;
	});

	// Change the circle fill depending on whether it has children and is collapsed
	node.select("circle.nodeCircle")
		.attr("r", 7.5)
		.style("fill", function(d) {
			return d.selected ? "lightsteelblue" : "#fff";
		});

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(this.duration)
		.attr("id", function(d){
			return "cellnode_"+d.cellid;
		})	
		.attr("transform", function(d) {
			return "translate(" + d.y + "," + d.x + ")";
		});

	// Fade the text in
	nodeUpdate.select("text")
		.style("fill-opacity", 1);

	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
		.duration(this.duration)
		.attr("transform", function(d) {
			return "translate(" + source.y + "," + source.x + ")";
		})
	.remove();

	nodeExit.select("circle")
		.attr("r", 0);

	nodeExit.select("text")
		.style("fill-opacity", 0);

	// Update the links…
	var link = this.svgGroup.selectAll("path.link")
		.data(links, function(d) {
			return d.target.id;
		});

	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.attr("d", function(d) {
			var o = {
				x: source.x0,
			y: source.y0
			};
			return _this.diagonal({
				source: o,
				   target: o
			});
		});

	// Transition links to their new position.
	link.transition()
		.duration(_this.duration)
		.attr("d", _this.diagonal);

	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
		.duration(_this.duration)
		.attr("d", function(d) {
			var o = {
				x: source.x,
			y: source.y
			};
			return _this.diagonal({
				source: o,
				   target: o
			});
		})
	.remove();

	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}

CellPlot.Tree.prototype.ClearSelect=function()
{
	for(i=0;i<cellnum;i++){
		a=$("#cellnode_"+i).children()[0];
		if(a)
		  $("#cellnode_"+i).children()[0].style.fill="#ffffff";
	}
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
	if(cvalue<rawtimelist[rawtimelist.length-1]){
		$('#CellPlot_Slide').slider("value",cvalue+1);
	}else{
		CP.control.StopPlay();
	}
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
	CP.canvas.showseg=false;
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
	this.ClearSelection();
	$('#CellPlot_Slide').slider("option","max",rawtimelist[rawtimelist.length-1]);
	this.Replay();
}

CellPlot.Control.prototype.ClearColor=function()
{
	CP.canvas.showneighbor=false;
	CP.canvas.bygeneexp=false;
	for (var c=0; c<cellnum;c++)
	  signedcolors[c]=graycolor;
	CP.canvas.ColorCells(current_cellids[current_tloc],[]);
}

CellPlot.Control.prototype.ClearSelection=function()
{
	CP.canvas.ColorCells(selected_cellids,[]);
	CP.canvas.ClearSelect();
	CP.tree.ClearSelect();
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
	CP.canvas.bygeneexp=!CP.canvas.bygeneexp;
	CP.canvas.ByGeneExp();
}

CellPlot.Control.prototype.ShowNeighbor=function()
{
	CP.canvas.showneighbor=!CP.canvas.showneighbor;
	CP.canvas.LoadData(current_tloc+1);
}

CellPlot.Control.prototype.ShowSeg=function()
{
	CP.canvas.showseg=!CP.canvas.showseg;
	CP.canvas.LoadData(current_tloc+1);
}

CellPlot.Control.prototype.ShowOffsprings=function()
{
	CP.canvas.ColorOffsprings();
}

//***************************************
//CP.button is class of button 
//***************************************

CellPlot.Button=function(container)
{
	this.buttoncontainer=[];
	this.button=[];
	this.addbuttonclass=function(name)
	{
		br=document.createElement("br");
		buttonclass=document.createElement("div");
		buttonclass.id=name;
		buttonclass.className="btn-group";
		//buttonclass.innerText=name;
		container.appendChild(br);
		container.appendChild(buttonclass);
		this.buttoncontainer[name]=buttonclass;
	}
	this.addbutton=function(bcontainer,name,fname)
	{
		buttonclass=document.createElement("button");
		buttonclass.id=name;
		buttonclass.className="btn btn-default";
		buttonclass.innerText=name;
		buttonclass.onclick=fname;
		bcontainer.appendChild(buttonclass);
		this.button[name]=buttonclass;
	}
	this.addbuttonclass("Play Control");
	this.addbutton(this.buttoncontainer["Play Control"],"Play/Pause",function(){CP.control.PlayandPause()});
	this.addbutton(this.buttoncontainer["Play Control"],"Move Forward",function(){CP.control.MoveForward()});
	this.addbutton(this.buttoncontainer["Play Control"],"Move Backward",function(){CP.control.MoveBackward()});
	this.addbuttonclass("Color Control");
	this.addbutton(this.buttoncontainer["Color Control"],"By CellType",function(){CP.control.ColorbyCellType()});
	this.addbutton(this.buttoncontainer["Color Control"],"By Gene Expression",function(){CP.control.ColorbyGeneExp()});
	this.addbutton(this.buttoncontainer["Color Control"],"ClearColor",function(){CP.control.ClearColor()});
	this.addbutton(this.buttoncontainer["Color Control"],"ClearSelection",function(){CP.control.ClearSelection()});
	this.addbuttonclass("Option");
	this.addbutton(this.buttoncontainer["Option"],"Show Neighbor",function(){CP.control.ShowNeighbor()});
	this.addbutton(this.buttoncontainer["Option"],"Show Vseg",function(){CP.control.ShowSeg()});
	this.addbutton(this.buttoncontainer["Option"],"Show Offsprings",function(){CP.control.ShowOffsprings()});
	return this;
}

