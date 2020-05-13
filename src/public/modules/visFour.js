var filteredData;
var scaledData;
var stimuliMenu = $("#vis-four #stimuli-menu");
var selectedStimulus;
var userMenu = $("#vis-four #user-menu");
var selectedUser;
var heatmap;
var config = {
    container: document.getElementById('visualization'),
    xField: "MappedFixationPointX",
    yField: "MappedFixationPointY",
    valueField: "FixationDuration"
};

//  **this does NOT work properly yet**

//it works properly for individual users
//data too heavy for all users, need to find a way to deal with it faster


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
        user: selectedUser,
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
        if (item["FixationDuration"] < 0) return false;
        return true;
    });
}

function scaleData(data, ratio) {
    scaledData = JSON.parse(JSON.stringify(data));
    scaledData.forEach( function (item) {
        item["MappedFixationPointX"] = Math.round(item["MappedFixationPointX"] * ratio);
        item["MappedFixationPointY"] = Math.round(item["MappedFixationPointY"] * ratio);
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
        visualizeUser();
    });
}

export function visualize() {
    document.getElementById('visualization').innerHTML = "";
    var img = new Image();
    function getWidthAndHeight() {
        var ratio = ($("#main").width() - 10)  / this.width;
        img.height = this.height * ratio;
        img.width = $("#main").width() - 10;
        alert("heapmaps do not work for all users together yet. try to select a single user")
    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }
    img.onload = getWidthAndHeight;
    img.onerror = loadFailure;
    img.src = `/stimuli/${selectedStimulus}`;
    document.getElementById('visualization').appendChild(img);
}

function createOverlay() {
    heatmap = h337.create(config);
    heatmap.addData(scaledData);
}

function visualizeUser() {
    document.getElementById('visualization').innerHTML = "";
    var img = new Image();
    function getWidthAndHeight() {
        var ratio = ($("#main").width() - 10 ) / this.width;
        img.height = this.height * ratio;
        img.width = $("#main").width() - 10;
        scaleData(filteredData, ratio);
    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }
    img.onload = getWidthAndHeight;
    img.onerror = loadFailure;
    img.src = `/stimuli/${selectedStimulus}`;
    document.getElementById('visualization').appendChild(img);
    setTimeout(createOverlay, 50);
}
