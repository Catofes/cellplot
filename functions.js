//here define all functions
//function Allother_currentcells(givencellids) // all the other current cells ids on the screen
//function Colorcells(givencellids,colorpara)
//function checkKey(e) 
//function SlideBar()
//function AfterSlide()
//function Clearlines() 
//function Showsegmentation()
//function ClearTriaggles()

function Allother_currentcells(givencellids) // all the other current cells ids on the screen
{
	var othercells=[];
	clist=current_cellids[current_tloc]
		for (var c=0; c<clist.length;c++)
		{
			if ((givencellids).indexOf(clist[c])<0)// not exit
			{	 othercells[othercells.length]=clist[c];}
		}
	return othercells
}

function Colorcells(givencellids,colorpara)//one element: color the same, []:back to original color
{
	for (var c=0; c<givencellids.length;c++)
	{
		var cid=givencellids[c];
		if (cellid_tocurrent[cid]>-1)
		{
			var tobecolorobject=scene.getObjectByName(cellnames[cid], true)
				if (tobecolorobject)
				{
					if (colorpara.length===0)//back to the original color
					{  tobecolorobject.material.color.setHex( signedcolors[cid]); }
					else if (colorpara.length===givencellids.length)// color things accordingly
					{  tobecolorobject.material.color.setHex( colorpara[c]); }
					else // everything as one
					{  tobecolorobject.material.color.setHex( colorpara);}
				}
		}//if (cellid_tocurrent[cid]>0)  
	}//for (var c=0; c<givencellids.length;c++)
}

function checkKey(e) 
{
	e = e || window.event;
	if (e.keyCode===ctrlKey)
	{	ctrlDown=true}
	else
	{	 ctrlDown=false}
}

function SlideBar() 
{
	$('#slider').slider(
				{
					value : rawtimelist[0],
	min: rawtimelist[0],
	max: rawtimelist[rawtimelist.length-1],
	change: function(event,ui) { AfterSlide(ui.value)} ,
	slide : function (event,ui) { $('#current').html(ui.value);}  
				});
}

function AfterSlide(para)
{
	current_tloc=para-1;
	$('#choosen').html(para);

	//clear the cell selections, and remove lines & Triangles on the screen
	SELECTED=[]
		Clearlines()
		ClearTriaggles()

		for (var c=0;c<cellnum;c++)
		{	 cellid_tocurrent[c]=-1;}

	if (!current_cellids[current_tloc]) // no data, need to load data
	{
		var fpath="./ajaxfolder/"+geneid+"/g"+geneid+"_t"+current_tloc+".txt"
			console.log("load data from: "+fpath)
			$.getJSON(fpath,function (data){
				current_cellids[current_tloc]=data[0];
				var current_cellnum=current_cellids[current_tloc].length;

				drawlocs[current_tloc]=new Array(current_cellnum);
				geneexp[current_tloc]=data[3]
				for (var c=0; c<current_cellnum;c++)
			{
				drawlocs[current_tloc][c]=new Array(3);
				for (var k=0;k<3;k++)
			{
				drawlocs[current_tloc][c][k]= data[1][c][k]-0.5*(minloc[k]+maxloc[k])
			}
			}
			var pairs=data[2][0]
				var areas=data[2][1]
				//console.log(129+': pairs'+pairs)
				contact_pairs[current_tloc]=new Array(current_cellnum);
			contact_areas[current_tloc]=new Array(current_cellnum);
			for (var c=0; c<current_cellnum;c++)
			{	  
				contact_pairs[current_tloc][c]=[];
				contact_areas[current_tloc][c]=[];
			}
			for (var p=0; p<pairs.length;p++)
			{
				//console.log("pair:" + pairs[p])
				var cloc=[0,0]
					for (var k=0; k<2;k++)
					{   
						cloc[k]= (current_cellids[current_tloc]).indexOf(pairs[p][k])
					} // their position in the current_cellids[current_tloc]
				var temploc=[cloc,[cloc[1],cloc[0]]]
					for (var k=0;k<2;k++)
					{
						var a=temploc[k][0],b=temploc[k][1];
						var clen=contact_areas[current_tloc][a].length
							contact_pairs[current_tloc][a][clen]=b;
						contact_areas[current_tloc][a][clen]=areas[p]								 
					}
			}

			DrawObject(drawlocs[current_tloc],current_cellids[current_tloc]);
			for (var c=0; c<current_cellids[current_tloc].length;c++)
			{	 cellid_tocurrent[current_cellids[current_tloc][c]]=c;}
			Colorcells(selected_cellids,choosencolor)//highlight cells in selection
				if (showneighor){	GetNeighbors()}
			if (bygeneexp){Bygeneexp()}
			if (showseg){Showsegmentation()}
			} );
	}
	else // there is already data
	{	   
		console.log("have data number:"+ drawlocs[current_tloc].length)

			DrawObject(drawlocs[current_tloc],current_cellids[current_tloc]);
		for (var c=0; c<current_cellids[current_tloc].length;c++)
		{	 cellid_tocurrent[current_cellids[current_tloc][c]]=c;}
		Colorcells(selected_cellids,choosencolor)//highlight cells in selection
			if (showneighor){	GetNeighbors()}
		if (bygeneexp){Bygeneexp()}
		if (showseg){Showsegmentation()}
	}
}

