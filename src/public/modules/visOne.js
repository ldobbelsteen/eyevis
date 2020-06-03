//Eric Abraham 1408828 scanpath visualization

var filteredData;
var container = $("#visualization");
var colorDot = $("#color-dot");
var colorLine = $("#color-line");
var dotColor = "steelblue";
var lineColor = "red";
var img, xOffset, yOffset, svg, info;
var points, lines;

//loading animation functions
function showLoading() {
    container.LoadingOverlay("show", {
        background: "rgba(255,255,255,0.80)",
        fade: [10, 300],
    });
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
    colorDot.on("change", function () {
        dotColor = $(this).val();
        if (window.visualization == "one") {
            showLoading();
            setTimeout(drawScanpath, 10);
            setTimeout(hideLoading, 5);
        }
    });
    colorLine.on("change", function () {
        lineColor = $(this).val();
        if (window.visualization == "one") {
            showLoading();
            setTimeout(drawScanpath, 10);
            setTimeout(hideLoading, 5);
        }
    });
}

function drawScanpath() {
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

    //delete previous lines and points
    lines.selectAll("path").remove();
    points.selectAll("circle").remove();

    //function that draws the lines
    lines
        .append("path")
        .attr("class", "line")
        .attr("d", line(sortedData))
        .style("fill", "none")
        .style("stroke", `${lineColor}`)
        .style("stroke-width", 2);

    //zoom and pan functions
    svg.call(
        d3.zoom().on("zoom", function () {
            svg.selectAll("g", "g").attr("transform", d3.event.transform);
            svg.selectAll("image").attr("transform", d3.event.transform);
        })
    );

    //this creates circles with offset points, adds the hover pop-up interaction
    points
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (row) => xOffset(row.MappedFixationPointX))
        .attr("cy", (row) => yOffset(row.MappedFixationPointY))
        .attr("r", (row) => Math.log2(row.FixationDuration) * 5 - 20)
        .style("fill", `${dotColor}`)
        // .style("fill", function (d, i) {
        //     // console.log(i);
        //     // console.log(`${i} + ${filteredData.length} `);
        // })
        .style("opacity", (row) => 0.32 * (Math.log2(row.FixationDuration) / 3))
        .on("mouseover", function (filteredData) {
            info.transition().duration(200).style("opacity", "1");
            info.html(
                "x: " +
                    filteredData.MappedFixationPointX +
                    "<br>" +
                    "y:" +
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
        })
        .on("mouseout", function (filteredData) {
            info.transition().duration(200).style("opacity", 0);
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
        var ratio = $("#main").width() / this.width;
        let containerW = $("#main").width();
        let containerH = this.height * ratio;

        svg = d3
            .select("#visualization")
            .append("svg")
            .attr("width", containerW)
            .attr("height", containerH)
            .append("g");

        // x coordinates that will be offset when image is sacled to fit screen
        xOffset = d3.scaleLinear().domain([0, img.naturalWidth]).range([0, containerW]);

        // y coordinates that will be offset when image is scaled to fit screen
        yOffset = d3.scaleLinear().domain([img.naturalHeight, 0]).range([containerH, 0]);

        points = svg.insert("g", "g"); //inside this d3 object the points will be drawn

        lines = svg.insert("g", "g"); //inside this d3 object the lines will be drawn

        drawScanpath();

        //first image is removed and then redrawn, so prevent overlapping images
        svg.selectAll(".img").remove();
        svg.insert("image", ":first-child")
            .attr("width", containerW)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)
            .attr("class", "img");
    };
    img.src = `/stimuli/${window.stimulus}`;
}

function converRGBtoHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    //calcualte hue
    h = Math.round(h * 60);
    if (h < 0) h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;
    l = +(l * 100).toFixed(1);

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);

    return "hsl(" + h + "," + s + "%," + l + "%)";
}
