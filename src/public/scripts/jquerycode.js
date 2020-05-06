$(document).ready(function(){

    var $main = $('#main')
    
    //hide about section
    $("#hide").click(function () {
        $("#hidden1").toggle();
        $("#main-collapse").toggle();
        $("#about").toggleClass('hide')
        var hide = $("#about").hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var smallerWidth = $(window).width() * 0.9 - 270
        $("#about").animate({width: hide ? '45px' : moveRight ? smallerWidth : '90vw' }, { duration: 0, queue: false})
        $("#about").animate({padding: hide ? '0 0 0 0' : '5px 20px 10px 20px' }, { duration: 0, queue: false})
        $("#about").toggleClass('float-right')
    });

    // main body moves right or goes back to normal position depending on menu
    $("#menu").on('click dblclick',function(e){
        $main.toggleClass('moveRight')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = $(window).width() * 0.05 + 270
        var smallerWidth = $(window).width() * 0.9 - 270
        var hide = $("#about").hasClass('hide')
        $main.animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : '5vw'}, { duration: 250, queue: false})
        if (!hide) {
            $("#about").animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
        }
    });

    window.onresize = function(event) {
        var hide = $("#about").hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var smallerWidth = $(window).width() * 0.9 - 270
        var margLeft = $(window).width() * 0.05 + 270
        if (!hide) {
            $("#about").animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
        }
        $("#about").animate({width: hide ? '45px' : moveRight ? smallerWidth : '90vw' }, { duration: 0, queue: false})
        $main.animate({width: moveRight ? smallerWidth : '90vw'}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : '5vw'}, { duration: 250, queue: false})
    }

});