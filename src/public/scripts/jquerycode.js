// Chiara Liotta 1414755 GUI code and vis4

import * as visFour from "/modules/visFour.js";


$(document).ready(function(){

    // ---> this section deals with the resizing the main body, menu, and homepage elements

    var $main = $('#main')
    var $menu = $("#menu")
    var standardW = '90vw' //of main/about section
    var standardMarg = '5vw' // of main/about section

    // main body moves right or goes back to normal position depending on menu
    $menu.on('click dblclick',function(){
        $main.toggleClass('moveRight')
        if (!$main.hasClass('moveRight')) {
            $('#navigation').removeClass("fixed-top");
            $('#navigation').addClass("position-absolute");
            $("#navbar-collapse-1").css("max-height", window.innerHeight - 34 - 57 )
        }
        $(window).trigger("resize");
    });

    //support window resizing for elements involved in jQuery animations
    window.onresize = function() {
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

    $("#initialize").prop("disabled", true) // disabled until stimulus chosen

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
    $(".allVis").hide(); // visualization div starts out hidden
    $("#exportScanpath").hide(); // same for save vis button
    $("#exportHeatmap").hide();
    $("#exportAOIGrid").hide();
    $("#exportThemeRiver").hide();
    $("#exportSankeyDiagram").hide();
    $("#exportScarfPlot").hide();

    // when you go back to home, show section to upload and vis descriptions
    // but hide visualization div
    $home.on("click", () => {
        window.visualization = undefined;
        $("#vis-descr").show();
        $(".allVis").hide();
        $("#about").show();
        $("#exportScanpath").hide();
        $("#exportHeatmap").hide();
        $("#exportAOIGrid").hide();
        $("#exportThemeRiver").hide();
        $("#exportSankeyDiagram").hide();
        $("#exportScarfPlot").hide();
        
    })

    $("#initialize").on("click", () => {
        $("#vis-descr").hide();
        $("#about").hide();
        $(".allVis").show();
        $("#exportScanpath").show();
        $("#exportHeatmap").show();
        $("#exportAOIGrid").show();
        $("#exportThemeRiver").show();
        $("#exportSankeyDiagram").show();
        $("#exportScarfPlot").show();
    });

    // ---> deals with menu and scrolling, fixed if collapsible open

    var fixmeTop = $('#navigation').offset().top;      

    $(window).scroll(function() {                  
    
        var currentScroll = $(window).scrollTop();
    
        if (currentScroll >= fixmeTop && $main.hasClass('moveRight') ) {  
            $('#navigation').addClass("fixed-top");
            $('#navigation').removeClass("position-absolute");
            $("#navbar-collapse-1").css("max-height", window.innerHeight - 34)
        } else {
            $('#navigation').removeClass("fixed-top");
            $('#navigation').addClass("position-absolute");
            $("#navbar-collapse-1").css("max-height", window.innerHeight - 34 - 57 )
        }
    
    });

    
})