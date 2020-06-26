//Eric Abraham 1408828 scanpath visualization

var filteredData;
var container = $("#vis1");
var colorPickerLine = $("#line");
var colorPickerCircle = $("#circle");
var colorPickerButton = $("#colorPick"); //button that changed both  line and circle colors
var circleColor = "4682B4"; //COLOR OF THE CIRCLE COLOR PICKER is preset to steelblue
var lineColor = "ff0000"; //COLOR FO THE LINE COLOR PICKER is preset to red
var colorHSL = ["207", "44", "49"]; //hsl is presed to steelblue

var img, xOffset, yOffset, svg, info;
var points, lines;
var topContainer, containerH, containerW, gradient, imageH, imageW, imgSvg;
var startColor, endColor;
var zoomObjects;
var gradientScale;

//variables used to control the coordiante axes
var xScaleReference, yScaleReference;
var xAxis, yAxis;
var xAxisPlacement, yAxisPlacement;
var margin = { top: 35, left: 50, right: 10, bottom: 10 };

//loading animation functions
function showLoading() {
    container.LoadingOverlay("show", {
        background: "rgba(255,255,255,0.80)",
        fade: [10, 300],
    });
}

export function rescaleAxis() {
    let newX = d3.event.transform.rescaleX(xScaleReference);
    let newY = d3.event.transform.rescaleY(yScaleReference);
    xAxis.call(xAxisPlacement.scale(newX));
    yAxis.call(yAxisPlacement.scale(newY));
}

export function svgScanpath() {
    return [zoomObjects, lines, points, imgSvg];
}

function initializeGradient() {
    var defs = topContainer.append("defs");

    gradient = defs.append("linearGradient").attr("id", "svgGradient").attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
}

function colorGrandient() {
    startColor = HSLToHex(colorHSL[0], 0, colorHSL[2]);
    endColor = HSLToHex(colorHSL[0], 100, colorHSL[2]);

    gradient.selectAll("stop").remove();
    gradient.append("stop").attr("class", "start").attr("offset", "0%").attr("stop-color", `${startColor}`).attr("stop-opacity", 1);
    gradient.append("stop").attr("class", "end").attr("offset", "100%").attr("stop-color", `${endColor}`).attr("stop-opacity", 1);
}

function hideLoading() {
    container.LoadingOverlay("hide", true);
}

//compare function to sort chronologically

function compare(a, b) {
    return a.Timestamp - b.Timestamp;
}

function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    };
    console.log(window.selectedUser);

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
    console.log(filteredData);
}

export function userChange() {
    showLoading();
    setTimeout(drawScanpath, 10);
    setTimeout(hideLoading, 5);
}

export function initialize() {
    updateData();

    colorPickerButton.on("click", function () {
        circleColor = colorPickerCircle.val();
        lineColor = colorPickerLine.val();
        //circle color will be transformed to HSL format because it is needed to vary the lumiescence
        colorHSL = hexToRGB(circleColor);
        showLoading();
        setTimeout(drawScanpath, 10);
        setTimeout(hideLoading, 5);
    });
}

