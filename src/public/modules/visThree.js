// Milou Henzen (1409107) - ThemeRiver

//compare function to sort chronologically

function compare(a, b) {
    return a.Timestamp - b.Timestamp;
}

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

export function initialize() {}

export function visualize() {
    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-three input:eq(0)");
    const gridSizeInputY = $("#vis-three input:eq(1)");

    // Find the offset option
    const offsetOption = $("#offset-option");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus,
    });
    console.log(data);

    // Load stimulus and make it change when something changes
    const container = d3.select("#visualization");
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
        themeRiver();
    };
    image.src = stimulusLink;

    function themeRiver() {
        // Create the svg
        let svg = d3
            .select("#visualization")
            .html("")
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .append("g");

        var tooltip = d3.select("#visualization").append("div").attr("class", "info").style("opacity", 0);

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
                });
            }
        }
        console.log(aois);

        // Making array with the data
        let aoiInfo = [];

        // This should be from the lowest timestamp to the highest with intervals of 1000 (or more???)
        // But it does not work like this apparently

        let sortedData = data.sort(compare);

        let i = 0,
            k = 1,
            timestamp = [];
        timestamp[0] = 0;

        while (i + 10 < sortedData.length) {
            timestamp[k++] = sortedData[i + 10].Timestamp;
            i += 10;
        }
        timestamp[k] = sortedData[sortedData.length - 1].Timestamp;

        for (let i = 1; i <= timestamp.length; i++) {
            var timestampInfo = {};
            aois.forEach((aoi) => {
                let name = "aoi_" + aoi.gridX + "_" + aoi.gridY;
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
        console.log(aoiInfo);

        //Getting all the names of the aois to use as keys
        var keys = Object.keys(aoiInfo[0]);
        keys.shift();

        // Color pattern
        let colors = d3.interpolatePlasma;

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

        var yScale = d3
            .scaleLinear()
            .domain([minY, maxY])
            .range([height - 40, 40]);

        var yAxisScale = d3
            .scaleLinear()
            .domain([0, 2 * maxY])
            .range([height - 40, 40]);

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

        // Making the graph
        svg.selectAll("g")
            .data(layers)
            .enter()
            .append("g")
            .attr("fill", function (d) {
                return colors(Math.random());
            });

        svg.selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", function (d) {
                return colors(Math.random());
            });

        // Tooltip
        // Is for some reason at the bottom, I don't know why, but I do kinda like it
        svg.selectAll("path")
            .attr("opacity", 1)
            .on("mousemove", function (d, i) {
                var mouseX = d3.mouse(this)[0];
                var invertedX = xScale.invert(mouseX);

                var mouseY = d3.mouse(this)[1];
                var invertedY = yScale.invert(mouseY);

                tooltip
                    .html("AOI: " + keys[i] + "<br>timestamp: " + parseInt(invertedX) + "<br>fixCount: " + "(DISCLAIMER Not based on our data yet)")

                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY - 15 + "px")
                    .style("opacity", 0.9);

                // Change opacity of aois that are not hovered over
                svg.selectAll("path").attr("opacity", function (d, j) {
                    if (j != i) {
                        return 0.5;
                    } else {
                        return 1;
                    }
                });
            })
            .on("mouseout", function (d) {
                svg.selectAll("path").attr("opacity", 1);
                tooltip.style("opacity", 0);
            });

        // Adding x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - 40) + ")")
            .call(d3.axisBottom(xScale));

        // Adding left y-axis
        svg.append("g").attr("class", "y axis").attr("transform", "translate(40, 0)").call(d3.axisLeft(yAxisScale));

        // Adding right y-axis
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - 40) + ", 0)")
            .call(d3.axisRight(yAxisScale));
    }
}
