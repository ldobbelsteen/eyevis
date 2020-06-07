// Tristan Tummers 1330713 - Sankey diagram

var filteredData;

// Select visualization container and inputs
const container = d3.select("#visualization");
const gridSizeInputX = $("#vis-two input:eq(0)");
const gridSizeInputY = $("#vis-two input:eq(1)");

// Filter data with filter (stimuli)
function updateData() {
    let filter = {
        StimuliName: window.stimulus,
    };

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

function compare(a, b) {
    return a.Timestamp - b.Timestamp;
}

export function initialize() {
    updateData();
}

export function visualize() {

    // Reset visualization container
    container.html("");

    // Create SVG for stimulus and sankey sankeydiagram
    let stimulus = container.append("svg");
    let sankeyDiagram = container.append("svg");

    // Add stimulus img
    let containerWidth = parseInt(container.style("width"));
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
        gridSizeInputX.on("change", updateSankey);
        gridSizeInputY.on("change", updateSankey);
        console.log("F");
        updateSankey();
    }
    image.scr = stimulusLink;
    image.onerror = function() {console.log("Image failed!");};

    function updateSankey() {

        // Get input values selected by user
        let gridSizeX = gridSizeInputX.val();
        let gridSizeY = gridSizeInputY.val();

        // Array of AOI objects
        let AOIs = []

        // Calculate width and height of AOIs
        let AOIsizeX = stimulusWidth / gridSizeX;
        let AOIsizeY = stimulusHeight / gridSizeY;

        // Add the AOIs to the array
        let iOfAOI = 0;
        for (let x = 0; x < gridSizeX; x++) {
            iOfAOI++;
            for (let y = 0; y < gridSizeY; y++) {
                iOfAOI++;
                AOIs.push({
                    id: iOfAOI,
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1)
                });
            }
        }

        // Assign colors to each AOI
        let colors = d3.interpolateTurbo;
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
        });

        // Assign fixations to areas of interest
        let gazeAOIs = [];
        filteredData.forEach(gaze => {
            let x = gaze.MappedFixationPointX;
            let y = gaze.MappedFixationPointY;

            AOIs.forEach(aoi => {
                if (x >= aoi.x1 && x <= aoi.x2 && y >= aoi.y1 && y <= aoi.y2) {
                    gazeAOIs.push({
                        timestamp: gaze.Timestamp,
                        user: gaze.user,
                        aoi: aoi
                    });
                }
            })
        });

        // Create an array of transistions between the AOIs
        let transistions = [];
        let users = [...new Set(filterData.map((item) => item.user))];
        users.forEach((user) => {
            let userData = filterData(gazeAOIs, {
                user: user
            });

            let sortedData = userData.sort(compare);

            for (let i = 0; i < sortedData.length; i++) {
                let source = sortedData[i].aoi;
                let target = sortedData[i+1].aoi;

                if (target != source) {
                    transistions.push({
                        source: source,
                        target: target,
                    });
                }
            }
        });

        // Get sankeyData data
        let sankeyData = [];
        transistions.forEach((trans) => {
            let alreadyIn = [];
            if (trans in alreadyIn) {
                sankeyData.forEach((finalTrans) => {
                    if (trans.source == finalTrans.source && trans.target == finalTrans.target) {
                        finalTrans.value +=1;
                    }
                });
            } else {
                sankeyData.push({
                    source: trans.source,
                    target: trans.target,
                    value: 1
                });
                alreadyIn.push(trans);
            }
        });

        // Reset sankey diagram
        sankeyDiagram.html("");

        // Set Sankey diagram properties
        let sankey = d3.sankey()(sankeyData);

        let path = sankey.link();
    }
}
