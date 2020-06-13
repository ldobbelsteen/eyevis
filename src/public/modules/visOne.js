//Eric Abraham 1408828 scanpath visualization

var filteredData;
var container = $("#vis1");
//var colorDot = $("#color-dot");
var colorLine = $("#color-line");
var colorPicker = $(".jscolor");
var colorPickerButton = $("#colorPick");
var color = "4682B4"; //COLOR OF THE COLOR PICKER is preset to steelblue
var colorHSL = ["207", "44", "49"];
// var dotColor = "steelblue";
var lineColor = "red";
var img, xOffset, yOffset, svg, info;
var points, lines;
var topContainer, containerH, containerW, gradient;
var startColor, endColor;

//loading animation functions
function showLoading() {
    container.LoadingOverlay("show", {
        background: "rgba(255,255,255,0.80)",
        fade: [10, 300],
    });
}

export function svgScanpath() {
    return [svg, svg.selectAll("g", "g"), svg.selectAll("image")]
}

function initializeGradient() {
    var defs = topContainer.append("defs");

    gradient = defs.append("linearGradient").attr("id", "svgGradient").attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
}

function colorGrandient() {
    // startColor = "hsl(" + colorHSL[0] + "," + 0 + "%," + colorHSL[2] + "%)";
    // endColor = "hsl(" + colorHSL[0] + "," + 100 + "%," + colorHSL[2] + "%)";
    // console.log(startColor);
    // console.log(endColor);
    // console.log("calculated outputs");
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

    colorLine.on("change", function () {
        lineColor = $(this).val();
        showLoading();
        setTimeout(drawScanpath, 10);
        setTimeout(hideLoading, 5);
    });

    colorPickerButton.on("click", function () {
        color = colorPicker.val();
        colorHSL = hexToRGB(color);
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

    colorGrandient();

    //sorts data chronologically, needed for lines
    let sortedData = filteredData.sort(compare);

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
        .attr("height", 35);

    //function that draws the lines
    lines
        .append("path")
        .attr("class", "line")
        .attr("d", line(sortedData))
        .style("fill", "none")
        .style("stroke", `${lineColor}`)
        .style("stroke-width", 2);

    var pop = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

    //this creates circles with offset points, adds the hover pop-up interaction
    points
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (row) => xOffset(row.MappedFixationPointX))
        .attr("cy", (row) => yOffset(row.MappedFixationPointY))
        .attr("r", (row) => Math.log2(row.FixationDuration) * 5 - 20)
        .attr("class", function(d) { return "ptS" + d.MappedFixationPointX + "" + d.MappedFixationPointY; })
        // .style("fill", `${color}`)
        .style("fill", function (d, i) {
            return "hsl(" + colorHSL[0] + "," + (i / filteredData.length) * 100 + "%," + colorHSL[2] + "%)";
        })
        .style("opacity", (row) => 0.32 * (Math.log2(row.FixationDuration) / 3))
        .on("mouseover", function (filteredData) {
            var highlight = () => {
                if ($("#gradType").val() == "classic" ) return "#cf4af7";
                else if ($("#gradType").val() == "pinkBlue" ) return "#f5d253";
                else return "#fc971c";
            }
            var x = filteredData.MappedFixationPointX;
            var y = filteredData.MappedFixationPointY;
            d3.selectAll("circle.ptS" + x + "" + y)
                        .attr("stroke", "black")
            d3.selectAll("circle.ptH" + x + "" + y)
                .attr("stroke", "black")
                .attr("fill", highlight)
                .attr("stroke-width", $("#sliderRadius").val()/2)
                .attr("r", $("#sliderRadius").val() * 2.5)
            info.transition().duration(200).style("opacity", "1");
            info.html(
                "x: " +
                    filteredData.MappedFixationPointX +
                    "<br>" +
                    "y: " +
                    filteredData.MappedFixationPointY +
                    "<br>" +
                    "User: " +
                    filteredData.user +
                    "<br>" +
                    "FixationIndex: " +
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
            var coords = d3.selectAll("circle.ptH" + x + "" + y).node().getBoundingClientRect()
            pop.style("left", coords.left + 10 + "px");
            pop.style("top", coords.top + window.scrollY- 80 + "px");
        })
        .on("mouseout", function (filteredData) {
            var x = filteredData.MappedFixationPointX;
            var y = filteredData.MappedFixationPointY;
            d3.selectAll("circle.ptS" + x + "" + y)
                        .attr("stroke", "none")
            d3.selectAll("circle.ptH" + x + "" + y)
                .attr("stroke", "white")
                .attr("fill", "black")
                .attr("r", $("#sliderRadius").val())
                .attr("stroke-width", $("#sliderRadius").val()/4)
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
        var ratio = $("#main").width()/1.5 / this.width;
        containerW = $("#main").width()/1.5;
        containerH = this.height * ratio;

        //CREATES CONTAINER TO SHOW GRADIENT SCALE
        topContainer = d3
            .select("#vis1")
            .append("svg")
            .attr("viewBox", "0 0 " + (containerW)+ " " + 75);

        topContainer
            .append("text")
            .attr("x", containerW * 0.5)
            .attr("y", 18)
            .style("text-anchor", "middle")
            .text("Luminescence gradient");

        initializeGradient();

        svg = d3.select("#vis1").append("svg").attr("viewBox", "0 0 " + containerW + " "+ containerH).append("g");

        // x coordinates that will be offset when image is sacled to fit screen
        xOffset = d3.scaleLinear().domain([0, img.naturalWidth]).range([0, containerW]);

        // y coordinates that will be offset when image is scaled to fit screen
        yOffset = d3.scaleLinear().domain([img.naturalHeight, 0]).range([containerH, 0]);

        points = svg.insert("g", "g"); //inside this d3 object the points will be drawn

        lines = svg.insert("g", "g"); //inside this d3 object the lines will be drawn

        drawScanpath();

        //first image is removed and then redrawn, so prevent overlapping images
        svg.selectAll(".img").remove();
        svg.insert("image", ":first-child").attr("width", containerW).attr("xlink:href", `/stimuli/${window.stimulus}`).attr("class", "img");
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
