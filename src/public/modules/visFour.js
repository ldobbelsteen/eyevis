var filteredData;
var scaledData;
var userMenu = $("#vis-four #user-menu");
var selectedUser;
var colorDomain;
var svg;
var margin = {top: 10, right: 30, bottom: 30, left: 40}


function updateUsers() {
    //userMenu.empty();
    userMenu.append($("<option selected disabled>---</option>"));
    let uniqueUsers = [...new Set(filteredData.map((item) => item.user))];
    uniqueUsers.sort().forEach((user) => {
        userMenu.append($("<option></option>").text(user));
    });
    console.log('update users')
}

function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: selectedUser
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
    if (selectedUser == undefined) {
        colorDomain = [0,10]
    } else {
        colorDomain = [0,0.8]
    }
}

export function initialize() {
    console.log('initializing')
    $('#vis-four #user-menu').prop('disabled', false);
    selectedUser = undefined;
    updateData();
    scaleData(filteredData);
    updateUsers();
    userMenu.on("change", () => {
        console.log('menu change')
        selectedUser = userMenu.val();
        if (selectedUser === "All users") {
            selectedUser = undefined;
        }
        updateData();

        visualize();
    });
    $("#stimuli-menu").on("change", () => {
        console.log('off')
        userMenu.off("change")
    });
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
                    y: item.y
                }
            )
        }
    });
}

export function visualize() {
    console.log('start vis')
    d3.select("#visualization").html("");
    document.getElementById('visualization').style.position = 'relative'
    svg = undefined;
    var img = new Image();
    function loadImg() {
        console.log('load vis')
        var ratio = ($("#main").width() - 10 ) / this.width;
        img.height = this.height * ratio - 10 - 2 *  margin.top - 2 * margin.bottom;
        img.width = $("#main").width() - 10 - 2 * margin.left - 2 * margin.right;
        svg = d3.select("#visualization")
                .append("svg")
                    .attr("width", img.width + margin.left + margin.right)
                    .attr("height", img.height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
        
            //add X axis
            var x = d3.scaleLinear()
                        .domain([0, img.naturalWidth])
                        .range([ margin.left, img.width + margin.right + 5]);
                    svg.append("g")
                        .attr("transform", "translate(0," + img.height  + ")")
                        .call(d3.axisBottom(x));

            // Add Y axis
            var y = d3.scaleLinear()
                        .domain([img.naturalHeight, 0])
                        .range([ img.height , margin.top ]);
                    svg.append("g")
                        .attr("transform", "translate(" + margin.left  + ", 0)")
                        .call(d3.axisLeft(y));

            // Prepare a color palette
            var color = d3.scaleLinear()
                            .domain( colorDomain)     // Points per square pixel.
                            .range(["rgba(11, 216, 219, 0.1)", "rgba(219, 11, 73, 1)"])

            // compute the density data
            var densityData = d3.contourDensity()
                                .x(function(d) { return x(d.x); })
                                .y(function(d) { return y(d.y); })
                                .size([img.width, img.height])
                                .bandwidth(20)
                                (scaledData)
            svg.insert("g", "g")
                .selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", function(d) { return color(d.value); })
            svg.insert("image", ":first-child")
                .attr("width", img.width)
                .attr("height", img.height)
                .attr("transform",
                        "translate(" + margin.left + "," + 5  + ")")
                .attr("xlink:href", `/stimuli/${window.stimulus}`)
                .attr("class", "img")

        
    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }
    img.onload = loadImg;
    img.onerror = loadFailure;
    console.log('end vis')
    if (svg == undefined) {
        img.src = `/stimuli/${window.stimulus}`;
    }
}
