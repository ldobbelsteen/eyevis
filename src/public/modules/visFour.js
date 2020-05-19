var filteredData;
var scaledData;
var userMenu = $("#vis-four #user-menu");
var selectedUser;
var svg;
var margin = {top: 30, right: 30, bottom: 10, left: 40}
var classicGradient = ["rgba(59, 232, 255, 0.2)", "rgb(249, 255, 84,0.2)",  "rgba(255, 167, 66, 0.2)","rgb(232, 14, 14,0.2)","rgb(201, 14, 14, 0.2)"]


function updateUsers() {
    userMenu.empty();
    userMenu.append($("<option selected disabled>---</option>"));
    let uniqueUsers = [...new Set(filteredData.map((item) => item.user))];
    uniqueUsers.sort().forEach((user) => {
        userMenu.append($("<option></option>").text(user));
    });
    console.log('update users')
}

function userOn() {
    userMenu.on("change", () => {
        console.log('menu change')
        d3.select("#visualization").html("");
        selectedUser = userMenu.val();
        console.log(selectedUser);
        if (selectedUser === "---") {
            selectedUser = undefined;
        }
        updateData();
        visualize();
    });
}

function userOff() {
    userMenu.off("change")
}

function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: selectedUser,
    }
    filteredData = window.data.filter((item) => {
        item.value = item["FixationDuration"];
        item.x = item["MappedFixationPointX"];
        item.y = item["MappedFixationPointY"];
        for (let key in filter) {
            if (filter[key] === undefined) {
                continue;
            }
            if (item[key] != filter[key]) {
                return false;
            }
        }
        if (item["value"] < 0) return false;
        if (item["x"] < 0) return false;
        if (item["y"] < 0) return false;
        return true;
    });
    console.log(filteredData) 
}

export function initialize() {
    console.log('initializing')
    selectedUser = undefined;
    updateData();
    updateUsers();
    userOn();
    $("#stimuli-menu").on("change", () => {
        userOff();
    })
}

function scaleData(data) {
    console.log('scale data')
    scaledData = JSON.parse(JSON.stringify(data));
    scaledData.forEach( function (item) {
        var number = item.value
        for ( var n = 0; n < number; n++) {
            scaledData.push(
                {
                    x: item.x,
                    y: item.y,
                    user: item.user
                }
            )
        }
    });
}

export function visualize() {
    // turns off user menu
    userOff();

    // gets data ready
    scaleData(filteredData);

    // gets container ready
    d3.select("#visualization").html("");
    document.getElementById('visualization').style.position = 'relative'
    svg = undefined;

    // prepares image, used as a means to scale vis thanks to onload function
    var img = new Image();
    function loadImg() {
        console.log('load vis')
        var ratio = ($("#main").width()) / this.width;
        var containerW = $("#main").width();
        var containerH = this.height * ratio;
        img.height = this.height * ratio;
        img.width = $("#main").width();
        svg = d3.select("#visualization")
                .append("svg")
                    .attr("width", containerW)
                    .attr("height", containerH)
                .append("g")
            
            // x coordinates
            var x = d3.scaleLinear()
                        .domain([0, img.naturalWidth])
                        .range([ 0, img.width ]); 

            // y coordinates
            var y = d3.scaleLinear()
                        .domain([img.naturalHeight, 0])
                        .range([ img.height , margin.top ])
                        
            // compute the density data
            var densityData = d3.contourDensity()
                                .x(function(d) { return x(d.x); })
                                .y(function(d) { return y(d.y); })
                                .size([img.width, img.height])
                                .bandwidth(14)
                                (scaledData)
                                // you need to set your own thresholds to get the fixation point legend

            function minMax() {
                var max = 0
                var min = Infinity
                densityData.forEach(function (item) {
                    if (item.value > max) max = item.value;
                    if (item.value < min) min = item.value;
                })
                return [min,max];
            }
            var minMax = minMax()

            var interval = (minMax[1] - minMax[0]) / 5;
            var colorDomain = [minMax[0], minMax[0]+interval, minMax[0]+2*interval, minMax[0]+3*interval, minMax[1] + 1 ]

            // color palette
            var color = d3.scaleLinear()
                            .domain(colorDomain)   
                            .range(classicGradient)

            // inserts heatmap and image + zoom
            svg.insert("g", "g")
                .selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", function(d) { return color(d.value); })
            svg.insert("image", ":first-child")
                .attr("width", img.width)
                .attr("height", img.height)
                .attr("xlink:href", `/stimuli/${window.stimulus}`)
                .attr("class", "img")
            d3.select("#visualization").call(d3.zoom().on("zoom", function () {
                svg.attr("transform", d3.event.transform)
            }))

            svg.attr('display', 'block')
            svg.attr('margin-left', 'auto')
        
        // re-activates user menu
        setTimeout(userOn(), 10)
    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }
    img.onload = loadImg;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`

}
