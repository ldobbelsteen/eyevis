// Milou Henzen (1409107) - ThemeRiver
// Big thanks to Eric for writing the part that calculated the number of fixations within each AOI

// Compare function to sort chronologically
function compare(a, b) {
    return a.Timestamp - b.Timestamp;
}

// Filter the data
function filterData(data, filter) {
    return data.filter((item) => {
        for (let key in filter) {
            if (item[key] != filter[key]) {
                return false;
            }
        }
        return true;
    });
}

/*
export function initialize() {}
*/

export function visualize() {
    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-aoi input:eq(0)");
    const gridSizeInputY = $("#vis-aoi input:eq(1)");

    const colorInput = $("#colorType");
    const $valueInterval = $("#sliderInterval");

    // Find the offset option
    const offsetOption = $("#offset-option");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus,
    });

    // Load stimulus and make it change when something changes
    const container = d3.select("#vis3");
    container.html("");
    let width;
    let height;
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;

        width = parseInt(container.style("width"));
        height = 0.6 * width;

        gridSizeInputX.on("change", themeRiver);
        gridSizeInputY.on("change", themeRiver);
        offsetOption.on("change", themeRiver);
        colorInput.on("change", themeRiver);
        $valueInterval.on("change", themeRiver);
        themeRiver();
    };
    image.src = stimulusLink;

    function themeRiver() {
        // Create the svg
        let svg = d3
            .select("#vis3")
            .html("")
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .append("g");

        // Get input values for the amount of horizontal and vertical AOIs
        let gridSizeX = gridSizeInputX.val();
        let gridSizeY = gridSizeInputY.val();

        // this is either d3.stackOffsetSilhouette or d3.stackOffsetExpand
        let offset = $(offsetOption).val();

        // Get AOI sizes
        let AOIsizeX = stimulusWidth / gridSizeX;
        let AOIsizeY = stimulusHeight / gridSizeY;

        // Creating array with AOIs
        let aois = [];
        for (let x = 0; x < gridSizeX; x++) {
            for (let y = 0; y < gridSizeY; y++) {
                aois.push({
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1),
                    gridX: x,
                    gridY: y,
                    name: "aoi_" + (x+1) + "_" + (y+1)
                });
            }
        }

        // Assign colors to each AOI
        let colors;
        let selectedColorset = colorInput.val();
        switch(selectedColorset) {
            case "rainbow":
                colors = d3.interpolateTurbo;
                break;
            case "blue":
                colors = d3.interpolateBlues;
                break;
            case "cool":
                colors = d3.interpolateCool;
                break;
            default:
                console.error("Color not found!");
        }
        let interval = 1 / (aois.length - 1);
        aois.forEach((aoi, index) => {
            aoi.color = colors(interval * index);
        });

        // Making array with the data
        let aoiInfo = [];

        // Sorting the timestamps to be linear
        let sortedData = data.sort(compare);

        let i = 0,
            k = 0,
            timestamp = [];
        let timeInterval = $valueInterval.val(),
            leftIndex = 0;
        timestamp[0] = 0;

        //JUST ADDS TIME INTERVALS 0, 10K, 20K, ETC..
        while (k * timeInterval < sortedData[sortedData.length - 1].Timestamp) {
            timestamp[k] = k * timeInterval;
            k++;
        }
        timestamp[k] = sortedData[sortedData.length - 1].Timestamp; //LAST TIME INTERVAL SINCE IT MAY NOT ALWAYS EXACTLY FIT 10K

        for (let i = 1; i <= timestamp.length; i++) {
            var timestampInfo = {};
            aois.forEach((aoi) => {
                timestampInfo.x = parseInt(timestamp[i - 1]);
                let name = "aoi_" + (aoi.gridX+1) + "_" + (aoi.gridY+1);
                let fixCount = 0;
                data.forEach((fix) => {
                    let x = fix.MappedFixationPointX;
                    let y = fix.MappedFixationPointY;
                    let time = fix.Timestamp;

                    if (x >= aoi.x1 && x <= aoi.x2 && y >= aoi.y1 && y <= aoi.y2 && time >= timestamp[i - 1] && time <= timestamp[i]) fixCount++;
                });
                timestampInfo[name] = fixCount;
            });
            aoiInfo.push(timestampInfo);
        }
        
        // Removing empty last element from array
        aoiInfo.pop();

        //Getting all the names of the aois to use as keys
        var keys = Object.keys(aoiInfo[0]);
        keys.shift();

        //Creating stack
        if (offset == "d3.stackOffsetSilhouette") {
            var stack = d3.stack().offset(d3.stackOffsetSilhouette).order(d3.stackOrderNone).keys(keys);
        } else {
            var stack = d3.stack().offset(d3.stackOffsetExpand).order(d3.stackOrderNone).keys(keys);
        }

        //Creating the layers
        var layers = stack(aoiInfo);

        // Calculating minumums and maximums for scaling
        var minX = d3.min(aoiInfo, function (d) {
            return d.x;
        });

        var maxX = d3.max(aoiInfo, function (d) {
            return d.x;
        });

        var minY = d3.min(layers, function (l) {
            return d3.min(l, function (d) {
                return d[0];
            });
        });

        var maxY = d3.max(layers, function (l) {
            return d3.max(l, function (d) {
                return d[1];
            });
        });

        // Scaling
        var xScale = d3
            .scaleLinear()
            .domain([minX, maxX])
            .range([40, width - 40]);

        var xScaleReference = xScale.copy();

        var yScale = d3
            .scaleLinear()
            .domain([minY, maxY])
            .range([height - 40, 40]);

        var yAxisScale = d3
            .scaleLinear()
            .domain([0, 2 * maxY])
            .range([height - 40, 40]);

        var yScaleReference = yAxisScale.copy();

        // Making it a filled in area instead of just lines
        var area = d3
            .area()
            .curve(d3.curveCardinal)
            .x(function (d) {
                return xScale(d.data.x);
            })
            .y0(function (d) {
                return yScale(d[0]);
            })
            .y1(function (d) {
                return yScale(d[1]);
            });

        // Tooltip
        let info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

        // Making the graph
        var clippath = svg
        .selectAll("g")
        .data(layers)
        .enter()
        .append("g")
        .attr("clip-path", "url(#clip)")
        .attr("fill", function (d) {
            let aoi = aois.find(x => x.name === d.key)
            return aoi.color
        });
    
        var path = svg
            .selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", function (d) {
                let aoi = aois.find(x => x.name === d.key)
                return aoi.color
            });


        // Adding the tooltip when hovered over
        // Also changing opacity of other areas
        svg.selectAll("path")
            .attr("opacity", 1)
            .on("mouseover", function (d, i) {
                svg.selectAll("path").attr("opacity", function (d, j) {
                    if (j != i) {
                        return 0.5;
                    } else {
                        return 1;
                    }
                });
            })
            .on("mousemove", function (d) {
                var mouseX = d3.mouse(this)[0];
                var invertedX = xScale.invert(mouseX);
                info.transition().duration(200).style("opacity", 1);
                info.html(
                    "Area of interest: " + d.key + "<br>"
                    +"Number of fixations: " + "sigh..." + "<br>"
                    + "Timestamp: " + parseInt(invertedX) + "ms"
                );
                info.style("left", d3.event.pageX + 8 + "px");
                info.style("top", d3.event.pageY - 48 + "px");
            })
            .on("mouseout", () => {
                info.transition().duration(200).style("opacity", 0);
                svg.selectAll("path").attr("opacity", 1);
            });

        // Adding x-axis
        var xAxisPlacement = d3.axisBottom(xScale);
        var xAxis = svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (height - 40) + ")")
            .call(xAxisPlacement);

        // Adding left y-axis
        var yAxisPlacementL = d3.axisLeft(yAxisScale);
        var yAxisL = svg.append("g").attr("class", "y-axis").attr("transform", "translate(40, 0)").call(yAxisPlacementL);

        // Adding right y-axis
        var yAxisPlacementR = d3.axisRight(yAxisScale);
        var yAxisR = svg
            .append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + (width - 40) + ", 0)")
            .call(yAxisPlacementR);

        // Allowing zooming in on graph
        const zoom = d3
            .zoom()
            //.scaleExtent([1/4, 9])
            .on("zoom", function () {
                var newX = d3.event.transform.rescaleX(xScaleReference);
                var newY = d3.event.transform.rescaleY(yScaleReference);

                // update axes with these new boundaries
                xAxis.call(xAxisPlacement.scale(newX));
                yAxisL.call(yAxisPlacementL.scale(newY));
                yAxisR.call(yAxisPlacementR.scale(newY));

                path.attr("transform", d3.event.transform);
                clippath.attr("transform", d3.event.transform);
            });

        svg.call(zoom);
    }
}
