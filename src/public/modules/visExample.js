var yourData;
var someMenu = $("#vis-whatever #whatever-menu");
var currentlySelected;
var container = d3.select("#visualization");

export function initialize() {
    // Here you should do all kinds of stuff to 'load in' your visualization
    // Take a look at visOne to get an idea for this
    // The 'export' tag means that it can be run from outside (which it is whenever the menu of your vis is clicked)
    // For example this is where you can import the data and mutate it
    // You can do whatever you want
    // You can set listeners for any possible selection menus you have, etc.
    doStuffWithData();
    someMenu.on("change", () => {
        currentlySelected = someMenu[0].value;
        doStuffWithData();
        visualize();
    });
}

function doStuffWithData() {
    // window.data is where the FULL data of the currently selected dataset is
    yourData = window.data;
    // Try to optimize your filtering code, as the metro set is already 120000 lines of data
    // Then maybe filter some stuff or something, you do you
}

function visualize() {
    // Here you could do your visualization stuff
    // The 'container' object is a d3 object, but you could change it to whatever your library uses
    // Make sure to clear out the container before re-visualizing
    container.html(""); // Empty everything from the container
    // Then do your thing
    container.append("svg"); // Add a vector image (as used in visOne)
    var svg = container.select("svg"); // Select this svg object
}

// You don't have to follow this structure, as long as your code is at least a bit efficient and works
// and you have an exported initialize function and you get your data from window.data