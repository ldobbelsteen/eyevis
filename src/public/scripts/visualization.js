function visualize(dataset, stimulus) {
    Papa.parse("/data/datasets/" + dataset, {
        download: true,
        header: true,
        complete: (result) => { 
            var data = result.data.filter(
                (value) => value.StimuliName == stimulus
            )
            var stim = new Image()
            var info = d3
                .select("body")
                .append("div")
                .attr("class", "info")
                .style("opacity", 0)
            
            stim.onload = () => {
                d3.select("#visualization")
                    .append("svg")
                    .attr("width", stim.width)
                    .attr("height", stim.height)
                    .style("background-image", `url(${stim.src})`)
                    .append("g")
                    .selectAll("dot")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", (row) => row.MappedFixationPointX)
                    .attr("cy", (row) => row.MappedFixationPointY)
                    .attr("r", 10)
                    .style("fill", "steelblue")
                    .on("mouseover", function (data) {
                        info.transition().duration(200).style("opacity", "1")
                        info.html(
                            "x: " + data.MappedFixationPointX + "<br>" +
                            "y: " + data.MappedFixationPointY + "<br>" +
                            "User: " + data.user
                        )
                        info.style("left", d3.event.pageX + 8 + "px");
                        info.style("top", d3.event.pageY - 80 + "px");
                    })
                    .on("mouseout", function (data) {
                        info.transition().duration(200).style("opacity", 0);
                    })
            }
            stim.src = "/data/stimuli/" + stimulus
        }
    })
}

// Use the global dataset and the stimulus to visualize the data
function visualize(stimulus) {
    var filteredData = data.filter((value) => value.StimuliName == stimulus) // Filter data to stimulus
    var stim = new Image() // Create image object for the stimulus
    stim.onload = () => { // Run this once the image has loaded
        var info = d3 // Info box
            .select("body")
            .append("div")
            .attr("class", "info")
            .style("opacity", 0)
        d3.select("#visualization").selectAll("*").remove() // Clear any previous visualization
        d3.select("#visualization") // Actually do the visualization
            .append("svg")
            .attr("width", stim.width)
            .attr("height", stim.height)
            .style("background-image", `url(${stim.src})`)
            .append("g")
            .selectAll("dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", (row) => row.MappedFixationPointX)
            .attr("cy", (row) => row.MappedFixationPointY)
            .attr("r", 10)
            .style("fill", "steelblue")
            .on("mouseover", function (data) { // Show info box when mouse over
                info.transition().duration(200).style("opacity", "1")
                info.html(
                    "x: " + data.MappedFixationPointX + "<br>" +
                    "y: " + data.MappedFixationPointY + "<br>" +
                    "User: " + data.user
                )
                info.style("left", d3.event.pageX + 8 + "px");
                info.style("top", d3.event.pageY - 80 + "px");
            })
            .on("mouseout", function (data) { // Hide info box when mouse out
                info.transition().duration(200).style("opacity", 0);
            })
    }
    stim.src = "/data/stimuli/" + stimulus // Load the image
}