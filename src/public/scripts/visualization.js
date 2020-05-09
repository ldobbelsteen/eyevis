// Global data variable
var SelectedStimuli;
var data;

// List datasets and add them to the dropdown menu once the page has loaded
// When an entry of the menu is selected, load and process the dataset
window.onload = () => {
    let menu = $("#datasetsMenu");
    menu.empty(); // Empty any previous entries
    menu.append($("<option>Loading datasets...</option>")); // Add simple loading text
    $.get("/datasets", (list) => {
        // Fetch list of datasets
        menu.empty(); // Empty loading text
        menu.append(
            $(
                "<option disabled selected value> -- select a dataset -- </option>"
            )
        ); // Default entry
        list.forEach((element) => {
            // Add datasets to menu
            menu.append(
                $(`<option value = '${element}'></option>`).text(element)
            );
        });
    });
    menu.on("change", () => {
        // Load dataset when one has been selected
        let selected = $("#datasetsMenu")[0].value;
        console.log(selected);

        datasetListener(selected);
    });
};

// Fetch dataset and put it into the global data variable
// Also put all the stimuli in the dropdown menu
function datasetListener(dataset) {
    var menu = $("#stimuliMenu");
    menu.empty(); // Empty any previous entries
    menu.append($("<option>Loading stimuli...</option>")); // Add simple loading text
    Papa.parse("/datasets/" + dataset, {
        // Download and parse the dataset
        download: true,
        header: true,
        complete: (result) => {
            data = result.data; // Write result to the global data variable
            setPersonChangeListener(data); //set listener for user
            var uniqueStimuli = [
                ...new Set(data.map((item) => item.StimuliName)),
            ]; // List all unique stimuli
            menu.empty(); // Empty loading text
            menu.append(
                $(
                    "<option disabled selected value> -- select a stimulus -- </option>"
                )
            ); // Default entry
            uniqueStimuli.forEach((element) => {
                // Add them to the stimuli menu
                $("#stimuliMenu").append(
                    `<option  value="${element}">${element}</option>`
                );
            });
        },
    });

    menu.on("change", () => {
        // Visualize when stimulus has been selected
        var selected = $("#stimuliMenu")[0].value;
        SelectedStimuli = selected;

        $("#person-dropdown").empty();
        let filteredData = data.filter(
            (value) => value.StimuliName == SelectedStimuli
        );
        let uniqueUsers = [...new Set(filteredData.map((item) => item.user))];

        $("#person-dropdown").append(
            `<option  value="banana"> All users</option>`
        );
        uniqueUsers.forEach((user) => {
            $("#person-dropdown").append(
                `<option  value="${user}"> ${user}</option>`
            );
        });
        drawStuff(filteredData);
    });
}

function drawStuff(filteredData) {
    //ADDS INVISIBLE DIV WHICH WILL BE USED TO OUTPUT EXTRA INFO FOR EACH POINT
    let img = new Image();
    img.onload = function () {
        d3.selectAll("#visualization svg")
            .attr("width", this.width)
            .attr("height", this.height);
    };
    img.src = `/stimuli/${SelectedStimuli}`;
    var info = d3
        .select("body")
        .append("div")
        .attr("class", "output")
        .style("opacity", 0);

    //DATA OF COPY TO BE USED IN CLICK LISTENER

    d3.selectAll("#visualization svg").selectAll("g").remove();
    d3.selectAll("#visualization svg")
        .style("background-image", `url("/stimuli/${SelectedStimuli}")`)
        .append("g")
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", (row) => row.MappedFixationPointX)
        .attr("cy", (row) => row.MappedFixationPointY)
        .attr("r", 10)
        .style("fill", "steelblue")
        .on("mouseover", function (filteredData) {
            info.transition().duration(200).style("opacity", "1");
            info.html(
                "x: " +
                    filteredData.MappedFixationPointX +
                    "<br>" +
                    "y:" +
                    filteredData.MappedFixationPointY +
                    "<br>" +
                    "User: " +
                    filteredData.user
            );
            info.style("left", d3.event.pageX + 8 + "px");
            info.style("top", d3.event.pageY - 80 + "px");
        })
        .on("mouseout", function (filteredData) {
            info.transition().duration(200).style("opacity", 0);
        });
}
function setPersonChangeListener(data) {
    $("#person-dropdown").on("change", function () {
        console.log("I change stuff");
        let filteredData = data.filter((value) => {
            if ($(this)[0].value != "banana")
                return (
                    value.user == $(this)[0].value &&
                    value.StimuliName == SelectedStimuli
                );
            else return value.StimuliName == SelectedStimuli;
        });
        drawStuff(filteredData);
    });
}
