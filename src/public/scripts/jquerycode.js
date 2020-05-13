$(document).ready(function(){

    var $main = $('#main')
    var $menu = $("#menu")
    var $about = $("#about")
    var standardW = '90vw' //of main/about section
    var standardMarg = '5vw' // of main/about section
    var hiddenW = '45px' //width when about section is hidden
    var standardPadding = '5px 20px 10px 20px' //of about section
    var hiddenPadding = '0 0 0 0' //of about section when hidden
    
    //hide about section
    $("#hide").click(function () {
        $("#hidden1").toggle(); // "hide" text in button
        $("#main-collapse").toggle(); // text in section
        $about.toggleClass('hide')
        var hide = $about.hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var smallerWidth = window.innerWidth * 0.9 - 270
        $about.animate({width: hide ? hiddenW : moveRight ? smallerWidth : standardW }, { duration: 0, queue: false})
        $about.animate({padding: hide ? hiddenPadding : standardPadding }, { duration: 0, queue: false})
        $about.animate({marginBottom: hide ? '20px' : '0'}, { duration: 0, queue: false})
        $about.toggleClass('float-right')
    });

    // main body moves right or goes back to normal position depending on menu
    $menu.on('click dblclick',function(e){
        $main.toggleClass('moveRight')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = window.innerWidth * 0.05 + 270
        var smallerWidth = window.innerWidth * 0.9 - 270
        var hide = $about.hasClass('hide')
        $main.animate({width: moveRight ? smallerWidth : standardW }, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : standardMarg}, { duration: 250, queue: false})
        if (!hide) {
            $about.animate({width: moveRight ? smallerWidth : standardW }, { duration: 250, queue: false})
        }
    });

    //support window resizing for elements involved in jQuery animations
    window.onresize = function(event) {
        var hide = $about.hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var smallerWidth = window.innerWidth * 0.9 - 270
        var margLeft = window.innerWidth * 0.05 + 270
        if (!hide) {
            $about.animate({width: moveRight ? smallerWidth : standardW}, { duration: 250, queue: false})
        }
        $about.animate({width: hide ? hiddenW : moveRight ? smallerWidth : standardW }, { duration: 0, queue: false})
        $main.animate({width: moveRight ? smallerWidth : standardW}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : standardMarg}, { duration: 250, queue: false})
    }

});