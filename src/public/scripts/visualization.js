import * as visOne from "/modules/visOne.js";
import * as visTwo from "/modules/visTwo.js";
import * as visThree from "/modules/visThree.js";
import * as visAOI from "/modules/visAOI.js";
import * as visFour from "/modules/visFour.js";
import * as visFive from "/modules/visFive.js";

const datasetsMenu = $("#datasets-menu");
const stimuliMenu = $("#stimuli-menu");
const usersMenu = $("#users-menu");
const container = $("#visualization");
var data;

// Filter the full dataset according to selected values
function filterData() {
    window.data = data.filter((row) => {
        return row.StimuliName === window.stimulus && (row.user === window.user || window.user === "All users" || window.user === undefined);
    });
}

// List datasets and update the menu
function updateDatasets() {
    datasetsMenu.empty().append($("<option disabled selected value> Loading list of available datasets... </option>"));
    $.get("/datasets", (list) => {
        datasetsMenu.prop("disabled", false);
        datasetsMenu.empty().append($("<option disabled selected value> -- select a dataset -- </option>"));
        list.forEach((element) => {
            let capitalized = element[0].toUpperCase() + element.slice(1);
            datasetsMenu.append($(`<option value="${element}"></option>`).text(capitalized));
        });
    });
}

// List all of the unique stimuli and update the menu
function updateStimuli() {
    stimuliMenu.empty().append($("<option disabled selected value> Loading selected dataset... </option>"));
    d3.tsv("/datasets/" + datasetsMenu.val()).then((result) => {
        result.forEach((row) => {
            if (row.StimuliName.includes("ö")) {
                row.StimuliName = row.StimuliName.replace("ö", "�");
            }
            if (row.StimuliName.includes("ü")) {
                row.StimuliName = row.StimuliName.replace("ü", "�");
            }
        });
        data = result;
        stimuliMenu.prop("disabled", false);
        stimuliMenu.empty().append($("<option disabled selected value> -- select a stimulus -- </option>"));
        let uniqueStimuli = [...new Set(data.map((item) => item.StimuliName))];
        uniqueStimuli.sort().forEach((stimulus) => {
            let stylized = stimulus;
            stylized = stylized.split(".").slice(0, -1).join("."); // Remove file extension from stimulus name
            stylized = stylized.split("_").join(" "); // Replace underscores with spaces
            stimuliMenu.append($(`<option value="${stimulus}" ></option>`).text(stylized));
        });
    });
}

// List all of the unique users and update the menu
function updateUsers() {
    usersMenu.prop("disabled", false);
    usersMenu.empty().append($("<option selected> All users </option>"));
    let uniqueUsers = [...new Set(window.data.map((item) => item.user))];
    uniqueUsers
        .sort((a, b) => {
            return a.slice(1) - b.slice(1);
        })
        .forEach((user) => {
            usersMenu.append($("<option></option>").text(user));
        });

    const visButtons = [$("#init-vis1"), $("#init-vis2"), $("#init-vis3"), $("#init-vis5"), $("#init-aoi")];

    visButtons.forEach((d) => {
        d.prop("disabled", false);
    });

    $("#initialize").prop("disabled", false)
}

// Disable menus as they are not yet populated
datasetsMenu.prop("disabled", true);
stimuliMenu.prop("disabled", true);
usersMenu.prop("disabled", true);

window.onload = () => {
    updateDatasets();
};

datasetsMenu.on("change", () => {
    updateStimuli();
});

stimuliMenu.on("change", () => {
    window.stimulus = stimuliMenu.val();
    window.user = undefined;
    filterData();
    updateUsers();
    redraw("stimulus");
});

usersMenu.on("change", () => {
    window.user = usersMenu.val();
    filterData();
    redraw("user");
});

