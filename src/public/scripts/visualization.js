var dataset = "metro"
var stimuli = "03b_Bordeaux_S2.jpg"

// Download csv file and convert to json
Papa.parse("/data/datasets/" + dataset, {
    download: true,
    header: true,
    complete: (results) => {
        var filteredData = results.data.filter(
            (value) => value.StimuliName == stimuli // Take data of single stimulus
        )
        var img = new Image() // Create stimulus image variable
        img.onload = () => { // When the image has loaded, render the eyetracking data over it
            d3.selectAll("#visualization")
                .append("svg")
                .attr("width", img.width)
               .attr("height", img.height)
                .style("background-image", `url(${img.src})`)
                .append("g")
                .selectAll("dot")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", (row) => row.MappedFixationPointX)
                .attr("cy", (row) => row.MappedFixationPointY)
                .attr("r", 10)
                .style("fill", "steelblue")
        }
        img.src = "/data/stimuli/" + stimuli // Load the image
    }
})