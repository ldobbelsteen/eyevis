import * as visOne from "/modules/visOne.js";
import * as visTwo from "/modules/visTwo.js";
import * as visThree from "/modules/visThree.js";
import * as visFour from "/modules/visFour.js";
import * as visFive from "/modules/visFive.js";

const datasetsMenu = $("#datasets-menu");
const stimuliMenu = $("#stimuli-menu");
const usersMenu = $("#users-menu");
const container = $("#visualization");
var data;

// Filter the full dataset according to selected values
function filterData() {
    window.data = data.filter(row => {
        return (
            row.StimuliName === window.stimulus &&
            (
                row.user === window.user || 
                window.user === "All users" || 
                window.user === undefined
            )
        );
    });
}

// List datasets and update the menu
function updateDatasets() {
    datasetsMenu.empty().append($("<option disabled selected value> Loading list of available datasets... </option>"));
    $.get("/datasets", list => {
        datasetsMenu.prop("disabled", false);
        datasetsMenu.empty().append($("<option disabled selected value> -- select a dataset -- </option>"));
        list.forEach(element => {
            let capitalized = element[0].toUpperCase() + element.slice(1);
            datasetsMenu.append($(`<option value="${element}"></option>`).text(capitalized));
        });
    });
}

// List all of the unique stimuli and update the menu
function updateStimuli() {
    stimuliMenu.empty().append($("<option disabled selected value> Loading selected dataset... </option>"));
    d3.tsv("/datasets/" + datasetsMenu.val()).then(result => {
        result.forEach(row => {
            if (row.StimuliName.includes("ö")) {
                row.StimuliName = row.StimuliName.replace("ö", "�");
            }
            if (row.StimuliName.includes("ü")) {
                row.StimuliName = row.StimuliName.replace("ü", "�");
            }
        });
        data = result;
        stimuliMenu.prop('disabled', false);
        stimuliMenu.empty().append($("<option disabled selected value> -- select a stimulus -- </option>"));
        let uniqueStimuli = [...new Set(data.map(item => item.StimuliName))];
        uniqueStimuli.sort().forEach(stimulus => {
            let stylized = stimulus;
            stylized = stylized.split('.').slice(0, -1).join('.'); // Remove file extension from stimulus name
            stylized = stylized.split("_").join(" "); // Replace underscores with spaces
            stimuliMenu.append($(`<option value="${stimulus}" ></option>`).text(stylized));
        });
    });
}

// List all of the unique users and update the menu
function updateUsers() {
    usersMenu.prop("disabled", false);
    usersMenu.empty().append($("<option selected> All users </option>"));
    let uniqueUsers = [...new Set(window.data.map(item => item.user))];
    uniqueUsers.sort().forEach(user => {
        usersMenu.append($("<option></option>").text(user));
    });
}

// Disable menus as they are not yet populated
datasetsMenu.prop("disabled", true);
stimuliMenu.prop('disabled', true);
usersMenu.prop("disabled", true);

window.onload = () => {
    updateDatasets();
}

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
    if (window.visualization === "one") {
        visOne.initialize();
        visOne.visualize();
    } else if (window.visualization === "two") {
        visTwo.initialize();
        visTwo.visualize();
    } else if (window.visualization === "three") {
        visThree.initialize();
        visThree.visualize();
    } else if (window.visualization === "four") {
        if (change === "user") {
            visFour.initialize();
            visFour.newUser();
        } else {
            visFour.initialize();
            visFour.visualize();
        }
    } else if (window.visualization === "five") {
        visFive.visualize();
    }
}

$("#init-vis1").on("click", () => {
    window.visualization = "one";
    container.empty();
    visOne.initialize();
    visOne.visualize();
});

$("#init-vis2").on("click", () => {
    window.visualization = "two";
    container.empty();
    visTwo.initialize();
    visTwo.visualize();
});

$("#init-vis3").on("click", () => {
    window.visualization = "three";
    container.empty();
    visThree.initialize();
    visThree.visualize();
});

$("#init-vis4").on("click", () => {
    window.visualization = "four";
    container.empty();
    visFour.initialize();
    visFour.visualize();
});

$("#init-vis5").on("click", () => {
    window.visualization = "five";
    visFive.visualize();
});