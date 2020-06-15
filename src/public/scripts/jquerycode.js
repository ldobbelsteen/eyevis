// Chiara Liotta 1414755 GUI code and vis4

import * as visFour from "/modules/visFour.js";


$(document).ready(function(){

    // ---> this section deals with the resizing the main body, menu, and homepage elements

    var $main = $('#main')
    var $menu = $("#menu")
    var $about = $("#about")
    var standardW = '90vw' //of main/about section
    var standardMarg = '5vw' // of main/about section

    // main body moves right or goes back to normal position depending on menu
    $menu.on('click dblclick',function(){
        $main.toggleClass('moveRight')
        $(window).trigger("resize");
    });

    //support window resizing for elements involved in jQuery animations
    window.onresize = function() {
        var hide = $about.hasClass('hide')
        var moveRight = $main.hasClass('moveRight')
        var margLeft = 250 + 20;
        var smallerWidth = (window.innerWidth - 250) - 40
        $main.animate({width: moveRight ? smallerWidth : standardW}, { duration: 250, queue: false})
        $main.animate({marginLeft: moveRight ? margLeft : standardMarg}, { duration: 250, queue: false})
    }

    // when user selects zip file to upload, its name appears on the input field
    document.querySelector('.custom-file-input').addEventListener('change',function(e){
        var fileName = document.getElementById("fileUpload").files[0].name;
        var nextSibling = e.target.nextElementSibling
        nextSibling.innerText = fileName
    })


    // ---> this section deals with vis 4 sliders, loading animations and some button

    function showLoading4() {
        $("#vis4").LoadingOverlay("show", {
            background  : "rgba(255,255,255,0.80)",
            fade: [10,300]
        });
    }

    //function to update a slider
    function updateSlider(slider, text) {
        text.html(slider.val());
        slider.on('input change', () => {
            text.html(slider.val());
        });
    }
    
    //slider vis4 circle radius
    const $valueRad = $('.valueRad');
    const $sliderR = $('#sliderRadius');
    updateSlider($sliderR, $valueRad);

    //slider vis4 bandwidth
    const $valueBand = $('.valueBand');
    const $sliderB = $('#sliderBand');
    updateSlider($sliderB, $valueBand);

    //slider vis4 alpha
    const $valueAlpha = $('.valueAlpha');
    const $sliderA = $('#sliderAlpha');
    updateSlider($sliderA, $valueAlpha);

    //slider vis3 interval
    const $valueInterval = $('.valueInterval');
    const $sliderI = $('#sliderInterval');
    updateSlider($sliderI, $valueInterval);

    //function to reset a slider to a value, doesn't trigger change
    function resetSlider(slider, text, value) {
        slider.val(value);
        text.html(value);
    }

    //reset button for vis4
    const $resetS4 = $('#reset-sliders4');
    $resetS4.on('click', () => {
        function reset() {
            resetSlider($sliderA, $valueAlpha, 0.3);
            resetSlider($sliderB, $valueBand, 20);
            resetSlider($sliderR, $valueRad, 1.6);
        }
        showLoading4();
        reset();
        setTimeout(visFour.newUser(), 10)
    });


    // ---> this section of code deals with elements being hidden or shown

    const $home = $("#retHome"); // button to return to homepage
    $("#visualization").hide();
    $("#visualizationGrid").hide(); // visualization div starts out hidden
    $("#export").hide(); // same for save vis button
    
    // when you go back to home, show section to upload and vis descriptions
    // but hide visualization div
    $home.on("click", () => {
        window.visualization = undefined;
        $("#vis-descr").show();
        $("#visualizationGrid").hide();
        $("#about").show();
        $("#visualization").hide();
        $("#export").hide();
        
    })

    // array of buttons to initialize the visualizations
    const vis = [ $("#init-vis2"),
                $("#init-vis3"),
                $("#init-vis5")]
    
    // when you initialize a vis, hide section to upload and vis descriptions
    // and show visualization div
    vis.forEach( (d) => {
        d.prop("disabled", true)
        d.on("click", () => {
            $("#visualizationGrid").hide();
            $("#vis-descr").hide();
            $("#about").hide();
            $("#visualization").show();
            $("#export").show();
            $(".grid-container").css("padding", "0")
        });
    })

    $("#initialize").on("click", () => {
        $("#vis-descr").hide();
        $("#about").hide();
        $("#visualization").hide();
        $("#visualizationGrid").show();
        $("#export").show();
    });

    
})