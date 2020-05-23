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

function randomColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

export function initialize() {}

export function visualize() {

    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-five input:eq(0)");
    const gridSizeInputY = $("#vis-five input:eq(1)");
    const container = d3.select("#visualization");

    // Empty the container
    container.html("");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus
    });

    // Get the container width and set desired timeline height
    let containerWidth = parseInt(container.style("width"));
    let timelineHeight = parseInt(container.style("font-size"));

    // Create svg for the stimulus and timelines
    let stimulus = container.append("svg");
    let timelines = container.append("svg");
    timelines.style("margin", "0.5em")

    // Add the stimulus
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;
        let img = stimulus.append("image")
            .attr("width", containerWidth)
            .attr("xlink:href", stimulusLink)
        stimulus.attr("viewBox", [0, 0, containerWidth, img.node().getBBox().height]);
        gridSizeInputX.on("change", updateTimelines);
        gridSizeInputY.on("change", updateTimelines);
        updateTimelines();
    }
    image.src = stimulusLink;

    function updateTimelines() {

        // Array of random colors
        let colors = [
            "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
            "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
            "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
            "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
            "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
            "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
            "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
            "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
            "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
            "#5be4f0", "#57c4d8", "#a4d17a", "#225b80", "#be608b", "#96b00c", "#088baf"
        ];

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
                    color: colors.pop(),
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1)
                })
            }
        }

        // Create array of gazes by cleaning up the data for each user and adding it
        let gazes = [];
        let highestDuration = 0;
        let users = [...new Set(data.map((item) => item.user))];
        users.forEach(user => {
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
                AOIs.forEach(aoi => {
                    if (x >= aoi.x1 && x <= aoi.x2 && y >= aoi.y1 && y <= aoi.y2) {
                        color = aoi.color;
                    }
                });
                gazes.push({
                    user: gaze.user,
                    time: gaze.Timestamp - startTime,
                    duration: gaze.FixationDuration,
                    color: color
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

        // Set dimensions of the timelines svg and set rendering
        timelines.html("");
        timelines.attr("viewBox", [0, 0, containerWidth, timelineHeight * users.length])
        timelines.attr("shape-rendering", "crispEdges")

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
    }
}