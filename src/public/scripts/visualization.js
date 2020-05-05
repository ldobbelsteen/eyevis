function visualize(dataset, stimulus) {
    Papa.parse("/data/datasets/" + dataset, {
        download: true,
        header: true,
        complete: (result) => { 
            var data = result.data.filter(
                (value) => value.StimuliName == stimulus
            )
            var stim = new Image()
            
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
            }
            stim.src = "/data/stimuli/" + stimulus
        }
    })
}

visualize("metro", "03b_Bordeaux_S2.jpg")