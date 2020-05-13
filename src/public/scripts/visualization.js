// Import the visualization modules
import * as visOne from "/modules/visOne.js";
import * as visTwo from "/modules/visTwo.js";
import * as visThree from "/modules/visThree.js";
import * as visFour from "/modules/visFour.js";
import * as visFive from "/modules/visFive.js";

const datasetsMenu = $("#datasets-menu");
const stimuliMenu = $("#stimuli-menu");
const container = $("#visualization");
var currentVis;

// Disable menus as they are not yet populated
datasetsMenu.prop("disabled", true);
stimuliMenu.prop('disabled', true);

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
    stimuliMenu.empty();
    stimuliMenu.append($("<option disabled selected value> Loading dataset... </option>"));
    Papa.parse("/datasets/" + datasetsMenu.val(), {
        download: true,
        header: true,
        complete: (result) => {
            // Write result to data variable and make sure there are no umlauts
            window.data = result.data;
            window.data.forEach((datapoint) => {
                let stimulusName = datapoint.StimuliName;
                if (stimulusName.includes("ö")) {
                    stimulusName = stimulusName.replace("ö", "�");
                }
                if (stimulusName.includes("ü")) {
                    stimulusName = stimulusName.replace("ü", "�");
                }
            });
            updateStimuli();
        }
    });
});

function updateStimuli() {
    
    // Populate the stimuli menu
    let uniqueStimuli = [...new Set(window.data.map((item) => item.StimuliName))];
    stimuliMenu.prop('disabled', false);
    stimuliMenu.empty();
    stimuliMenu.append($("<option disabled selected value> -- select a stimulus -- </option>"));
    uniqueStimuli.sort().forEach((stimulus) => {
        let stylized = stimulus; // W.I.P; make the text nicer, Ill do this later
        stimuliMenu.append($(`<option value="${stimulus}" ></option>`).text(stylized));
    });

    // Listen for selection of a stimulus
    stimuliMenu.on("change", () => {
        window.stimulus = stimuliMenu.val();

        // (Re)initialize all of the visualizations
        visOne.initialize();
        visTwo.initialize();
        visThree.initialize();
        visFour.initialize();
        visFive.initialize();

        if (currentVis != undefined) {
            currentVis.visualize();
        }

        // Whenever the menu item of a visualization is clicked, do the visualization
        $("#vis-one button").on("click", () => {
            currentVis = visOne;
            container.empty();
            visOne.visualize();
        });

        $("#vis-two button").on("click", () => {
            currentVis = visTwo;
            container.empty();
            visTwo.visualize();
        });

        $("#vis-three button").on("click", () => {
            currentVis = visThree;
            container.empty();
            visThree.visualize();
        });

        $("#vis-four button").on("click", () => {
            currentVis = visFour;
            container.empty();
            visFour.visualize();
        });

        $("#vis-five button").on("click", () => {
            currentVis = visFour;
            container.empty();
            visFour.visualize();
        });
    });
}