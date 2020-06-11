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
    let sankeyDiagram = container.append("svg");
    let stimulus = container.append("svg");

    // Add stimulus img
    let containerWidth = $("main").width();
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
        updateSankey();
    }
    image.src = stimulusLink;
    image.onerror = () => {
        console.log("Image failed!");
    }

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

        console.log(AOIs);

        // Overlay the AOIs over the stimulus
        stimulus.selectAll("rect").remove();
        stimulus.selectAll("text").remove();
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
                .attr("opacity", 0.7);
            stimulus.append("text")
                .attr("x", aoi.x1 * aoiScaleX + 10)
                .attr("y", aoi.y1 * aoiScaleY + 10)
                .attr("dy", ".35em")
                .text(aoi.id);
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
                        aoi: aoi.id
                    });
                }
            })
        });

        // Create an array of transistions between the AOIs
        let transistions = [];
        let users = [...new Set(filteredData.map((item) => item.user))];
        users.forEach((user) => {
            let userData = filterData(gazeAOIs, {
                user: user
            });

            let sortedData = userData.sort(compare);

            for (let i = 0; i < sortedData.length -1; i++) {
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

            let finalTrans = sankeyData.find((element) => {return element.source === trans.source && element.target === trans.target;});

            if (finalTrans === undefined) {
                sankeyData.push({
                    source: trans.source,
                    target: trans.target,
                    value: 1
                });
            } else {
                finalTrans.value += 1;
            }
        });

        // Reset sankey diagram
        sankeyDiagram.html("");

        // Set Sankey diagram properties
        let diagram = d3.sankey()
            .nodeWidth(36)
            .nodePaddign(12);

        // Reset graph
        let graph = {"nodes": [], "links": []};

        sankeyData.forEach((d) => {
            graph.nodes.push({"name": d.source});
            graph.nodes.push({"name": d.target});
            graph.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value
            });
        });

        // Set the graph nodes and links good according to the properties the diagram will take
        graph.nodes = d3.keys(d3.nest().key((d) => {return d.name;}).object(graph.nodes));

        console.log(graph.nodes);

        graph.links.forEach((d, i) => {
            console.log(d);
            graph.links[i].source = graph.nodes.indexOf(String(graph.links[i].source));
            graph.links[i].target = graph.nodes.indexOf(String(graph.links[i].target));
        });

        graph.nodes.forEach((d, i) => {
            graph.nodes[i] = {"name": d};
        });

        console.log(graph);

        diagram.update(graph);



        // let diagram = sankey(graph);

        let path = sankey.links();

        console.log(path);

        // add links
        let link = sankeyDiagram.append("g")
                .selectAll(".link")
                .data(graph.links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", sankey.link() )
                .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                .sort(function(a, b) { return b.dy - a.dy; });

        // add nodes
        var node = sankeyDiagram.append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

        node.append("rect")
            .attr("height", (d) => {return d.dy;})
            .attr("width", sankey.nodeWidth)
            //.style("fill", (d) => { d.color = color(d.name.replace(/ .*/, "")); return d.color; })
            .style("stroke",(d) => {return d3.rgb(d.color).darker(2);});
    }
}
