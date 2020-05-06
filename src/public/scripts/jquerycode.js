$(document).ready(function(){

    // main body moves right or goes back to normal position depending on menu
    var $main = $('#main')
    $('#menu').click(function() {
        $main.toggleClass('moveRight')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = $(window).width() * 0.05 + 270
        var smallerWidth = $(window).width() * 0.9 - 270
        $main.animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : '5vw'}, { duration: 250, queue: false})
    })

    $("#hide").click(function () {
        $("#hidden1").toggle();
        $("#main-collapse").toggle();
        $("#about").toggleClass('hide')
        var hide = $("#about").hasClass('hide')
        var margLeft = $(window).width() * 0.95 - 45
        $("#about").animate({width: hide ? '45px' : '90vw'}, { duration: 0, queue: false})
        $("#about").toggleClass('float-right')
    });

});