$(document).ready(function(){
    var $div1 = $('#main')
    $('#menu').click(function() {
        $div1.toggleClass('isOut')
        var isOut = $div1.hasClass('isOut')
        var margLeft = $(window).width() * 0.05 + 320
        var newWidth = $(window).width() * 0.9 - 320
        $div1.animate({width: isOut ? newWidth : '90vw'}, { duration: 450, queue: false})
        $div1.animate({marginLeft: isOut ? margLeft : '5vw'}, { duration: 450, queue: false})
    })
});