var filteredData;
var stimuliMenu = $("#vis-one #stimuli-menu");
var selectedStimulus;
var userMenu = $("#vis-one #user-menu");
var selectedUser;
var container = d3.select("#visualization");

function updateStimuli() {
    stimuliMenu.empty();
    stimuliMenu.append($("<option disabled selected value> -- select a stimulus -- </option>"));
    let uniqueStimuli = [...new Set(filteredData.map((item) => item.StimuliName))];
    uniqueStimuli.sort().forEach((stimulus) => {
        stimuliMenu.append($("<option></option>").text(stimulus));
    });
}

function updateUsers() {
    userMenu.empty();
    userMenu.append($("<option selected>All users</option>"));
    let uniqueUsers = [...new Set(filteredData.map((item) => item.user))];
    uniqueUsers.sort().forEach((user) => {
        userMenu.append($("<option></option>").text(user));
    });
}

function updateData() {
    var filter = {
        StimuliName: selectedStimulus,
        user: selectedUser
    }
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

export function initialize() {
    selectedStimulus = undefined;
    selectedUser = undefined;
    updateData();
    updateStimuli();
    stimuliMenu.on("change", () => {
        selectedStimulus = stimuliMenu[0].value;
        selectedUser = undefined;
        updateData();
        updateUsers();
        visualize();
    });
    userMenu.on("change", () => {
        selectedUser = userMenu[0].value;
        if (selectedUser === "All users") {
            selectedUser = undefined;
        }
        updateData();
        visualize();
    });
}

function visualize() {
    container.html("");
    container.append("svg");
    var svg = container.select("svg");
    var info = d3.select("body").append("div").attr("class", "output").style("opacity", 0);
    var imgHeight;
    var imgWidth;

    let img = new Image();
    img.onload = function () {
        imgHeight = this.height;
        imgWidth = this.width;
        svg
            .attr("width", this.width)
            .attr("height", this.height)
            .insert("image", ":first-child")
            .attr("width", imgWidth)
            .attr("height", imgHeight)
            .attr("xlink:href", `/stimuli/${selectedStimulus}`)
            .attr("class", "img");
    };
    img.src = `/stimuli/${selectedStimulus}`;

    let zoomObject = d3.zoom().on("zoom", function () {
        view.attr("transform", d3.event.transform);
        svg.selectAll("image").attr("transform", d3.event.transform);
    });

    svg.selectAll("g").remove();
    svg.selectAll(".img").remove();
    svg.call(zoomObject);

    var view = svg.append("g").attr("class", "view");
    view.selectAll("dot")
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
