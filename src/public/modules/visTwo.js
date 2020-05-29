// Select input and visualization container
const container = d3.select("#visualization");
const gridSizeInputX = $("#vis-two input:eq(0)");
const gridSizeInputY = $("#vis-two input:eq(1)");

var filteredData;
var gridSizeX;
var gridSizeY;

// Update data to appriopate stimuli
function updateData() {
    var filter = {
        StimuliName: window.stimulus,
        user: window.selectedUser,
    };

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

function createAOIs(let sizeX, let sizeY, let stimulusWidth, let stimulusHeight) {
    let arrayAOI = [];

    let AOIsizeX = stimulusWidth / sizeX;
    let AOIsizeY = stimulusHeight / sizeY;

    for (let x = 0; x < sizeX; x++) {
        for (let y = 0; y < sizeY; y++) {
            arrayAOI.push({
                x: AOIsizeX * x,
                x1: AOIsizeX * (x + 1),
                y: AOIsizeY * y,
                y1: AOIsizeY * (x + 1),
                width: AOIsizeX,
                height: AOIsizeY,
            })
        }
    }

    return arrayAOI;
}

function gazeAOI(let data, let arrayAOI) {
    let arrayGazeAOI = []

    data.forEach(fixation => {
        let x = gaze.MappedFixationPointX;
        let y = gaze.MappedFixationPointY;

        arrayAOI.forEach(aoi => {
            if (x >= aoi.x && x <= aoi.x1 && y >= aoi.y && y <= aoi.y1) {
                arrayGazeAOI.push({
                    timestamp:
                })
            }
        });
    });


}

export function initialize() {
    updateData();

    let AOIs = createAOIs(gridSizeX, gridSizeY, imgWidth, imgHeight);

}

function visualize() {
    // Empty container
    container.html("");

    let svg = container.append("svg");
    gridSizeX = gridSizeInputX.val();
    gridSizeY = gridSizeInputY.val();

    // Select stimulus in loadImg
    let img = new Image();
    img.onload = function () {
        imgHeight = this.height;
        imgWidth = this.width;
        svg.attr("width", this.width)
            .attr("height", this.height)
            .insert("image", ":first-child")
            .attr("width", imgWidth)
            .attr("height", imgHeight)
            .attr("xlink:href", `/stimuli/${window.stimulus}`)
            .attr("class", "img");
        visualizeGrid();
        visualizeSankey();
    };
    img.src = `/stimuli/${window.stimulus}`;

    function visualizeGrid() {
        let gridX = svg.selectAll(".gridX")
            .data(AOIs)
            .enter().append("g")
            .attr("class", "gridX");

        let gridY = svg.selectAll(".gridY")
            .data(function(d) {return d;})
            .enter().append("rect")
            .attr("class", "gridY")
            .attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("width", function(d) {return d.width;})
            .attr("height", function(d) {return d.height;})
            .style("stroke",  "#222")
    }

    function visuaizeSankey() {

    }


}
