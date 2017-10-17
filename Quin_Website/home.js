$(function() {
$(".hoverTab,a").hover(
	function(){
		$(this).animate({backgroundColor: "#33aeff",color:"white"},300)},
	function(){
		$(this).animate({backgroundColor:"white", color:'black'},300)}		
);
});




	