$(document).ready(function(){

    // main body moves right or goes back to normal position depending on menu
    var $main = $('#main')
    $('#menu').click(function() {
        $main.toggleClass('moveRight')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = $(window).width() * 0.05 + 270
        var newWidth = $(window).width() * 0.9 - 270
        $main.animate({width: moveRight ? newWidth : '90vw'}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : '5vw'}, { duration: 250, queue: false})
    })

});