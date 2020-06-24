// Lukas Dobbelsteen (1406264) - AOI Color Grid

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

export function visualize() {

    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-aoi input:eq(0)");
    const gridSizeInputY = $("#vis-aoi input:eq(1)");
    const colorInput = $("#colorType");
    const container = d3.select("#aoi");

    // Empty the container
    container.html("");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus
    });

    // Get the container width and set desired timeline height
    let containerWidth = $("main").width();

    // Create svg for the stimulus
    let stimulus = container.append("svg");

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
        gridSizeInputX.on("change", updateAOI);
        gridSizeInputY.on("change", updateAOI);
        colorInput.on("change", updateAOI);
        updateAOI();
    }
    image.src = stimulusLink;

    function updateAOI() {

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

        // Overlay the AOIs over the stimulus
        stimulus.selectAll("rect").remove()
        let viewBox = stimulus.attr("viewBox").split(",");
        let aoiScaleX = viewBox[2] / stimulusWidth;
        let aoiScaleY = viewBox[3] / stimulusHeight;
        AOIs.forEach(aoi => {
            stimulus.append("rect")
                .attr("x", aoi.x1 * aoiScaleX)
                .attr("y", aoi.y1 * aoiScaleY)
                .attr("width", (aoi.x2 - aoi.x1) * aoiScaleX)
                .attr("height", (aoi.y2 - aoi.y1) * aoiScaleY)
                .attr("fill", aoi.color)
                .attr("opacity", 0.7)
                .on("mouseover", () => {
                    info.transition().duration(200).style("opacity", 1)
                    info.html(
                        "AOI coords: " + (aoi.x + 1) + "," + (aoi.y + 1)
                    )
                    info.style("left", d3.event.pageX + 8 + "px")
                    info.style("top", d3.event.pageY - 48 + "px")
                })
                .on("mousemove", () => {
                    info.style("left", d3.event.pageX + 8 + "px")
                    info.style("top", d3.event.pageY - 48 + "px")
                })
                .on("mouseout", () => {
                    info.transition().duration(200).style("opacity", 0)
                })
        });

        // Pop-up box
        let info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);
    }
}