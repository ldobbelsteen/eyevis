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

        // Making array with the data
        let aoiInfo = [];

        // Sorting the timestamps to be linear
        let sortedData = data.sort(compare);

        let i = 0,
            k = 1,
            timestamp = [];
        timestamp[0] = 0;

        // Since there is so much data every 10 entries are grouped into a time interval
        // This way, instead of 700 entries, there are 70 which is way more manageable 
        while (i + 10 < sortedData.length) {
            timestamp[k++] = sortedData[i + 10].Timestamp;
            i += 10;
        }
        timestamp[k] = sortedData[sortedData.length - 1].Timestamp;

        for (let i = 1; i <= timestamp.length; i++) {
            var timestampInfo = {};
            aois.forEach((aoi) => {
                timestampInfo.x = parseInt(timestamp[i-1]);
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


        //Getting all the names of the aois to use as keys
        var keys = Object.keys(aoiInfo[0]);
        keys.shift();
        console.log(keys);

        // Color gradient
        let colorScale = d3.scaleOrdinal(["#610057", "#6A006A","#590073", "#18007B", "#000084","#002B8D","#007D96","#009E9E","#00A77B","#00B02D","#00B900","#44C200","#9DCA00","#D3D300","#DC9800","#E54900","#ED0309","#F60961","#FF10B6","#FF136B","#FF171D","#FF661E","#FFBD28","#FFFF32","#D3FF3C","#87FF46","#51FF51","#5BFF85","#65FFD6","#6FFFFF","#79E9FF","#83A9FF","#8D8DFF","#AB97FF","#EAA1FF","#FFABFF","#FFB5F7"]);

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

        // Tooltip
        let info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

        // Making the graph
        svg.selectAll("g")
            .data(layers)
            .enter()
            .append("g")
            .attr("fill", function (d) {
               // return colors(Math.random());
                return colorScale(d.key);
            });

        svg.selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", function (d) {
                //return colors(Math.random());
                return colorScale(d.key);

            })
            .on("mouseover", (function (d) {
                console.log(d);
                let currentKey = d.key;
                console.log(currentKey);
                info.transition().duration(200).style("opacity", 1)
                info.html(
                    "Area of interest: " + d.key + "<br>" +
                    "Number of fixations: " + d[currentKey] + "<br>" 
                    //+ "Start time interval: " + d.x + "ms" 
                    )
                info.style("left", d3.event.pageX + 8 + "px")
                info.style("top", d3.event.pageY - 48 + "px")
            }))
            .on("mousemove", () => {
                info.style("left", d3.event.pageX + 8 + "px")
                info.style("top", d3.event.pageY - 48 + "px")
            })
            .on("mouseout", () => {
                info.transition().duration(200).style("opacity", 0)
            })

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
