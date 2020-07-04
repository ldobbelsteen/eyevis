//Chiara Liotta 1414755 - heatmap

// filtered data based on stimulus and user(s) chosen, density data computed by contour-2d-d3
var filteredData, densityData;

// variables for image element, heatmap overlay, dots, gradient, and image svg element
var img, overlay, points, gradient, svgImg;

// image height and width, container height and width (excluding info at the top), x and y scales,
// and color domain (5 intervals) based on density
var imageH, imageW, containerW, containerH, x, y, colorDomain;

// main svg element, info box at the top with density scale, g element for axes, g element for zoomable elements (svgImg, overlay, points)
var svg, topInfo, axes, zoomable ;

// initialized and drawn x and y axes
var xAxisT, yAxisL, xAxis, yAxis;

// margins to make space for x and y axes
const margin = { top: 35, left: 50, right: 10, bottom: 10 };

// height of info box at the top
const rectHeight = 75;

// element for heatmap container
const container = $("#vis4");

// input elements that give values for circle radius, bandwidth, opacity, heatmap type, and gradient color
const $valueRad = $("#sliderRadius");
const $valueBand = $("#sliderBand");
const $valueAlpha = $("#sliderAlpha");
const $heatType = $("#heatmapType");
const $gradType = $("#gradType");


// different color gradients for color scale

const classicGradient = ["rgb(59, 238, 223)", // light blue
                         "rgb(145, 238, 146)", // light green
                         "rgb(253, 254, 87)", // yellow
                         "rgb(254, 138, 21)", // orange
                         "rgb(253, 26, 12)", // red
                         "rgb(172, 0, 1)"];  // dark red
                         
const colorBlind = ["rgb(0, 234, 255)", // light blue
                    "rgb(24, 0, 120)"]; // dark blue

const pinkBlue = ["pink", "blue"];

// show the loading overlay
function showLoading() {
    container.LoadingOverlay("show", {
        background: "rgba(255,255,255,0.80)",
        fade: [10, 300],
    });
}

// hide the loading overlay
function hideLoading() {
    container.LoadingOverlay("hide", true);
}

// export elements needed for linked zooming
export function svgHeatmap() {
    return [zoomable, svgImg, overlay, points];
}

// rescale axes when zooming or panning
export function rescaleAxis() {
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);

    // update axes
    xAxis.call(xAxisT.scale(newX));
    yAxis.call(yAxisL.scale(newY));
}

export function initialize() {
    updateData();

    // sliders
    $valueRad.on("change", () => {
        showLoading();
        setTimeout(showOverlay, 10);
        setTimeout(hideLoading, 5);
    });
    $valueBand.on("change", () => {
        showLoading();
        setTimeout(newUser, 10);
        setTimeout(hideLoading, 5);
    });
    $valueAlpha.on("change", () => {
        showLoading();
        setTimeout(showOverlay, 10);
        setTimeout(hideLoading, 5);
    });
    $heatType.on("change", function () {
        showLoading();
        setTimeout(newUser, 10);
        setTimeout(hideLoading, 5);
    });
    $gradType.on("change", function () {
        showLoading();
        setTimeout(showOverlay, 10);
        setTimeout(hideLoading, 5);
    });
}

// called when updating user, bandwidth, or resetting slider
// because density data needs to be recomputed in all 3 scenarios
export function newUser() {
    showLoading();
    function overlay() {
        overlayData();
        showOverlay();
    }
    setTimeout(overlay, 10);
    setTimeout(hideLoading, 5);
}

