window.settinghidden=true;
function onSetting()
{
	if(window.settinghidden){
		$('#htmlSetting').css('height', 'auto');
		var autoHeight=$('#htmlSetting').height();
		$('#htmlSetting').height('0px').animate({"height":autoHeight},"slow",function(){document.cellplot.canvas.controls.handleResize();});
		window.settinghidden=false;
	}   
	else{
		$('#htmlSetting').animate({"height":"0px"},"slow",function(){document.cellplot.canvas.controls.handleResize();});
		window.settinghidden=true;
	}
};

function onInsertSelect()
{
	var num=0;
	for(var i=0;i<17;i++){
		var txt="<tr>";
		for(var j=0;j<12;j++){
			num++;
			if(!genenames[num])continue;
			txt+=("<td><a onclick=\"onChangeGene("+num+")\">"+genenames[num]+"</a></td>");
		}
		$("#changeCell").append(txt+"</tr>");
		$("#genetitle").text(genenames[1]+"	@	"+genefilenames[1]);
	}
}

function onChangeGene(id)
{
	geneid=id;
	$("#info").remove();
	url="./ajaxfolder/"+id+"/"+id+"_info.js";
	$('<script>').attr({
		id: 'info',
		src: url,
		type: 'text/javascript'}).appendTo('head');
	document.cellplot.tree.LoadData();
	document.cellplot.control.Reset();
	$("#genetitle").text(genenames[id]+"	@	"+genefilenames[id]);
	onSetting();		
}

window.onresize=function(){
	document.cellplot.canvas.controls.handleResize();
}
