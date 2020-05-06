$(document).ready(function(){

    // main body moves right or goes back to normal position depending on menu
    var $main = $('#main')
    $('#menu').click(function() {
        $main.toggleClass('moveRight')
        var isExtended = $main.width() >= $(window).width() * 0.9 - 270
        var moveRight = $main.hasClass('moveRight')
        var margLeft = $(window).width() * 0.05 + 270
        var smallerWidth = $(window).width() * 0.9 - 270
        if (isExtended) {
            $main.animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
            $main.animate({marginLeft: moveRight ? margLeft : '5vw'}, { duration: 250, queue: false})
        }
    })

    $("#hide").click(function () {
        $("#hidden1").toggle();
        $("#main-collapse").toggle();
        $main.toggleClass('hide')
        var hide = $main.hasClass('hide')
        var margLeft = $(window).width() * 0.95 - 45
        $main.animate({width: hide ? '45px' : '90vw'}, { duration: 0, queue: false})
        $main.animate({marginLeft: hide ? margLeft : '5vw'}, { duration: 0, queue: false})
        
    });

});