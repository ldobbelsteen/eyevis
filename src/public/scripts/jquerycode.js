$(document).ready(function(){

    var $main = $('#main')
    var $menu = $("#menu")
    var $about = $("#about")
    var standardW = '90vw' //of main/about section
    var standardMarg = '5vw' // of main/about section
    var hiddenW = '38px' //width when about section is hidden
    var standardPadding = '5px 20px 10px 20px' //of about section
    var hiddenPadding = '0 0 0 0' //of about section when hidden
    
    //hide about section
    $("#hide").click(function () {
        $("#hidden1").toggle(); // "hide" text in button
        $("#main-collapse").toggle(); // text in section
        $about.toggleClass('hide')
        var hide = $about.hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var smallerWidth = (window.innerWidth - 250) * 0.9 - 10
        $about.animate({width: hide ? hiddenW : moveRight ? smallerWidth : standardW }, { duration: 0, queue: false})
        hide ? $about.css('padding', hiddenPadding) : $about.css('padding', standardPadding)
        hide ? $about.css('margin-bottom', '20px') : $about.css('margin-bottom', '0')
        hide ? $about.css('position', 'absolute') : $about.css('position', 'relative')
        hide ? $about.css('right', '0') : $about.css('right', 'auto')
        hide ? $about.css('top', '107.6px') : $about.css('top', 'auto')
        hide ? $about.css('border-top-right-radius', '0') : $about.css('border-top-right-radius', '4px')
    });

    // main body moves right or goes back to normal position depending on menu
    $menu.on('click dblclick',function(e){
        $main.toggleClass('moveRight')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = 250 + (window.innerWidth - 250) * 0.05
        var smallerWidth = (window.innerWidth - 250) * 0.9 - 10
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
        var margLeft = 250 + (window.innerWidth - 250) * 0.05
        var smallerWidth = (window.innerWidth - 250) * 0.9 - 10
        if (!hide) {
            $about.animate({width: moveRight ? smallerWidth : standardW}, { duration: 250, queue: false})
        }
        $about.animate({width: hide ? hiddenW : moveRight ? smallerWidth : standardW }, { duration: 0, queue: false})
        $main.animate({width: moveRight ? smallerWidth : standardW}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : standardMarg}, { duration: 250, queue: false})
    }

    // when user selects zip file to upload, its name appears on the input field
    document.querySelector('.custom-file-input').addEventListener('change',function(e){
        var fileName = document.getElementById("fileUpload").files[0].name;
        var nextSibling = e.target.nextElementSibling
        nextSibling.innerText = fileName
    })
    
    //slider vis4 circle radius
    const $valueRad = $('.valueRad');
    const $sliderR = $('#sliderRadius');
    $valueRad.html($sliderR.val());
    $sliderR.on('input change', () => {
        $valueRad.html($sliderR.val());
    });

    //slider vis4 bandwidth
    const $valueBand = $('.valueBand');
    const $sliderB = $('#sliderBand');
    $valueBand.html($sliderB.val());
    $sliderB.on('input change', () => {
        $valueBand.html($sliderB.val());
    });

    //slider vis4 alpha
    const $valueAlpha = $('.valueAlpha');
    const $sliderA = $('#sliderAlpha');
    $valueAlpha.html($sliderA.val());
    $sliderA.on('input change', () => {
        $valueAlpha.html($sliderA.val());
    });

    //function to reset a slider to a value
    function resetSlider(slider, value) {
        slider.val(value);
        slider.change();
    }

    //reset sliders vis4
    const $resetS4 = $('#reset-sliders4');
    $resetS4.on('click', () => {
        if (window.visualization == "four") {
            resetSlider($sliderA, 0.3);
            resetSlider($sliderB, 20);
            resetSlider($sliderR, 1);
        }
    });
    

});