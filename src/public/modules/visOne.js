var filteredData;
var container = d3.select("#visualization");
var colorDot = $("#color-dot");
var colorLine = $("#color-line");
var dotColor = "steelblue";
var lineColor = "red";

function compare(a, b) {
    return a.Timestamp - b.Timestamp;
}

function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    };
    console.log(window.selectedUser)

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

export function initialize() {
    updateData();
    colorDot.on("change", function () {
        dotColor = $(this).val();
        visualize();
    });
    colorLine.on("change", function () {
        lineColor = $(this).val();
        visualize();
    });
}

export function visualize() {
    container.html("");
    container.append("svg");
    var svg = container.select("svg");
    var info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);
    var imgHeight;
    var imgWidth;

    let img = new Image();
    img.onload = function () {
        imgHeight = this.height;
        imgWidth = this.width;
        svg.attr("width", this.width)
            .attr("height", this.height)
            .insert("image", ":first-child")
            .attr("width", imgWidth)
            .attr("height", imgHeight)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)
            .attr("class", "img");
    };
    img.src = `/stimuli/${window.stimulus}`;

    // let zoomObject = d3.zoom().on("zoom", function () {
    //     view.attr("transform", d3.event.transform);
    //     svg.selectAll("image").attr("transform", d3.event.transform);
    //     svg.selectAll("path").attr("transform", d3.event.transform);
    // });

    svg.selectAll("g").remove();
    svg.selectAll(".img").remove();
    svg.call(
        d3.zoom().on("zoom", function () {
            view.attr("transform", d3.event.transform);
            svg.selectAll("image").attr("transform", d3.event.transform);
            svg.selectAll("path").attr("transform", d3.event.transform);
        })
    );

    var view = svg.append("g").attr("class", "view");

    let sortedData = filteredData.sort(compare);
    console.log(sortedData);
    var line = d3
        .line()
        .x(function (d) {
            return d.MappedFixationPointX;
        })
        .y(function (d) {
            return d.MappedFixationPointY;
        });

    svg.append("path")
        .attr("class", "line") // attributes given one at a time
        .attr("d", line(sortedData)) // use the value of myline(xy) as the data, 'd'
        .style("fill", "none")
        .style("stroke", `${lineColor}`)
        .style("stroke-width", 2);

    view.selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (row) => row.MappedFixationPointX)
        .attr("cy", (row) => row.MappedFixationPointY)
        .attr("r", (row) => Math.log2(row.FixationDuration) * 5 - 20)
        .style("fill", `${dotColor}`)
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
                    filteredData.user
            );
            info.style("left", d3.event.pageX + 8 + "px");
            info.style("top", d3.event.pageY - 80 + "px");
        })
        .on("mouseout", function (filteredData) {
            info.transition().duration(200).style("opacity", 0);
        });
}