function drawScanpath() {
    //delete previous svg lines, points and gradients
    lines.selectAll("path").remove();
    points.selectAll("circle").remove();

    topContainer.selectAll("rect").remove();
    topContainer.selectAll("text").remove();
    topContainer.selectAll("g.axis").remove();

    colorGrandient();

    //sorts data chronologically, needed for lines
    let sortedData = filteredData.sort(compare);

    //sets the scale for the gradient
    var scaleInterval = [parseInt(sortedData[0].FixationIndex), parseInt(sortedData[sortedData.length - 1].FixationIndex)];
    var interval = (scaleInterval[1] - scaleInterval[0]) / 5;
    var tickVal = [
        scaleInterval[0],
        scaleInterval[0] + interval,
        scaleInterval[0] + 2 * interval,
        scaleInterval[0] + 3 * interval,
        scaleInterval[0] + 4 * interval,
        scaleInterval[1],
    ];

    gradientScale = d3
        .scaleLinear()
        .domain([sortedData[0].FixationIndex, sortedData[sortedData.length - 1].FixationIndex])
        .range([0, containerW * 0.7]);

    topContainer
        .append("g")
        .attr("transform", "translate(" + containerW * 0.15 + "," + 50 + ")")
        .attr("class", "axis")
        .attr("color", "black")
        .call(d3.axisBottom(gradientScale).tickValues(tickVal).tickFormat(d3.format("d")).ticks(4));

    var line = d3
        .line()
        .x(function (d) {
            return xOffset(d.MappedFixationPointX);
        })
        .y(function (d) {
            return yOffset(d.MappedFixationPointY);
        });

    //container showing luminescence gradient
    topContainer
        .append("rect")
        .attr("fill", "url(#svgGradient)")
        .attr("x", containerW * 0.15)
        .attr("y", 25)
        .attr("width", containerW * 0.7)
<<<<<<< HEAD
        .attr("height", 20);
=======
        .attr("height", 25);
>>>>>>> master

    //function that draws the lines
    lines
        .attr("class", "lines")
        .append("path")
        .attr("class", "line")
        .attr("d", line(sortedData))
        .style("fill", "none")
        .style("stroke", `${lineColor}`)
        .style("stroke-width", 2);

    var pop = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

    //this creates circles with offset points, adds the hover pop-up interaction
    points
        .attr("class", "points")
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (row) => xOffset(row.MappedFixationPointX))
        .attr("cy", (row) => yOffset(row.MappedFixationPointY))
        .attr("r", (row) => Math.log2(row.FixationDuration) * 4.5 - 20)
        .attr("class", function (d) {
            return "ptS" + d.MappedFixationPointX + "" + d.MappedFixationPointY;
        })

        .style("fill", function (d, i) {
            return "hsl(" + colorHSL[0] + "," + (i / filteredData.length) * 100 + "%," + colorHSL[2] + "%)";
        })
        .style("opacity", (row) => 0.32 * (Math.log2(row.FixationDuration) / 3))
        .on("mouseover", function (filteredData) {
            var highlight = () => {
                if ($("#gradType").val() == "classic") return "#cf4af7";
                else if ($("#gradType").val() == "pinkBlue") return "#f5d253";
                else return "#fc971c";
            };

            d3.selectAll("circle.ptS" + filteredData.MappedFixationPointX + "" + filteredData.MappedFixationPointY).attr("stroke", "black");
            d3.selectAll("circle.ptH" + filteredData.MappedFixationPointX + "" + filteredData.MappedFixationPointY)
                .attr("stroke", "black")
                .attr("fill", highlight)
                .attr("stroke-width", $("#sliderRadius").val() / 2)
                .attr("r", $("#sliderRadius").val() * 2.5);
            info.transition().duration(200).style("opacity", "1");
            info.html(
                "<strong>x:</strong> " +
                    filteredData.MappedFixationPointX +
                    ";    " +
                    "<strong>y:</strong> " +
                    filteredData.MappedFixationPointY +
                    "<br>" +
                    "<strong>User:</strong> " +
                    filteredData.user +
                    "<br>" +
                    "<strong>FixationIndex:</strong> " +
                    filteredData.FixationIndex
            );
            info.style("left", d3.event.pageX + 8 + "px");
            info.style("top", d3.event.pageY - 80 + "px");
            pop.transition().duration(100).style("opacity", "1");
            pop.html(
                "<strong>x:</strong> " +
                    filteredData.MappedFixationPointX +
                    ";    " +
                    "<strong>y:</strong> " +
                    filteredData.MappedFixationPointY +
                    "<br>" +
                    "<strong>User:</strong> " +
                    filteredData.user +
                    "<br>" +
                    "<strong>Fixation Duration:</strong> " +
                    filteredData.FixationDuration
            );
            var coords = d3
                .selectAll("circle.ptH" + filteredData.MappedFixationPointX + "" + filteredData.MappedFixationPointY)
                .node()
                .getBoundingClientRect();
            pop.style("left", coords.left + 10 + "px");
            pop.style("top", coords.top + window.scrollY - 80 + "px");
        })
        .on("mouseout", function (filteredData) {
            d3.selectAll("circle.ptS" + filteredData.MappedFixationPointX + "" + filteredData.MappedFixationPointY).attr("stroke", "none");
            d3.selectAll("circle.ptH" + filteredData.MappedFixationPointX + "" + filteredData.MappedFixationPointY)
                .attr("stroke", "white")
                .attr("fill", "black")
                .attr("r", $("#sliderRadius").val())
                .attr("stroke-width", $("#sliderRadius").val() / 4);
            info.transition().duration(200).style("opacity", 0);
            pop.transition().duration(200).style("opacity", 0);
        });
}

