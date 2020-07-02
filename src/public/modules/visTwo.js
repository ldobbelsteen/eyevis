// Tristan Tummers 1330713 - Sankey diagram
var filteredData;

// Select visualization container
const container = d3.select("#vis2");

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

// ---> Chiara Liotta (1414755): AOI highlight linking
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
// --- end of Chiara's part

export function initialize() {
    updateData();
}

export function visualize() {
    const gridSizeInputX = $("#vis-aoi input:eq(0)");
    const gridSizeInputY = $("#vis-aoi input:eq(1)");
    const colorInput = $("#colorType");

    // Reset visualization container
    container.html("");

    // Create SVG for stimulus and sankey sankeydiagram
    let sankeyDiagram = container.append("svg");
    // let stimulus = container.append("svg");

    sankeyDiagram.style("margin", "0.5em");

    // Add stimulus img
    let containerWidth = $("main").width();
    let containerHeight;
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;

        containerHeight = 0.7 * containerWidth;
        sankeyDiagram.attr("viewBox", [0, 0, containerWidth, containerHeight]);
        gridSizeInputX.on("change", updateSankey);
        gridSizeInputY.on("change", updateSankey);
        colorInput.on("change", updateSankey)
        updateSankey();
    }
    image.src = stimulusLink;
    image.onerror = () => {
        console.log("Image failed!");
    }

    function updateSankey() {
        // Pop-up info box
        let info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);

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
        let colors;
        let selectedColorset =  colorInput.val();
        switch(selectedColorset) {
            case undefined:
                colors = d3.interpolateTurbo;
                break;
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

        // Reset graph
        let data = {"nodes": [], "links": []};

        sankeyData.forEach((d) => {
            data.nodes.push({"name": d.source});
            data.nodes.push({"name": d.target});
            data.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value
            });
        });

        // Set the graph nodes and links good according to the properties the diagram will take
        data.nodes = d3.keys(d3.nest().key((d) => {return d.name;}).object(data.nodes));

        data.links.forEach((d, i) => {
            data.links[i].source = data.nodes.indexOf(String(data.links[i].source));
            data.links[i].target = data.nodes.indexOf(String(data.links[i].target));
        });

        data.nodes.forEach((d, i) => {
            data.nodes[i] = {"name": d};
        });

        // Reset sankey diagram
        sankeyDiagram.html("");

        // Set Sankey diagram propertie
        let graph = d3.sankey()
            .nodes(data.nodes)
            .links(data.links)
            .nodeWidth(48)
            .nodePadding(10)
            .size([containerWidth -100, containerHeight/2])
            .sinksRight(true)
            .layout(5);

        // get color for node
        var color_node = (d) => {
            return colors(interval * (parseInt(d.name)-1));
        }

        let path = graph.link();

        // add in the links
        let link = sankeyDiagram.append("g")
            // .attr("transform", `translate(${0.05 * containerWidth}, ${0.25 * containerHeight})`)
            .selectAll(".link")
            .data(graph.links())
            .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", path)
                .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                .style("fill", "none")
                .style("stroke", "black")
                .style("stroke-opacity", "0.2")
                .on("mouseover", (d) => {
                    info.transition().duration(200).style("opacity", 1);
                    info.html(
                        "Source AOI: " + d.source.name + "<br>" +
                        "Target AOI: " + d.target.name + "<br>" +
                        "Amount transitions: " + d.value
                    );
                    info.style("left", d3.event.pageX + 8 + "px");
                    info.style("top", d3.event.pageY + "px");

                    this.parentNode.style("stroke-opacity", 0.5);
                })
                .on("mousemove", () => {
                    info.style("left", d3.event.pageX + 8 + "px")
                    info.style("top", d3.event.pageY - 48 + "px")
                })
                .on("mouseout", () => {
                    info.transition().duration(200).style("opacity", 0)
                })
                .sort(function(a, b) { return b.dy - a.dy; });

        // add in the nodes
        let node = sankeyDiagram.append("g")
            // .attr("transform", `translate( ${0.05 * containerWidth}, ${0.25 * containerHeight})`)
            .selectAll(".node")
            .data(graph.nodes())
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .call(d3.drag()
                    .subject(function(d) { return d; })
                    .on("start", function() { this.parentNode.appendChild(this); })
                    .on("drag", dragmove));

        // add the rectangles for the nodes
        node
            .append("rect")
                .attr("height", function(d) { return d.dy; })
                .attr("width", graph.nodeWidth())
                .style("fill", function(d) { return d.color = color_node(d); })
                .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
                .attr("class", (d) => {
                    return "sankey rgb" + colorcoding(d.color);
                })
                .on("mouseover", (d) => {
                    info.transition().duration(200).style("opacity", 0);
                    // ---> Chiara Liotta (1414755): AOI highlight linking
                    if (d.color != undefined) {
                        // get numbers in rgb color
                        var colornumber = colorcoding(d.color)
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
                    // --- end of Chiara's part
                })
                .on("mouseout", (d) => {
                    // ---> Chiara Liotta (1414755): AOI highlight linking
                    // opacity and stroke back to normal
                    d3.selectAll(".scarf").attr("opacity",1)
                    d3.selectAll(".river").attr("opacity",1)
                    d3.selectAll(".aoi").attr("stroke", "null")
                    // ---> end of Chiara's part
                });

        // add in the title for the nodes
        node
            .append("text")
                .attr("x", -6)
                .attr("y", function(d) { return d.dy / 2; })
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .attr("transform", null)
                .attr("font-size", "2.5em")
                .attr("fill", "black")
                .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < containerWidth / 2; })
                .attr("x", 6 + graph.nodeWidth())
                .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
                .attr("transform",
                    "translate("
                        + d.x + ","
                        + (d.y = Math.max(
                          0, Math.min(containerHeight - d.dy, d3.event.y))
                        ) + ")");
            graph.relayout();
            link.attr("d", graph.link() );
      }
    }
}