//////about plot
function Init3D()
{
	width = document.getElementById('canvas-frame').clientWidth;
	height = document.getElementById('canvas-frame').clientHeight; 

	container = document.getElementById('canvas-frame');
	document.body.appendChild( container );

	renderer = new THREE.WebGLRenderer({antialias: true});  // one place for optimization
	renderer.setSize(width, height );
	container.appendChild(renderer.domElement);
	renderer.setClearColorHex(0xFFFFFF, 1.0);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45 , width / height , 1 , 10000 );
	camera.position.x = 500;
	camera.position.y = 100;
	camera.position.z = 100;

	camera.up.x = 0;
	camera.up.y = 0;
	camera.up.z = 1;
	camera.lookAt( {x:0, y:0, z:0 } );

	scene.add( camera );

	controls = new THREE.TrackballControls(camera,container);



	light = new THREE.DirectionalLight(0xFFFFFF, 1.0, 0);
	light.position.set( 0, 100, 100 );
	camera.add(light);


	projector = new THREE.Projector();

	container.addEventListener( 'mousemove', onDocumentMouseMove, false );
	container.addEventListener( 'mousedown', onDocumentMouseDown, false );

}

function animate() 
{
	requestAnimationFrame( animate );
	render();
	update();
}

function onDocumentMouseDown( event )
{


	if (mouse_move.x<1 && mouse_move.y<1)
	{
		event.preventDefault();
		var vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		// create an array containing all objects in the scene with which the ray intersects
		var allinter = ray.intersectObjects( scene.children );
		var intersects=[];
		for (var i=0; i<allinter.length; i++)
		{
			if (allinter[i].object.name)
			{
				intersects[intersects.length]=allinter[i]
			}
		}

		//clear data unless Ctrl is pressed
		//	 if (ctrlDown===false )
		//	 {
		//	  Colorcells(selected_cellids,[])
		//	  SELECTED=[];
		//	  selected_cellids=[]
		//	 }

		if ( intersects.length > 0 )// clicked soemthing
		{
			if ( intersects[ 0 ].object.cellid )//and the clicked stuff is a ball
			{
				console.log("clicked:" + intersects[ 0 ].object.name)
					//add to selected cell ids only when it is not there yet
					if ((selected_cellids).indexOf(intersects[ 0 ].object.cellid)<0)
					{  Addtoselected(intersects[ 0 ].object.cellid)}

				SELECTED[SELECTED.length] = intersects[ 0 ].object


					//if (event.button===rightClick)
					//{console.log("right")}
			}
		}
		toappearstr='';
		for (var c=0;c<selected_cellids.length;c++)
		{	 toappearstr=toappearstr+","+cellnames[selected_cellids[c]];}
		$('#selectedcell').html(toappearstr);
		if (toappearstr==='')
		{$('#displayneighor').html(toappearstr);}
	}
	console.log("mouse down, current cells:"+ selected_cellids)
}