function redraw(change) {
    if (window.visualization === "two") {
        visTwo.initialize();
        visTwo.visualize();
    } else {
        if (change === "user") {
            visFour.initialize();
            visFour.newUser();
            visOne.initialize();
            visOne.userChange();
            visThree.visualize();
            visFive.visualize();
            visTwo.initialize();
            visTwo.visualize();
            setTimeout(zoomBehavior, 50);
        } else {
            if (window.visualization == "linked") {
                document.getElementById("initialize").click(); 
            }
        }
        
    }
}

// show the loading overlay
function showLoading() {
    $("main").LoadingOverlay("show", {
        background: "rgba(255,255,255,0.60)",
        fade: [10, 300],
    });
}

// hide the loading overlay
function hideLoading() {
    $("main").LoadingOverlay("hide", true);
}

// button that initializes linked view
$("#initialize").on("click", () => {
    window.visualization = "linked";

    showLoading();

    visOne.initialize();
    visOne.visualize();
    visTwo.initialize();
    visTwo.visualize();
    visThree.visualize();
    visFour.initialize();
    visFour.visualize();
    visFive.visualize();
    visAOI.visualize();

    setTimeout(zoomBehavior, 1000);
    setTimeout(hideLoading, 500);
});

// linked zoom scanpath/heatmap
function zoomBehavior() {
    const heatmapZoom = visFour.svgHeatmap();
    const scanpathZoom = visOne.svgScanpath();

    const zoom = d3.zoom().on("zoom", zoomed);

    function zoomed() {
        var t = d3.event.transform;
        heatmapZoom[0].node().__zoom = t;
        scanpathZoom[0].node().__zoom = t;
        heatmapZoom[1].attr("transform", d3.event.transform);
        heatmapZoom[2].attr("transform", d3.event.transform);
        heatmapZoom[3].attr("transform", d3.event.transform);
        scanpathZoom[1].attr("transform", d3.event.transform);
        scanpathZoom[2].attr("transform", d3.event.transform);
        scanpathZoom[3].attr("transform", d3.event.transform);
        visFour.rescaleAxis();
        visOne.rescaleAxis();
    }

    heatmapZoom[0].call(zoom);
    scanpathZoom[0].call(zoom);

    // button to reset scanpath/heatmap zoom
    $("#reset4").on("click", () => {
        heatmapZoom[0].transition().duration(400).call(zoom.transform, d3.zoomIdentity);
        scanpathZoom[0].transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    });
}

//All export functions corresponding to the save buttons
$("#exportScanpath").on("click", function () {
    saveSvgAsPng(document.getElementsByTagName("svg")[2], "scanpath.png", { encoderOptions: 1, backgroundColor: "#d9edee", scale: 2 });
});

$("#exportHeatmap").on("click", function () {
    saveSvgAsPng(document.getElementsByTagName("svg")[3], "heatmap.png", { encoderOptions: 1, backgroundColor: "#d9edee", scale: 2 });
});

$("#exportAOIGrid").on("click", function () {
    saveSvgAsPng(document.getElementsByTagName("svg")[4], "aoi-grid.png", { encoderOptions: 1, backgroundColor: "#FFFFFF", scale: 2 });
});

$("#exportThemeRiver").on("click", function () {
    saveSvgAsPng(document.getElementsByTagName("svg")[5], "theme-river.png", { encoderOptions: 1, backgroundColor: "#d9edee", scale: 2 });
});

$("#exportSankeyDiagram").on("click", function () {
    saveSvgAsPng(document.getElementsByTagName("svg")[6], "sankey-diagram.png", { encoderOptions: 1, backgroundColor: "#FFFFFF", scale: 2 });
});

$("#exportScarfPlot").on("click", function () {
    let scarfPlot = document.getElementsByTagName("svg")[7];
    let viewBox = scarfPlot.viewBox.baseVal;
    viewBox.height += 16;
    viewBox.width += 32;
    saveSvgAsPng(scarfPlot, "scarf-plot.png", { encoderOptions: 1, left: viewBox.x, top: viewBox.y, height: viewBox.height, width: viewBox.width, backgroundColor: "#FFFFFF", scale: 2 });
});
