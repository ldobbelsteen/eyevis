// Import the visualization modules
import * as visOne from "/modules/visOne.js";
import * as visTwo from "/modules/visTwo.js";
import * as visThree from "/modules/visThree.js";
import * as visFour from "/modules/visFour.js";
import * as visFive from "/modules/visFive.js";

(() => {
    // List datasets and add them to the dropdown menu
    let menu = $("#datasets-menu");
    $.get("/datasets", (list) => {
        menu.empty();
        menu.append($("<option disabled selected value> -- select a dataset -- </option>"));
        list.forEach((element) => {
            menu.append($(`<option value = '${element}'></option>`).text(element));
        });
    });

    // Listen for selection of dataset and load it once that happens
    menu.on("change", () => {
        let selected = menu[0].value;
        Papa.parse("/datasets/" + selected, {
            download: true,
            header: true,
            complete: (result) => {
                // Write data to window, so modules can access it at window.data
                window.data = result.data;

                // Once the user opens the menu, initialize a visualization, only on the first click
                $("#vis-one button").one("click", () => {
                    visOne.initialize();
                })

                $("#vis-two button").one("click", () => {
                    visTwo.initialize();
                })

                $("#vis-three button").one("click", () => {
                    visThree.initialize();
                })

                $("#vis-four button").one("click", () => {
                    visFour.initialize();
                })

                $("#vis-five button").one("click", () => {
                    visFive.initialize();
                })
            }
        });
    })
})()