// update data based on options selected on menu
function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    };
    filteredData = window.data.filter((item) => {
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

// initialize hidden horizontal gradient
function initializeGradient() {
    var defs = topInfo.append("defs");

    gradient = defs.append("linearGradient")
                   .attr("id", "svgGradient4")
                   .attr("x1", "0%")
                   .attr("x2", "100%")
                   .attr("y1", "0%")
                   .attr("y2", "0%");
}

// deal with overlay data
function overlayData() {
    // compute the density data based on heatmap type
    if ($heatType.val() == "duration") {
        // relative gaze duration heatmap: each point get weight based on fixation duration
        densityData = d3.contourDensity()
                        .x((d) => x(d.MappedFixationPointX))
                        .y((d) => y(d.MappedFixationPointY))
                        .weight((d) => d.FixationDuration)
                        .size([imageW, imageH])
                        .bandwidth($valueBand.val())(filteredData);
    } else if ($heatType.val() == "count") {
        // fixation count heatmap: each point gets same weight (500)
        densityData = d3.contourDensity()
                        .x((d) => x(d.MappedFixationPointX))
                        .y((d) => y(d.MappedFixationPointY))
                        .weight(() => 500)
                        .size([imageW, imageH])
                        .bandwidth($valueBand.val())(filteredData);
    }

    // compute array with min and max density in dataset
    var minMax = [d3.min(densityData, (d) => d.value), d3.max(densityData, (d) => d.value)];

    // compute 5 equally sized intervals and relative color coding
    var interval = (minMax[1] - minMax[0]) / 5;
    colorDomain = [minMax[0], minMax[0] + interval, minMax[0] + 2 * interval, minMax[0] + 3 * interval, minMax[0] + 4 * interval, minMax[1]];

    // density scale for axis
    var densScale = d3
        .scaleLinear()
        .domain([minMax[0], minMax[1]])
        .range([0, containerW * 0.7]);

    // remove all previous elements in info
    topInfo.selectAll("rect").remove();
    topInfo.selectAll("text").remove();
    topInfo.selectAll("g.axis").remove();

    // info background
    topInfo.append("rect")
           .attr("x", 0)
           .attr("y", 0)
           .attr("height", rectHeight)
           .attr("width", containerW)
           .attr("fill", "black");

    // gradient
    topInfo.append("rect")
           .attr("fill", "url(#svgGradient4)")
           .attr("stroke", "white")
           .attr("x", containerW * 0.15)
           .attr("y", 25)
           .attr("width", containerW * 0.7)
           .attr("height", 20);

    // text "Density scale" above gradient
    topInfo.append("text")
           .attr("x", containerW * 0.5)
           .attr("y", 18)
           .style("fill", "white")
           .style("text-anchor", "middle")
           .text("Density scale");

    // density axis below gradient
    topInfo.append("g")
           .attr("transform", "translate(" + containerW * 0.15 + "," + 50 + ")")
           .attr("class", "axis")
           .attr("color", "white")
           .call(d3.axisBottom(densScale).tickValues(colorDomain).tickFormat(d3.format(".2f")));
}

// update heatmap overlay
function showOverlay() {

    // remove all previous overlays
    overlay.selectAll("path").remove();
    points.selectAll("circle").remove();

    // get alpha value from slider
    var alpha = $valueAlpha.val();

    // color the gradient based on menu choice
    colorGradient();

    // intialiaze color scale
    var color = d3.scaleLinear();

    // get selected gradient color on menu
    var type = $gradType.val();

    // color domain for grandients based on 2 color/density values instead of 6 (like classic gradient)
    var twoColors = [ colorDomain[0], colorDomain[colorDomain.length - 1] ]

    // create color scale based on selected gradient
    if (type == "classic") {
        color.domain(colorDomain).range(classicGradient);
    } else if (type == "pinkBlue") {
        color.domain(twoColors).range(pinkBlue);
    } else if (type == "colorBlind") {
        color.domain(twoColors).range(colorBlind);
    }

    // initialize pop-ups
    var pop = d3.select("body").append("div").attr("class", "output").style("opacity", 0);
    var info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

    // add new heatmap density overlay
    overlay
        .selectAll("path")
        // use computed density data
        .data(densityData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        // color of path based on density/color scale
        .attr("fill", (d) => color(d.value))
        .attr("opacity", alpha)
        .on("mouseover", function (densityData) {
            // all other paths more transparent
            overlay.selectAll("path").style("opacity", "0.2");
            // this path gets full opacity
            d3.select(this).style("opacity", "1");
            // pop-up with density value of this path
            pop.transition().duration(100).style("opacity", "1");
            // density on hover has 3 digits after decimal point
            pop.html("<strong>density:</strong> " + densityData.value.toFixed(3));
            pop.style("left", d3.event.pageX + 8 + "px");
            pop.style("top", d3.event.pageY - 40 + "px");
        })
        .on("mousemove", function () {
            // density pop-up moves with mouse
            pop.style("left", d3.event.pageX + 8 + "px");
            pop.style("top", d3.event.pageY - 40 + "px");
        })
        .on("mouseout", function () {
            // all paths go back to normal opacity
            overlay.selectAll("path").style("opacity", alpha);
            // pop-up disappears
            pop.transition().duration(200).style("opacity", 0);
        });

    // add new data points
    points
        .selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.MappedFixationPointX))
        .attr("cy", (d) => y(d.MappedFixationPointY))
        .attr("r", $valueRad.val())
        // give each point a class based on coordinates
        .attr("class", function (d) {
            return "ptH" + d.MappedFixationPointX + "" + d.MappedFixationPointY;
        })
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("stroke-width", $valueRad.val() / 4)
        .on("mouseover", (d) => {
            // color of highlight based on gradient chosen
            var highlight = () => {
                if ($gradType.val() == "classic") return "#cf4af7";
                else if ($gradType.val() == "pinkBlue") return "#f5d253";
                else return "#fc971c";
            };
            var x = d.MappedFixationPointX;
            var y = d.MappedFixationPointY;
            // highlight point both in heatmap and scanpath
            d3.selectAll("circle.ptH" + x + "" + y)
              .attr("stroke", "black")
              .attr("fill", highlight);
            d3.selectAll("circle.ptS" + x + "" + y)
              .attr("stroke", "black");
            // pop-up with x-y coordinates, user, and fixation duration
            pop.transition().duration(100).style("opacity", "1");
            pop.html(
                "<strong>x:</strong> " +
                    x +
                    ";    <strong>y:</strong> " +
                    y +
                    "<br>" +
                    "<strong>User:</strong> " +
                    d.user +
                    "<br>" +
                    "<strong>Fixation Duration:</strong> " +
                    d.FixationDuration
            );
            // coordinates of point on screen in heatmap
            var coordsH = d3.selectAll("circle.ptH" + x + "" + y)
                            .node()
                            .getBoundingClientRect();
            pop.style("left", coordsH.left + 8 + "px");
            pop.style("top", coordsH.top + window.scrollY - 80 + "px");
            // linked pop-up in scanpath
            info.transition().duration(200).style("opacity", "1");
            info.html(
                "<strong>x:</strong> " +
                    x +
                    ";   <strong>y:</strong> " +
                    y +
                    "<br>" +
                    "<strong>User:</strong> " +
                    d.user +
                    "<br>" +
                    "<strong>FixationIndex:</strong> " +
                    d.FixationIndex
            );
            // coordinates of point on screen in scanpath
            var coordsS = d3.selectAll("circle.ptS" + x + "" + y)
                            .node()
                            .getBoundingClientRect();
            info.style("left", (coordsS.left + coordsS.right) / 2 + 20 + "px");
            info.style("top", (coordsS.top + coordsS.bottom) / 2 + window.scrollY - 40 + "px");
        })
        .on("mouseout", function (d) {
            // all circles go back to normal style
            var x = d.MappedFixationPointX;
            var y = d.MappedFixationPointY;
            d3.selectAll("circle.ptH" + x + "" + y)
              .attr("stroke", "white")
              .attr("fill", "black");
            d3.selectAll("circle.ptS" + x + "" + y)
              .attr("stroke", "none");
            // pop-ups disappear
            pop.transition().duration(200).style("opacity", 0);
            info.transition().duration(200).style("opacity", 0);
        });
}

// color the initialized gradient
function colorGradient() {

    // remove previous colors
    gradient.selectAll("stop").remove();

    // get type of gradient selected
    var type = $gradType.val();

    // create gradient based on type selected
    if (type == "classic") {
        gradient.append("stop")
                .attr("class", "start")
                .attr("offset", "0%")
                .attr("stop-color", classicGradient[0]) // light blue
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("offset", "20%")
                .attr("stop-color", classicGradient[1]) // light green
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("offset", "40%")
                .attr("stop-color", classicGradient[2]) // yellow
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("offset", "60%")
                .attr("stop-color", classicGradient[3]) // orange
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("offset", "80%")
                .attr("stop-color", classicGradient[4]) // red
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("class", "end")
                .attr("offset", "100%")
                .attr("stop-color", classicGradient[5]) // dark red
                .attr("stop-opacity", 1);
    } else if (type == "pinkBlue") {
        gradient.append("stop")
                .attr("class", "start")
                .attr("offset", "0%")
                .attr("stop-color", pinkBlue[0]) // pink
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("class", "end")
                .attr("offset", "100%")
                .attr("stop-color", pinkBlue[1]) // blue
                .attr("stop-opacity", 1);
    } else if (type == "colorBlind") {
        gradient.append("stop")
                .attr("class", "start")
                .attr("offset", "0%")
                .attr("stop-color", colorBlind[0]) // light blue
                .attr("stop-opacity", 1);
        gradient.append("stop")
                .attr("class", "end")
                .attr("offset", "100%")
                .attr("stop-color", colorBlind[1]) // dark blue
                .attr("stop-opacity", 1);
    }
}

export function visualize() {
    // get container ready
    container.html("");

    // initialize new image element
    img = new Image();

    // onload function, where image is loaded and heatmap gets drawn
    function loadImg() {

        // save original image height and width
        var originalW = img.width;
        var originalH = img.height;

        // fixed image size + ratio
        imageW = 650;
        var ratio = imageW / originalW;
        imageH = originalH * ratio;

        // update container size with margins for x and y axes
        containerW = imageW + margin.right + margin.left;
        containerH = imageH + margin.top + margin.bottom;

        // initialize main svg element
        svg = d3.select("#vis4")
                .append("svg")
                .attr("id", "svg")
                // scale vis preseriving ratio
                .attr("viewBox", "0 0 " + containerW + " " + (containerH + rectHeight))
    
        // x scale coordinates
        x = d3.scaleLinear()
              .domain([0, img.naturalWidth])
              .range([0, imageW]);

        // y scale coordinates
        y = d3.scaleLinear()
              .domain([img.naturalHeight, 0])
              .range([imageH, 0]);

        // create separate g that contains all zoomable elements
        // zoomable elements: heatmap overlay, dots, image
        zoomable = svg.append("g")
                      .attr("transform", "translate(" + margin.left + "," + (margin.top + rectHeight) + ")");

        // create g for gradient scale info 
        topInfo = svg.append("g");
        
        initializeGradient();

        // deal with data needed for overlay
        overlayData();

        // initialize heatmap overlays as zoomable elements
        overlay = zoomable.append("g");
        points = zoomable.append("g");

        // draw overlays
        showOverlay();

        // create separate g for axes
        // axes are going to be scalable
        axes = svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + (margin.top + rectHeight)  + ")");

        // give axes a background
        axes.append("rect")
            .attr("x", -margin.left)
            .attr("y", (-margin.top-1))
            .attr("width", containerW)
            .attr("height", margin.top)
            .attr("fill", "#d9edee");

        axes.append("rect")
            .attr("x", -margin.left)
            .attr("y", imageH)
            .attr("width", containerW)
            .attr("height", margin.bottom)
            .attr("fill", "#d9edee");

        axes.append("rect")
            .attr("x", imageW)
            .attr("y", -margin.top)
            .attr("width", margin.right)
            .attr("height", containerH)
            .attr("fill", "#d9edee");

        axes.append("rect")
            .attr("x", -margin.left)
            .attr("y", -margin.top)
            .attr("width", margin.left)
            .attr("height", containerH)
            .attr("fill", "#d9edee");

        // initialize axes
        xAxisT = d3.axisTop(x);
        yAxisL = d3.axisLeft(y);

        // draw axes
        xAxis = axes.append("g")
                    .attr("transform", "translate(0 ," + -5 + ")")
                    .attr("class", "x-axis")
                    .call(xAxisT);

        yAxis = axes.append("g")
                    .attr("transform", "translate(" + -5 + ", 0)")
                    .attr("class", "y-axis")
                    .call(yAxisL);

        svg.selectAll(".img").remove();
     
        // add image to zoomable elements
        svgImg = zoomable.insert("image", ":first-child")
                         .attr("width", imageW)
                         .attr("height", imageH)
                         .attr("class", "img")
                         .attr("xlink:href", `/stimuli/${window.stimulus}`);
    }

    // alert if image fails to load
    function loadFailure() {
        alert("Failed to load.");
        return true;
    }

    img.onload = loadImg;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`;
}
