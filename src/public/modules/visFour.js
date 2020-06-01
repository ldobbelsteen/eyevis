//Chiara Liotta 1414755 - heatmap

var filteredData, densityData;
var svg, img, color, overlay, points;
var containerH, containerW, x, y, info;
const $valueRad = $("#sliderRadius");
const $valueBand =  $("#sliderBand");
const $valueAlpha = $("#sliderAlpha");
//var margRight = 100;


// update data based on options selected on menu
function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    }
    filteredData = window.data.filter((item) => {
        item.x = item["MappedFixationPointX"];
        item.y = item["MappedFixationPointY"];
        item.weight = item["FixationDuration"];
        for (let key in filter) {
            if (filter[key] === undefined) {
                continue;
            }
            if (item[key] != filter[key]) {
                return false;
            }
        }
        return true;
    });
}

export function initialize() {
    updateData();

    // sliders
    $valueRad.on("input change", () => {
        if (window.visualization == "four") showOverlay();
    });
    $valueBand.on("input change", () => {
        if (window.visualization == "four") newUser();
    });
    $valueAlpha.on("input change", () => {
        if (window.visualization == "four") showOverlay();
    });
}

export function newUser() {
    heatmap();
    showOverlay();
}

// find max and min density (using density data)
function findMinMax(data) {
    var max = 0
    var min = Infinity
    data.forEach(function (item) {
        if (item.value > max) max = item.value;
        if (item.value < min) min = item.value;
    })
    return [min,max];
}

function showOverlay() {
    
    // set color gradient
    var classicGradient = ["rgba(59, 238, 223,"+ $valueAlpha.val() + ")",
                        "rgba(145, 238, 146, "+ $valueAlpha.val() + ")",
                        "rgba(253, 254, 87, "+ $valueAlpha.val() + ")",
                        "rgba(254, 138, 21, "+ $valueAlpha.val() + ")",
                        "rgba(253, 26, 12, "+ $valueAlpha.val() + ")", 
                        "rgba(172, 0, 1, "+ $valueAlpha.val() + ")"]

    color.range(classicGradient)

    // remove all previous overlays
    overlay.selectAll("path").remove()
    points.selectAll("circle").remove()

    // add new overlay and points 
    overlay.selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", function(d) { return color(d.value); })
    points.selectAll("cirlce")
            .attr("stroke", "white")
              .data(filteredData)
              .enter().append("circle")
                .attr("cx", d => x(d.MappedFixationPointX))
                .attr("cy", d => y(d.MappedFixationPointY))
                .attr("r", $valueRad.val())
                // on mouseover pop-up with x and y coordinates and fixation duration
                .on("mouseover", function (filteredData) {
                    info.transition().duration(100).style("opacity", "1");
                    info.html(
                        "x: " +
                            filteredData.MappedFixationPointX +
                            "<br>" +
                            "y: " +
                            filteredData.MappedFixationPointY +
                            "<br>" +
                            "Fixation Duration: " +
                            filteredData.FixationDuration
                    );
                    info.style("left", d3.event.pageX + 8 + "px");
                    info.style("top", d3.event.pageY - 80 + "px");
                })
                .on("mouseout", function () {
                    info.transition().duration(200).style("opacity", 0);
                });
}

// add heatmap overlay on image
function heatmap() {

    // gradient: still not in use
    var defs = svg.append("defs");

    var gradient = defs.append("linearGradient")
                        .attr("id", "svgGradient")
                        .attr("x1", "0%")
                        .attr("x2", "100%")
                        .attr("y1", "0%")
                        .attr("y2", "100%");

    gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "0%")
            .attr("stop-color", "rgba(59, 238, 223)") //light blue
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "20%")
            .attr("stop-color", "rgb(145, 238, 146)") //light green
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "40%")
            .attr("stop-color", "rgb(253, 254, 87)") //yellow
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "60%")
            .attr("stop-color", "rgb(254, 138, 21)") //orange
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "80%")
            .attr("stop-color", "rgb(253, 26, 12)") //red
            .attr("stop-opacity", 1);
    gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "100%")
            .attr("stop-color", "rgb(172, 0, 1)") //dark red
            .attr("stop-opacity", 1);

    // x coordinates
    x = d3.scaleLinear()
                .domain([ 0, img.naturalWidth ])
                //.range([ 0, (containerW - margRight) ]); 
                .range([ 0, (containerW) ]); 

    // y coordinates
    y = d3.scaleLinear()
                .domain([ img.naturalHeight, 0 ])
                .range([ containerH , 0 ])

    // compute the density data
    densityData = d3.contourDensity()
                        .x(function(d) { return x(d.x); })
                        .y(function(d) { return y(d.y); })
                        .weight(function(d) { return d.weight; })
                        //.size([ (containerW-margRight), (containerH) ])
                        .size([ (containerW), (containerH) ])
                        .bandwidth($valueBand.val())
                        (filteredData)

    // compute array with min and max density among single points
    var minMax = findMinMax(densityData)

    // compute 5 equally sized intervals and relative color coding
    var interval = (minMax[1] - minMax[0]) / 5;
    var colorDomain = [ minMax[0], (minMax[0]+interval), (minMax[0]+2*interval), (minMax[0]+3*interval), (minMax[0]+4*interval), minMax[1] ]

    // implement color palette
    color = d3.scaleLinear()
                    .domain(colorDomain) 
    
}

export function visualize() {

    // get container ready
    d3.select("#visualization").html("");

    // pop-up with x, y, fixation duration
    info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

    // prepare image and scale vis
    img = new Image();
    function loadImg() {
        var originalW = img.width;
        var originalH = img.height;
        var ratio = $("#main").width() / originalW;
        containerW = $("#main").width();
        containerH = originalH * ratio;
        svg = d3.select("#visualization")
                .append("svg")
                .attr("id", "svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + containerW + " "+ containerH)
                .append("g")

        // add heatmap overlay
        heatmap();

         // insert overlay on svg
        overlay = svg.insert("g", "g");
        points = svg.append("g", "g");
        showOverlay();

        // add image
        svg.insert("image", ":first-child")
            //.attr("width", containerW-margRight)
            .attr("width", containerW)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)


        // add zoom properties
        const zoom = d3.zoom()
                        .on("zoom", zoomed);

        function zoomed() {
            svg.selectAll("image").attr("transform", d3.event.transform);
            svg.selectAll("g", "g").attr("transform", d3.event.transform);
        }

        svg.call(zoom)
        
        // button to reset zoom
        $("#reset4").on("click", () => {
            if (window.visualization == "four") {
                svg.transition()
                    .duration(400)
                    .call(zoom.transform, d3.zoomIdentity);
            }
        });
    }

    // alert if the image fails to load
    function loadFailure() {
        alert("Failed to load.");
        return true;
    }

    img.onload = loadImg;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`

}
