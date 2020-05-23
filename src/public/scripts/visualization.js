// Import the visualization modules
import * as visOne from "/modules/visOne.js";
import * as visTwo from "/modules/visTwo.js";
import * as visThree from "/modules/visThree.js";
import * as visFour from "/modules/visFour.js";
import * as visFive from "/modules/visFive.js";

const datasetsMenu = $("#datasets-menu");
const stimuliMenu = $("#stimuli-menu");
const userMenu = $("#user-menu")
const container = $("#visualization");
var filteredData
var currentVis;

// Disable menus as they are not yet populated
datasetsMenu.prop("disabled", true);
stimuliMenu.prop('disabled', true);
userMenu.prop("disabled", true)

// List datasets and add them to the dropdown menu
datasetsMenu.empty();
datasetsMenu.append($("<option disabled selected value> Loading datasets... </option>"));
$.get("/datasets", (list) => {
    datasetsMenu.prop("disabled", false);
    datasetsMenu.empty();
    datasetsMenu.append($("<option disabled selected value> -- select a dataset -- </option>"));
    list.forEach((element) => {
        let capitalized = element[0].toUpperCase() + element.slice(1);
        datasetsMenu.append($(`<option value="${element}"></option>`).text(capitalized));
    });
});

// Listen for selection of a dataset
datasetsMenu.on("change", () => {
    stimuliMenu.off("change");
    window.stimulus = undefined;
    stimuliMenu.empty();
    stimuliMenu.append($("<option disabled selected value> Loading dataset... </option>"));
    Papa.parse("/datasets/" + datasetsMenu.val(), {
        download: true,
        header: true,
        complete: (result) => {
            // Write result to data variable and make sure there are no umlauts
            window.data = result.data;
            window.data.forEach((datapoint) => {
                if (datapoint.StimuliName.includes("ö")) {
                    datapoint.StimuliName = datapoint.StimuliName.replace("ö", "�");
                }
                if (datapoint.StimuliName.includes("ü")) {
                    datapoint.StimuliName = datapoint.StimuliName.replace("ü", "�");
                }
            });
            updateStimuli();
        }
    });
});

function filterData() {
    var filter = {
        StimuliName: window.stimulus
    };
    console.log(window.selectedUser)

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

// Update the available stimuli and the menu listener
function updateStimuli() {
    
    // Populate the stimuli menu
    let uniqueStimuli = [...new Set(window.data.map((item) => item.StimuliName))];
    stimuliMenu.prop('disabled', false);
    stimuliMenu.empty();
    stimuliMenu.append($("<option disabled selected value> -- select a stimulus -- </option>"));
    uniqueStimuli.sort().forEach((stimulus) => {
        let stylized = stimulus;
        stylized = stylized.split('.').slice(0, -1).join('.'); // Remove file extension from stimulus name
        stylized = stylized.split("_").join(" ") // Replace underscores with spaces
        stimuliMenu.append($(`<option value="${stimulus}" ></option>`).text(stylized));
    });


    // Listen for selection of a stimulus
    stimuliMenu.on("change", () => {
        window.selectedUser = undefined;
        window.stimulus = stimuliMenu.val();
        userMenu.off("change")

        if (currentVis != undefined) {
            container.empty();
            currentVis.initialize();
            currentVis.visualize();
        }

        filterData();
        updateUsers();
    });

    // Whenever the menu item of a visualization is clicked, do the visualization
    $("#init-vis1").on("click", () => {
        currentVis = visOne;
        container.empty();
        visOne.initialize();
        visOne.visualize();
    });

    $("#init-vis2").on("click", () => {
        currentVis = visTwo;
        container.empty();
        visTwo.initialize();
        visTwo.visualize();
    });

    $("#init-vis3").on("click", () => {
        currentVis = visThree;
        container.empty();
        visThree.initialize();
        visThree.visualize();
    });

    $("#init-vis4").on("click", () => {
        currentVis = visFour;
        container.empty();
        visFour.initialize();
        visFour.visualize();
    });

    $("#init-vis5").on("click", () => {
        currentVis = visFive;
        container.empty();
        visFive.initialize();
        visFive.visualize();
    });

    $("#reset4").on("click", () => {
        if (currentVis == visFour) {
            container.empty();
            visFour.visualize();
        }
    });
}

function updateUsers() {
    userMenu.empty();
    userMenu.prop("disabled", false);
    userMenu.append($("<option selected>All users</option>"));
    let uniqueUsers = [...new Set(filteredData.map((item) => item.user))];
    uniqueUsers.sort().forEach((user) => {
        userMenu.append($("<option></option>").text(user));
    });

    userMenu.on("change", () => {
        window.selectedUser = userMenu.val();
        if (window.selectedUser === "All users") {
            window.selectedUser = undefined;
        }
        if (currentVis != undefined) {
            container.empty();
            currentVis.initialize();
            currentVis.visualize();
        }
    });
}