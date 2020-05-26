var filteredData, densityData;
var svg, img, color, overlay;
var containerH, containerW;
var margRight = 100;
var classicGradient = ["rgba(59, 238, 223, 0.2)", "rgba(145, 238, 146, 0.2)",  "rgba(253, 254, 87, 0.2)","rgba(254, 138, 21, 0.2)","rgba(253, 26, 12, 0.2)", "rgba(172, 0, 1, 0.2)"]


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
    overlay.selectAll("path").remove()
    overlay.selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", function(d) { return color(d.value); })
}

// add heatmap overlay on image
function heatmap() {

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
    var x = d3.scaleLinear()
                .domain([ 0, img.naturalWidth ])
                .range([ 0, (containerW - margRight) ]); 

    // y coordinates
    var y = d3.scaleLinear()
                .domain([ img.naturalHeight, 0 ])
                .range([ containerH , 0 ])

    // compute the density data
    densityData = d3.contourDensity()
                        .x(function(d) { return x(d.x); })
                        .y(function(d) { return y(d.y); })
                        .weight(function(d) { return d.weight; })
                        .size([ (containerW-margRight), (containerH) ])
                        .bandwidth(20)
                        (filteredData)

    console.log(densityData)

    // compute array with min and max density among single points
    var minMax = findMinMax(densityData)

    // compute 5 equally sized intervals and relative color coding
    var interval = (minMax[1] - minMax[0]) / 5;
    var colorDomain = [ minMax[0], (minMax[0]+interval), (minMax[0]+2*interval), (minMax[0]+3*interval), (minMax[0]+4*interval), minMax[1] ]

    // implement color palette
    color = d3.scaleLinear()
                    .domain(colorDomain)   
                    .range(classicGradient)
    
}

export function visualize() {

    // get container ready
    d3.select("#visualization").html("");
    document.getElementById('visualization').style.position = 'relative'

    // prepare image and scale vis
    img = new Image();
    function loadImg() {
        //console.log('load vis')
        var ratio = ($("#main").width()-margRight) / this.width;
        containerW = $("#main").width();
        containerH = this.height * ratio;
        svg = d3.select("#visualization")
                .append("svg")
                .attr("width", containerW)
                .attr("height", containerH)
                .append("g")

        // add heatmap overlay
        heatmap();

         // insert overlay on svg
        overlay = svg.insert("g", "g")
        showOverlay();

        // add image
        svg.insert("image", ":first-child")
            .attr("width", containerW-margRight)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)

        // add zoom properties
        svg.call(d3.zoom().on("zoom", function () {
            svg.selectAll("image").attr("transform", d3.event.transform);
            svg.selectAll("g", "g").attr("transform", d3.event.transform);
        }))

    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }

    img.onload = loadImg;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`

}
