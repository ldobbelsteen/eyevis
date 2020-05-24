var filteredData, scaledData;
var svg, img;
var containerH, containerW;
var margin = {top: 30, right: 30, bottom: 10, left: 40}
var classicGradient = ["rgba(59, 232, 255, 0.2)", "rgb(249, 255, 84,0.2)",  "rgba(255, 167, 66, 0.2)","rgb(232, 14, 14,0.2)","rgb(201, 14, 14, 0.2)"]


// update data based on options selected on menu
function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    }
    filteredData = window.data.filter((item) => {
        item.x = item["MappedFixationPointX"];
        item.y = item["MappedFixationPointY"];
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
    scaleData(filteredData);
}

export function initialize() {
    console.log('initializing')
    updateData();
}

// duplicate data based on fixation duration
// so that it's a gaze duration heatmap, not a fixation count one
function scaleData(data) {
    console.log('scale data')
    scaledData = JSON.parse(JSON.stringify(data));
    scaledData.forEach( function (item) {
        var number = item.FixationDuration
        for ( var n = 0; n < number; n++) {
            scaledData.push(
                {
                    x: item.x,
                    y: item.y,
                    user: item.user,
                    FixationDuration: item.FixationDuration
                }
            )
        }
    });
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

// add heatmap overlay on image
export function heatmap() {

    // remove old heatmap overlay
    svg.select("g","g").remove()

    // x coordinates
    var x = d3.scaleLinear()
                .domain([0, img.naturalWidth])
                .range([ 0, containerW ]); 

    // y coordinates
    var y = d3.scaleLinear()
                .domain([img.naturalHeight, 0])
                .range([ containerH , margin.top ])

    // compute the density data
    var densityData = d3.contourDensity()
                        .x(function(d) { return x(d.x); })
                        .y(function(d) { return y(d.y); })
                        .size([img.width, img.height])
                        .bandwidth(14)
                        (scaledData)
    // you need to set your own thresholds to get the fixation point legend

    // compute array with min and max density among single points
    var minMax = findMinMax(densityData)

    // compute 5 equally sized intervals and relative color coding
    var interval = (minMax[1] - minMax[0]) / 5;
    var colorDomain = [minMax[0], minMax[0]+interval, minMax[0]+2*interval, minMax[0]+3*interval, minMax[1] + 1 ]

    // implement color palette
    var color = d3.scaleLinear()
                    .domain(colorDomain)   
                    .range(classicGradient)

    // insert overlay on svg
    svg.insert("g", "g")
        .selectAll("path")
        .data(densityData)
        .enter().append("path")
        .attr("d", d3.geoPath())
        .attr("fill", function(d) { return color(d.value); })
}

export function visualize() {

    // get container ready
    d3.select("#visualization").html("");
    document.getElementById('visualization').style.position = 'relative'

    // prepare image and scale vis
    img = new Image();
    function loadImg() {
        //console.log('load vis')
        var ratio = ($("#main").width()) / this.width;
        containerW = $("#main").width();
        containerH = this.height * ratio;
        svg = d3.select("#visualization")
                .append("svg")
                    .attr("width", containerW)
                    .attr("height", containerH)
                .append("g")
        
        // add heatmap overlay
        heatmap();

        // add image
        svg.insert("image", ":first-child")
            .attr("width", containerW)
            .attr("height", containerH)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)
            .attr("class", "img")
        // add zoom properties
        d3.select("#visualization").call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))

        svg.attr('display', 'block')
        svg.attr('margin-left', 'auto')
    }

    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }

    img.onload = loadImg;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`

}