function onDocumentMouseMove( event )
{
	event.preventDefault();
	mouse_move.x = ( (event.clientX-container.offsetLeft + $(window).scrollLeft()) / container.clientWidth ) * 2 - 1;
	mouse_move.y = - ( (event.clientY- container.offsetTop+ $(window).scrollTop()) / container.clientHeight ) * 2 + 1;
}


function update()
{
	if (mouse_move.x<1 && mouse_move.y<1)
	{
		var vector = new THREE.Vector3( mouse_move.x, mouse_move.y, 1 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		// create an array containing all objects in the scene with which the ray intersects
		var allinter = ray.intersectObjects( scene.children );
		var intersects=[];
		for (var i=0; i<allinter.length; i++)
		{
			if (allinter[i].object.name)
			{
				intersects[intersects.length]=allinter[i]
			}
		}

		if ( intersects.length > 0 )
		{
			// if the closest object intersected is not the currently stored intersection object
			if ( intersects[ 0 ].object != INTERSECTED )
			{
				// restore previous intersection object (if it exists) to its original color
				if ( INTERSECTED)
				  INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				if ( intersects[ 0 ].object.name)
				{
					INTERSECTED.material.color.setHex( highlightcolor );
					// update text, if it has a "name" field.
					$('#mouseovercell').html(intersects[ 0 ].object.name);
				}
			}
		}
		else // there are no intersections
		{
			// restore previous intersection object (if it exists) to its original color, if they element is not selected already
			if (INTERSECTED)
			{
				if (INTERSECTED.cellid && SELECTED.indexOf(INTERSECTED)<0)
				{
					INTERSECTED.material.color.setHex( signedcolors[INTERSECTED.cellid]); 
				}
				INTERSECTED = null;
				$('#mouseovercell').html("");
			}
		}
		controls.update();
	}  
}

function render() 
{
	renderer.clear();
	controls.update(); //for cameras
	renderer.render( scene, camera );
}

function DrawObject(inputlocs,cellids)
{
	var current_cellnum=inputlocs.length
		//clear previous balls
		for (var b=0;b<balls.length;b++){	 scene.remove(balls[b])}
	balls = new Array(current_cellnum)
		for (var c=0;c<current_cellnum;c++)
		{
			cid=cellids[c]
				var tempmaterial=new THREE.MeshLambertMaterial({color: signedcolors[cid]})
				balls[c]=new THREE.Mesh(new THREE.SphereGeometry(10), tempmaterial);
			balls[c].id=c
				balls[c].cellid= cid
				balls[c].name=cellnames[cid]
				scene.add(balls[c]);
			balls[c].position.set(inputlocs[c][0],inputlocs[c][1],inputlocs[c][2]);
		}
}

function ThreeStart(init_t) 
{
	Init3D();
	var axisHelper = new THREE.AxisHelper( 100 ); 
	scene.add( axisHelper );
	AfterSlide(1)
		animate();
//	render();
}	

function PerformAction()
{
	showneighor=false;
	var mylist=document.getElementById("actionforcell");
	var opt=mylist.options[mylist.selectedIndex].value
		if (selected_cellids.length>0)
		{
			if (opt==1)
			{
				GetNeighbors();
				showneighor=true;
				bygeneexp=false
			}


		}
		else
		{	 if (opt>0){alert("no cell choosen")}}
}

function Clearlines()
{
	for (var l=0; l<lines.length; l++)
	{	 scene.remove(lines[l])}
	lines=[];
}


function GetNeighbors()// for the neighor of selected cells, color the neigbors, link a line, and display their names
{
	showneighor=true
		// clear lines each time they draw
		Clearlines()
		var l=0;
	var todisplay="";

	var allneibhorcellids=[];
	for (var c=0; c<selected_cellids.length;c++)
	{
		// check if the cell is still there
		var cid=selected_cellids[c]
			var ballid=cellid_tocurrent[cid]

			if (ballid>-1)
			{
				allneibhorcellids[allneibhorcellids.length]=cid
					console.log(contact_pairs[current_tloc])
					var pstart=drawlocs[current_tloc][ballid];
				console.log("in "+ current_tloc+", choosen to get neibhors of "+cellnames[cid])
					console.log("the neighbors are: "+contact_pairs[current_tloc][ballid])
					var pairid=contact_pairs[current_tloc][ballid]
					for (var p=0;p<pairid.length;p++)
					{
						var pair_ballid=pairid[p];
						//draw lines for this interaction, and line have attributes area
						var lineGeometry = new THREE.Geometry();
						var vertArray = lineGeometry.vertices;

						var pend=drawlocs[current_tloc][pair_ballid]
							vertArray.push( new THREE.Vector3(pstart[0],pstart[1],pstart[2]), new THREE.Vector3(pend[0],pend[1],pend[2]) );
						lineGeometry.computeLineDistances();
						var lineMaterial = new THREE.LineBasicMaterial( { color: linecolor} ); 
						lines[l]= new THREE.Line( lineGeometry, lineMaterial );
						lines[l].area=contact_areas[current_tloc][ballid]
							scene.add(lines[l]);

						allneibhorcellids[allneibhorcellids.length]=current_cellids[current_tloc][pair_ballid]
							todisplay=todisplay+", "+balls[pair_ballid].name

							l=l+1


					}
			}
	}
	$('#displayneighor').html(todisplay);
	var othercells=Allother_currentcells(allneibhorcellids);
	Transpcells(othercells,0.5)
		Transpcells(allneibhorcellids,1)
}
//draw the lineage tree in an interactive way
//mouse over for names
//method1: left click for next offspring; method1: right click for spaning all offsprings, method: left click again to clear finalls
//shift+left click: choose


//next step:
// color cells by neighbors
// color cells by lineages
// set back to the original color
// put gene activity in


function MoveForward()
{
	var cvalue = $('#slider').slider( "option", "value" );
	$('#slider').slider("value",cvalue+1)
}

function MoveBackward()
{
	var cvalue = $('#slider').slider( "option", "value" );
	$('#slider').slider("value",cvalue-1)
}

var myVar
function AutoPlay()
{myVar = setInterval(MoveForward,1000);}
function StopPlay()
{		 clearInterval(myVar);}	  

function ClearColor()
{
	showneighor=false
		bygeneexp=false
		for (var c=0; c<cellnum;c++)
		{     	 signedcolors[c]=graycolor;}
	Colorcells(current_cellids[current_tloc],[])
}
function Bycelltype()
{
	for (var c=0; c<cellnum;c++)
	{	 signedcolors[c]=typecolors[c]}
	Colorcells(current_cellids[current_tloc],[])
}

function ColorOffsprings()
{
	for (var c=0; c<cellnum;c++)
	{	 signedcolors[c]=graycolor;}
	//change the color of cells's lineage
	for (var c=0; c<selected_cellids.length;c++)
	{
		var cname=cellnames[selected_cellids[c]]
			var dfloc=(dfnames).indexOf(cname)
			var dfrange=offsprange[dfloc]
			for (var d=dfrange[0]; d<dfrange[1]+1;d++)
			{
				var dfname=dfnames[d-1]
					var loc=cellnames.indexOf(dfname)
					signedcolors[loc]=highlightcolor
			}

	}
	Colorcells(current_cellids[current_tloc],[])
}

function RGB2HTML(red, green, blue)
{
	var decColor =0x1000000+ blue + 0x100 * green + 0x10000 *red ;
	return '#'+decColor.toString(16).substr(1);
}

function Bygeneexp()
{

	var currentcolor=new Array(current_cellids[current_tloc].length)
		bygeneexp=true;
	for (var c=0; c<current_cellids[current_tloc].length;c++)
	{	 
		var tempcolor=[]
			if(isNaN(geneexp[current_tloc][c]))// not a number
			{	tempcolor=[100,100,100];}
			else
			{	 
				for (var k=0; k<3;k++)
				{
					tempcolor[k]=Math.max(1,Math.min(255,Math.floor(300*(colortable[Math.floor(geneexp[current_tloc][c]*64)][k]))))
				}
				var tempv=RGB2HTML(tempcolor[0],tempcolor[1],tempcolor[2])
					currentcolor[c]='0x';
				currentcolor[c]=currentcolor[c]+tempv[1]+tempv[2]+tempv[3]+tempv[4]+tempv[5]+tempv[6]
			}
		signedcolors[current_cellids[current_tloc][c]]=currentcolor[c]	 
	}

	Colorcells(current_cellids[current_tloc],currentcolor)

}




function Showsegmentation()
{
	if (!segp_locs[current_tloc])
	{
		var fpath="./ajaxfolder/"+geneid+"/s"+geneid+"_t"+current_tloc+".txt"
			console.log(fpath)
			$.getJSON(fpath,
						function (data){
							segp_locs[current_tloc]=data[0]
				segf_pids[current_tloc]=data[1]
				segc_fids[current_tloc]=data[2]
				for (var i=0; i<segp_locs[current_tloc].length;i++)
			{
				for (var k=0; k<3;k++)
			{
				segp_locs[current_tloc][i][k]=segp_locs[current_tloc][i][k]-0.5*(minloc[k]+maxloc[k])
			}
			}

			for (var i=0; i<(segf_pids[current_tloc]).length;i++)
			{	
				for (var k=0; k<(segf_pids[current_tloc][i]).length; k++)
			{segf_pids[current_tloc][i][k]=segf_pids[current_tloc][i][k]-1;}
			}

			for (var i=0;i<(segc_fids[current_tloc]).length;i++)
			{
				for (var k=0; k<(segc_fids[current_tloc][i]).length;k++)
				{	segc_fids[current_tloc][i][k]=segc_fids[current_tloc][i][k]-1;}
			}

			for (var s=0; s<selected_cellids.length; s++)
			{
				var cloc=cellid_tocurrent[selected_cellids[s]]
					if (cloc>-1)
					{	DrawTriaggles(segp_locs[current_tloc],segf_pids[current_tloc],segc_fids[current_tloc][cloc],getRandomColor())}
			}
			//plot all triaggles
						})//function(data)
	}//if (!segp_locs[current_tloc])
	else//there is already segmentation data
	{
		for (var s=0; s<selected_cellids.length; s++)
		{
			var cloc=cellid_tocurrent[selected_cellids[s]]
				if (cloc>-1)
				{	DrawTriaggles(segp_locs[current_tloc],segf_pids[current_tloc],segc_fids[current_tloc][cloc],getRandomColor())}
		}
	}

}

function getRandomColor() 
{     var letters = '0123456789ABCDEF'.split('');     
	var color = '#';     
	for (var i = 0; i < 6; i++ ) 
	{         color += letters[Math.round(Math.random() * 15)];     }     return color; 
}


function DrawTriaggles(p_locs,f_pids,fs,colorcode)
{
	for (var f=0; f<fs.length; f++)
	{
		var triangleGeometry = new THREE.Geometry();
		for (var k=0;k<3;k++)
		{
			trianglepid=f_pids[fs[f]][k];
			triangleploc=p_locs[trianglepid];
			triangleGeometry.vertices.push(new THREE.Vector3(triangleploc[0],triangleploc[1],triangleploc[2]));
		}
		triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
		trianglemterial=new THREE.MeshBasicMaterial({color:colorcode,side:THREE.DoubleSide,transparent : 1})
			triid=triangles.length
			triangles[triid] = new THREE.Mesh(triangleGeometry,trianglemterial);
		scene.add(triangles[triid]);
		triangles[triid].material.opacity=0.2
			triangles[triid].prop="triangle"
	}
}

function ClearTriaggles()
{
	for (var f=0; f<triangles.length;f++)
	{	 scene.remove(triangles[f]);}
	triangles=[];
}

function drawTree()
{
	stage = new Kinetic.Stage({
		container: 'lincontainer',
		  width: 1000,
		  height: 4000
	});
	layer = new Kinetic.Layer();
	var scale = 1;
	var min_scale = 0.1;


	// assign positions for each of them, and connect them
	var treelocs=new Array(cellnum) 
		for (var c=0;c<cellnum;c++){	treelocs[c]=[-1,-1]}
	for (var c=0; c<dlist.length;c++)
	{
		var cellid=dlist[c];	
		treelocs[cellid][0]=80*depthofthec[c];
	}
	for (var l=0;l<leafinorder.length;l++)
	{	
		var cellid=leafinorder[l];
		treelocs[cellid][1] = 10*l;
	}
	for (var d=Math.max.apply(Math, depthofthec);d>Math.min.apply(Math, depthofthec)-1;d--)
	{
		// if there is no value, it must have daughters -> obtain location from daughter
		for (var c=0; c<dlist.length;c++)
		{
			var cellid=dlist[c];
			if (depthofthec[c]===d &&treelocs[cellid][1]===-1)
			{
				var childloc=[], childid=[];
				childloc[0]=mlist.indexOf(cellid)
					childloc[1]=mlist.indexOf(cellid,childloc[0]+1)
					childid[0]=dlist[childloc[0]];childid[1]=dlist[childloc[1]];
				treelocs[cellid][1]=0.5*(treelocs[childid[0]][1]+treelocs[childid[1]][1])
			}
		}
	}

	var cellontree=new Array(cellnum)
		var linktomom=new Array(cellnum)
		var setdown=-8;
	var setright=10;

	for (var c=0; c<dlist.length;c++)
	{
		var cellid=dlist[c];
		var motherid=mlist[c];
		// plot it if it has location
		if (treelocs[cellid][0]>-1)
		{
			cellontree=new Kinetic.Label({x: treelocs[cellid][0],y: treelocs[cellid][1]});
			cellontree.add(new Kinetic.Tag({fill: RGB2HTML(colorbygene[cellid][0],colorbygene[cellid][1],colorbygene[cellid][2])}));
			cellontree.add(new Kinetic.Text({text: cellnames[cellid],
				fontFamily: 'Calibri',
				fontSize: 15,
				fill: 'black',
				name: cellnames[cellid],
				id: cellid}));
			cellontree.cellid=cellid


				if (motherid>-1)
				{
					linktomom[cellid]=new Kinetic.Line({
						points: [treelocs[cellid][0],treelocs[cellid][1]-setdown,treelocs[motherid][0]+setright,treelocs[motherid][1]-setdown],
						stroke: 'black'
					})
					layer.add(linktomom[cellid])
				}

			layer.add(cellontree);
		}
		//console.log(layer.children[layer.children.length-1].name)
	}
	layer.on('click', function(evt) {
		// get the shape that was clicked on
		var object = evt.targetNode;
		Addtoselected(object.getId())
		//ctril+click: select
		//click: how & hide, with function: show all
	});

	// add the layer to the stage
	stage.add(layer);
}
function Addtoselected(cid)
{
	if (selected_cellids.length==0||selected_cellids.indexOf(cid)<0)//not there yet
	{	
		selected_cellids[selected_cellids.length]=cid
			var selected_cell_str=cellnames[selected_cellids[0]];	
		for (var s=1;s<selected_cellids.length;s++)
		{	selected_cell_str=selected_cell_str+','+cellnames[selected_cellids[s]]}
		$('#selectedcell').html(selected_cell_str)

			//change color of the newly added cell
			Colorcells([cid],choosencolor)
			Colortreenode([cid],'yellow')
	}


}

function Clearselection()
{
	Colorcells(selected_cellids,[]);
	Colortreenode(selected_cellids,'black')
		selected_cellids=[];
	SELECTED=[]
		$('#selectedcell').html("")

}

function Colortreenode(celllist,colorpara)
{
	//find them by name and color them by color para
	for (var c=0; c<celllist.length; c++)
	{
		var cname=cellnames[celllist[c]];
		var shapes = stage.find('.'+cname)
			shapes.setFill(colorpara);
		layer.draw();

	}
}
