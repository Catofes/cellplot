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
			if(!genenames[num])continue;
			numm=num+1;
			txt+=("<td><a onclick=\"onChangeGene("+numm+")\">"+genenames[num]+"</a></td>");
			num++;
		}
		$("#changeCell").append(txt+"</tr>");
	}
	$("#genetitle").text(genenames[0]+"	@	"+genefilenames[0]);
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
