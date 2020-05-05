$(document).ready(function(){
    var $div1 = $('#main')
    $('#menu').click(function() {
        $div1.toggleClass('isOut')
        var isOut = $div1.hasClass('isOut')
        var margLeft = $(window).width() * 0.05 + 320
        $div1.animate({marginLeft: isOut ? margLeft : '5vw'}, 450)
    })
});