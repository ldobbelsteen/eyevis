var filteredData;
var scaledData;
var userMenu = $("#vis-four #user-menu");
var selectedUser;
var heatmap;
var max;


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
        StimuliName: window.stimulus,
        user: selectedUser,
    }
    filteredData = window.data.filter((item) => {
        max = 0;
        item.size = 40;
        item.intensity = item["FixationDuration"];
        item.x = item["MappedFixationPointX"];
        item.y = item["MappedFixationPointY"];
        if (item["intensity"] > max)  max = item["intensity"];
        for (let key in filter) {
            if (filter[key] === undefined) {
                continue;
            }
            if (item[key] != filter[key]) {
                return false;
            }
        }
        if (item["intensity"] < 0) return false;
        if (item["x"] < 0) return false;
        if (item["y"] < 0) return false;
        return true;
    });
}

export function initialize() {
    document.getElementById('visualization').innerHTML = "";
    selectedUser = undefined;
    updateData();
    updateUsers();
    userMenu.on("change", () => {
        selectedUser = userMenu.val();
        updateData();
        visualize();
    });
}

function scaleData(data, ratio) {
    scaledData = JSON.parse(JSON.stringify(data));
    scaledData.forEach( function (item) {
        item["x"] = Math.round(item["x"] * ratio);
        item["y"] = Math.round(item["y"] * ratio);
        item["intensity"] = item["intensity"] / max;
    });
}

function createOverlay(w, h) {
    heatmap = createWebGLHeatmap({
        width: w,
        height: h
    });
    heatmap.addPoints(scaledData)
    heatmap.update()
    heatmap.blur()
    heatmap.blur()
    heatmap.blur()
    heatmap.display()
    document.getElementById('visualization').appendChild(heatmap.canvas);
    document.getElementById('visualization').style.position = 'relative'
    document.getElementsByTagName('canvas')[0].style.top = '0'
    document.getElementsByTagName('canvas')[0].style.left = '0'
    document.getElementsByTagName('canvas')[0].style.position = 'absolute'
}

export function visualize() {
    heatmap = undefined;
    document.getElementById('visualization').innerHTML = "";
    var img = new Image();
    function getWidthAndHeight() {
        var ratio = ($("#main").width() - 10 ) / this.width;
        img.height = this.height * ratio;
        img.width = $("#main").width() - 10;
        scaledData = undefined;
        if (heatmap == undefined) {
            scaleData(filteredData, ratio);
            createOverlay(img.width, img.height);
        }
    }
    function loadFailure() {
        alert( "Failed to load.");
        return true;
    }
    img.onload = getWidthAndHeight;
    img.onerror = loadFailure;
    img.src = `/stimuli/${window.stimulus}`;
    document.getElementById('visualization').appendChild(img);
}
