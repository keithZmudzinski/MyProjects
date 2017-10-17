$(function() {
$(".hoverTab a").hover(
	function(){
		$(this).animate({backgroundColor: "#33aeff",color:"white"},200)},
	function(){
		$(this).animate({backgroundColor:"white", color:'black'},200)}		
);
});
$(function(){
var state=true;
$('#menuButton').click(function(){
	if (state){
	$('#sideMenu, .wide_gone').css('display','none');
	$('#buildsList_container').css('width','100%');
	$('.wide').toggleClass('hidden');
	}
	else{
	$('#sideMenu, .wide_gone').fadeIn('slow');
	$('#buildsList_container').css('width','85%');
	$('.wide').toggleClass('hidden');
	};
	state=!state;
	});
});








	