export function visualize() {
    console.log("I AM CALLED ONCE!");
    container.html("");
    img = new Image();
    d3.selectAll(".output").remove();
    info = d3.select("body").append("div").attr("class", "output").style("opacity", 0); //the pop-up on hover thingy
    img.onload = function () {
        //onload function is needed to scale the image dynamically with the size, since the size is not known beforehand
        //image size variables
        var ratio = 650 / this.width;
        imageW = 650;
        imageH = this.height * ratio;

        containerH = imageH + margin.top + margin.bottom;
        containerW = imageW + margin.left + margin.right;

        //CREATES CONTAINER TO SHOW GRADIENT SCALE
        topContainer = d3
            .select("#vis1")
            .append("svg")
            .attr("viewBox", "0 0 " + containerW + " " + 75);

        topContainer
            .append("text")
            .attr("x", containerW * 0.5)
            .attr("y", 18)
            .style("text-anchor", "middle")
            .text("Luminescence gradient");

        initializeGradient();

        svg = d3
            .select("#vis1")
            .append("svg")
            .attr("viewBox", "0 0 " + containerW + " " + containerH)
            .append("g");

        // x coordinates that will be offset when image is scaled to fit screen
        xOffset = d3.scaleLinear().domain([0, img.naturalWidth]).range([0, imageW]);

        // y coordinates that will be offset when image is scaled to fit screen
        yOffset = d3.scaleLinear().domain([img.naturalHeight, 0]).range([imageH, 0]);

        console.log("DATA GIVEN IS: ");
        console.log(filteredData);

        zoomObjects = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        lines = zoomObjects.insert("g"); //inside this d3 object the lines will be drawn

        points = zoomObjects.insert("g"); //inside this d3 object the points will be drawn

        // create separate g for axes
        let axes = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        axes.append("rect")
            .attr("x", -margin.left)
            .attr("y", -margin.top)
            .attr("width", containerW)
            .attr("height", margin.top)
            .attr("fill", "#d9edee");

        axes.append("rect").attr("x", -margin.left).attr("y", imageH).attr("width", containerW).attr("height", margin.bottom).attr("fill", "#d9edee");

        axes.append("rect").attr("x", imageW).attr("y", -margin.top).attr("width", margin.right).attr("height", containerH).attr("fill", "#d9edee");

        axes.append("rect")
            .attr("x", -margin.left)
            .attr("y", -margin.top)
            .attr("width", margin.left)
            .attr("height", containerH)
            .attr("fill", "#d9edee");

        // Scaling
        let xScale = d3.scaleLinear().domain([0, this.width]).range([0, imageW]);

        xScaleReference = xScale.copy();

        let yScale = d3.scaleLinear().domain([this.height, 0]).range([imageH, 0]);

        yScaleReference = yScale.copy();

        // Adding x-axis
        xAxisPlacement = d3.axisTop(xScale);
        xAxis = axes
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + -5 + ")")
            .call(xAxisPlacement);

        // Adding left y-axis
        yAxisPlacement = d3.axisLeft(yScale);
        yAxis = axes
            .append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + -5 + ", 0)")
            .call(yAxisPlacement);

        drawScanpath();

        //first image is removed and then redrawn, so prevent overlapping images
        svg.selectAll(".img").remove();
        imgSvg = zoomObjects
            .insert("image", ":first-child")
            .attr("width", imageW)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)
            .attr("class", "img");
    };
    img.src = `/stimuli/${window.stimulus}`;
}

function converRGBtoHSL(r, g, b) {
    let hsl = [];
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    // Calculate hue
    // No difference
    if (delta == 0) h = 0;
    // Red is max
    else if (cmax == r) h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g) h = (b - r) / delta + 2;
    // Blue is max
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0) h += 360;
    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    hsl[0] = h;
    hsl[1] = s;
    hsl[2] = l;

    return hsl;
}

function hexToRGB(val) {
    let rgb = [];
    rgb[0] = parseInt(val[0].toString() + val[1].toString(), 16);
    rgb[1] = parseInt(val[2].toString() + val[3].toString(), 16);
    rgb[2] = parseInt(val[4].toString() + val[5].toString(), 16);

    return converRGBtoHSL(rgb[0], rgb[1], rgb[2]);
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}
