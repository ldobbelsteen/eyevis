// Global variable for all the data of the current dataset
var data

// List datasets and add them to the dropdown menu once the page has loaded
// When an entry of the menu is selected, load and process the dataset
window.onload = () => {
    $.get("/datasets", (list) => { // Fetch list of datasets
        var menu = $("#datasetsMenu") // Select menu
        menu.empty() // Empty any previous entries
        menu.append($("<option disabled selected value> -- select a dataset -- </option>")) // Default entry
        list.forEach((element) => { // Add datasets to menu
            menu.append($("<option></option>").text(element))
        })
        menu.on("change", () => { // Load dataset when one has been selected
            var selected = menu.children("option").filter(":selected").text()
            fetchDataset(selected)
        })
    })
}

// Fetch dataset and put it into the global data variable
// Also put all the stimuli in the dropdown menu
function fetchDataset(dataset) {
    Papa.parse("/data/datasets/" + dataset, { // Download and parse the dataset
        download: true,
        header: true,
        complete: (result) => {
            data = result.data // Write result to the global data variable
            var menu = $("#stimuliMenu") // Select menu
            menu.empty() // Empty any previous entries
            menu.append($("<option disabled selected value> -- select a stimulus -- </option>")) // Default entry
            var uniqueStimuli = [...new Set(data.map(item => item.StimuliName))] // List all unique stimuli
            uniqueStimuli.forEach((element) => { // Add them to the stimuli menu
                menu.append($("<option></option>").text(element))
            })
            menu.on("change", () => { // Visualize when stimulus has been selected
                var selected = menu.children("option").filter(":selected").text()
                visualize(selected)
            })
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