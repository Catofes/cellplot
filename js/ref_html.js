window.settinghidden=true;
function onLoad(){
	reg = new RegExp("(^|\\?|&)refid=([^&]*)(\\s|&|$)", "i");
	if(reg.test(location.href))
	  reg = unescape(RegExp.$2.replace(/\+/g, " ")); 
	refid=10;
	switch(reg){
		case "15":
			refid=15;
			break;
		case "200":
			refid=200;
			break;
	}

	url="./ajaxfolder/refmove_"+refid+"/refmove_"+refid+"_info.js";
	$('<script>').attr({
		id: 'info',
		src: url,
		type: 'text/javascript'}).appendTo('head');

}
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
			txt+=("<td><a onclick=\"onChangeGene("+num+")\">"+genenames[num]+"</a></td>");
			num++;
		}
		$("#changeCell").append(txt+"</tr>");
	}
	$("#genetitle").text(genenames[0]+"	@	"+genefilenames[0]);
}

function onChangeGene(id)
{
	geneid=id;
	//	$("#info").remove();
	//	url="./ajaxfolder/"+id+"/"+id+"_info.js";
	//	$('<script>').attr({
	//		id: 'info',
	//		src: url,
	//		type: 'text/javascript'}).appendTo('head');
	document.cellplot.tree.LoadData();
	//document.cellplot.control.Reset();
	//	document.cellplot.canvas.onDraw();
	if(document.cellplot.canvas.bygeneexp)
	  document.cellplot.control.ColorbyGeneExp();
	$("#genetitle").text(genenames[id]+"	@	"+genefilenames[id]);
	//	onSetting();		
}

function onChangeRef(id)
{
	refid=id;
	$("#info").remove();
	url="./ajaxfolder/refmove_"+id+"/refmove_"+id+"_info.js";
	$('<script>').attr({
		id: 'info',
		src: url,
		type: 'text/javascript'}).appendTo('head');
	document.cellplot.tree.LoadData();
	document.cellplot.control.Reset();
	//onSetting();
}
onLoad();
window.onresize=function(){
	document.cellplot.canvas.controls.handleResize();
}
