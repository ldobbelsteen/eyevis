// Filter data given a filter
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

// Main visualization function
export function visualize() {

    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-aoi input:eq(0)");
    const gridSizeInputY = $("#vis-aoi input:eq(1)");
    const colorInput = $("#colorType");
    const container = d3.select("#vis5");

    // Empty the container
    container.html("");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus
    });

    // Get the container width and set desired timeline height
    let containerWidth = $("main").width();
    let timelineHeight = parseInt(container.style("font-size"));

    // Create svg for the stimulus and timelines
    let timelines = container.append("svg");
    let stimulus = container.append("svg");
    timelines.style("margin", "0.5em");

    // Add the stimulus
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;
        stimulus.attr("viewBox", [0, 0, containerWidth, timelineHeight]);
        gridSizeInputX.on("change", updateTimelines);
        gridSizeInputY.on("change", updateTimelines);
        colorInput.on("change", updateTimelines);
        updateTimelines();
    }
    image.src = stimulusLink;

    function updateTimelines() {

        // Get input values for the amount of horizontal and vertical AOIs
        let gridSizeX = gridSizeInputX.val();
        let gridSizeY = gridSizeInputY.val();

        // Array of AOI objects
        let AOIs = [];

        // Calculate width and height of AOIs
        let AOIsizeX = stimulusWidth / gridSizeX;
        let AOIsizeY = stimulusHeight / gridSizeY;

        // Add the AOIs to the array
        for (let x = 0; x < gridSizeX; x++) {
            for (let y = 0; y < gridSizeY; y++) {
                AOIs.push({
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1),
                    x: x,
                    y: y
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
        let interval = 1 / (AOIs.length - 1);
        AOIs.forEach((aoi, index) => {
            aoi.color = colors(interval * index);
        });


        // Create array of gazes by cleaning up the data for each user and adding it
        let gazes = [];
        let highestDuration = 0;
        let users = [...new Set(data.map((item) => item.user))];
        users.sort((a, b) => { return a.slice(1) - b.slice(1) }).forEach(user => {
            let userData = filterData(data, {
                user: user
            });
            let timestamps = userData.map(x => x.Timestamp);
            let startTime = Math.min(...timestamps);
            let totalDuration = Math.max(...timestamps) - startTime;
            if (totalDuration > highestDuration) {
                highestDuration = totalDuration;
            }
            userData.forEach(gaze => {
                let x = gaze.MappedFixationPointX;
                let y = gaze.MappedFixationPointY;
                let color;
                let aoiCoords;
                AOIs.forEach(aoi => {
                    if (x >= aoi.x1 && x <= aoi.x2 && y >= aoi.y1 && y <= aoi.y2) {
                        color = aoi.color;
                        aoiCoords = [aoi.x + 1, aoi.y + 1];
                    }
                });
                if (aoiCoords == undefined) {
                    aoiCoords = "Outside grid"
                    color = "red"
                }
                gazes.push({
                    user: gaze.user,
                    time: gaze.Timestamp - startTime,
                    duration: gaze.FixationDuration,
                    color: color,
                    aoiCoords: aoiCoords,
                });
            });
        });

        // Create scalers for horizontal and vertical alignment
        let xScale = d3.scaleLinear()
                    .domain([0, highestDuration])
                    .range([0, containerWidth])
        let yScale = d3.scalePoint()
                    .domain(users)
                    .range([0, (users.length - 1) * timelineHeight])

        // Set width and height for the axes
        let yAxisWidth = 32
        let xAxisHeight = 16

        // Set dimensions of the timelines svg and set rendering
        timelines.html("");
        timelines.attr("viewBox", [-yAxisWidth, 0, containerWidth + yAxisWidth, timelineHeight * users.length + xAxisHeight])
        timelines.attr("shape-rendering", "crispEdges")

        // Pop-up box
        let info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

        // function to get only the numbers in the rgb color definition
        function colorcoding(colorcode) {
            if (colorcode != undefined) {
                var numbers = ["0","1","2","3","4","5","6","7","8","9"]
                var colornumber = "";
                for (var i=0; i < colorcode.length; i++) {
                    if (numbers.includes(colorcode.charAt(i))) {
                        colornumber = colornumber + colorcode.charAt(i)
                    }
                }
                return colornumber;
            }
        }

        // Add gazes to the svg
        timelines.selectAll("rect")
            .data(gazes)
            .enter().append("rect")
                .attr("fill", gaze => {
                    return gaze.color;
                })
                .attr("x", gaze => {
                    return xScale(gaze.time);
                })
                .attr("y", gaze => {
                    return yScale(gaze.user);
                })
                .attr("width", gaze => {
                    return xScale(gaze.duration);
                })
                .attr("height", timelineHeight)
                // give each rect a class based on numbers in rgb color
                .attr("class", gaze => {
                    return "scarf rgb" + colorcoding(gaze.color);
                })
                .on("mouseover", gaze => {
                    info.transition().duration(200).style("opacity", 1)
                    info.html(
                        "Start time: " + gaze.time + "ms" + "<br>" +
                        "Duration: " + gaze.duration + "ms" + "<br>" +
                        "User: " + gaze.user + "<br>" +
                        "AOI coords: " + gaze.aoiCoords
                    )
                    info.style("left", d3.event.pageX + 8 + "px")
                    info.style("top", d3.event.pageY - 48 + "px")
                    if (gaze.color != undefined) {
                        // get numbers in rgb color
                        var colornumber = colorcoding(gaze.color)
                        // all AOI's decrease in opacity
                        d3.selectAll(".scarf").attr("opacity", 0.2)
                        d3.selectAll(".river").attr("opacity", 0.2)
                        // full opacity for hovered-over AOI (found via color number)
                        // stroke for grid
                        d3.selectAll(".rgb" + colornumber).attr("opacity", 1)
                        d3.selectAll(".aoirgb" + colornumber).attr("stroke", () => {
                            if (colornumber == "352327") return "white"
                            else return "black"
                        })
                        .attr("stroke-width", "8px")
                    }
                })
                .on("mousemove", () => {
                    info.style("left", d3.event.pageX + 8 + "px")
                    info.style("top", d3.event.pageY - 48 + "px")
                })
                .on("mouseout", () => {
                    info.transition().duration(200).style("opacity", 0)
                    // opacity and stroke back to normal
                    d3.selectAll(".scarf").attr("opacity",1)
                    d3.selectAll(".river").attr("opacity",1)
                    d3.selectAll(".aoi").attr("stroke", "null")
                })

        // Add y-axis for users
        timelines.append("g")
            .attr("transform", `translate(0, ${0.5 * timelineHeight})`)
            .call(d3.axisLeft(yScale))

        // Add x-axis for time
        timelines.append("g")
            .attr("transform", `translate(0, ${timelineHeight * users.length})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
    }
}
