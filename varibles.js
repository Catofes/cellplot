//here specify all varibles
	
    var timelen=rawtimelist.length
	var current_cellids=new Array(timelen);
	var geneexp=new Array(timelen);
  	var drawlocs=new Array(timelen)
	var contact_pairs=new Array(timelen)//[time,cellid].pair={all cells it connected}; .area={areas}
	var contact_areas=new Array(timelen)
	
	var bygeneexp=false
	var balls=[]
	var lines=[]
	var triangles=[]
	var renderer,camera,scene,light;
	var current_tloc
	
	var segp_locs=[]
	var segf_pids=[]
	var segc_fids=[]
	
	var showneighor=false
	var showseg=false;

	var container, stats;
	var projector, mouse_move = { x: 0, y: 0 }, INTERSECTED, SELECTED=[];
	var ctrlDown = false
    var ctrlKey = 17
	var rightClick=2
	
	var highlightcolor=0xffff00
	var choosencolor=0xffff00
	var linecolor=0x000000
	var graycolor=0xCCCCCC;
	var segcolor=0x33FF66;
	var neighbor_trans=0.01
	var cellnum=cellnames.length
	var signedcolors=new Array(cellnum)
	for (var c=0; c<cellnum;c++)
	{
	 signedcolors[c]=graycolor;
	}
	var typecolors=new Array(cellnum)
	for (var c=0; c<cellnum;c++)
	{	
		switch (cellnames[c])
		{
		    case "P1":
				 typecolors[c]=0x990033
				 break
			case "P2":
				 typecolors[c]=0xFF66FF
				 break
			case "P3":
				 typecolors[c]=0xCC6699
				 break
			case "P4":
				 typecolors[c]=0xCC00FF
				 break
			case "AB":
				 typecolors[c]=0xFF9999
				 break
			case "EMS":
				 typecolors[c]=0x663366
				 break
			case "MS":
				 typecolors[c]=0xFF3366
				 break
			case "C":
				 typecolors[c]=0xCC99CC
				 break
			default:
    		{
        		switch (celltypes[c])
        		{
        		 	case "GLR":
        			 typecolors[c]=0xCCCC00;
        			 break;
        			case "death":
        			 typecolors[c]=0xFF0000;
        			 break;
        			case "epithelium":
        			 typecolors[c]=0x00CCFF;
        			 break
        			case "hypodermis":
        			 typecolors[c]=0x0000FF;
        			 break
        			case "intestine":
        			 typecolors[c]=0xFFCC00;
        			 break
        			case "marginal":
        			 typecolors[c]=0xCC9933;
        			 break
        			case "muscle":
        			 typecolors[c]=0xFFFF00;
        			 break
        			case "neuron": 
        			 typecolors[c]=0x33FF00
        			 break
        			case "reproduction":
        			 typecolors[c]=0x330099
        			 break
        			case "sensory":
        			 typecolors[c]=0x009933
        			 break   
        			case "valve":
        			 typecolors[c]=0x9999FF
        			 break
        			default:
        			 typecolors[c]=0xCCCCCC
        		}
			}
		}
	}
	var colorbygene=new Array(cellnum)
	for (var c=0;c<cellnum;c++)
	{
		colorbygene[c]=[200,200,200];
		if (isNaN(avegeneexp[c])===false)
		{
		 for (var k=0; k<3;k++)
		 {
		  colorbygene[c][k]=Math.min(255,Math.floor(300*(colortable[Math.floor(avegeneexp[c]*64)][k])))
		 }
		}
	}

			
	
	var selected_cellids=[];
	var cellid_tocurrent=new Array(cellnum)
	for (var c=0;c<cellnum;c++)
	{
	 cellid_tocurrent[c]=-1;
	}
	
	
	var stage
	var layer
