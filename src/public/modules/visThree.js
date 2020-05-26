function filterData(data, filter) {
    return data.filter((item) => {
        for (let key in filter) {
            if (item[key] != filter[key]) {
                return false;
            }
        }
        return true;
    });
}

export function initialize() {}

export function visualize() {

    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-three input:eq(0)");
    const gridSizeInputY = $("#vis-three input:eq(1)");
    const container = d3.select("#visualization");

    // Filter dataset data by the current stimulus
    let data = filterData(window.data, {
        StimuliName: window.stimulus
    });

    // Create svg for the ThemeRiver
    container.html("");
    container.append("svg");

    // Get the container width and height
    let containerWidth = parseInt(container.style("width"));
    let containerHeight = parseInt(container.style("height"));

    let svg = container.select("svg");
    svg.style("margin", "20px")

    // Add the stimulus
    // This is where Lukas had both the stimuli image and his visualization, I only need the visualization for now 
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;
        svg.attr("width", stimulusWidth)
            .attr("height", stimulusHeight);
        gridSizeInputX.on("change", themeRiver);
        gridSizeInputY.on("change", themeRiver);
        themeRiver();
    }
    image.src = stimulusLink;

    function themeRiver() {

        // 8x8 Possible colors for AOIs
        let colorRange = [
            "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
            "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
            "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
            "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
            "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
            "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
            "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
            "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
            "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
            "#5be4f0", "#57c4d8", "#a4d17a", "#225b80", "#be608b", "#96b00c", "#088baf"
        ];

        // Get input values for the amount of horizontal and vertical AOIs
        let gridSizeX = gridSizeInputX.val();
        let gridSizeY = gridSizeInputY.val();

        // Array of AOI objects
        let aois = [];

        // Calculate width and height of AOIs
        let AOIsizeX = stimulusWidth / gridSizeX;
        let AOIsizeY = stimulusHeight / gridSizeY;

        // Add the AOIs to the array
        for (let x = 0; x < gridSizeX; x++) {
            for (let y = 0; y < gridSizeY; y++) {
                aois.push({
                    color: colorRange.pop(),
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1),
                    gridX: x,
                    gridY: y,
                    name: "aoi_" + String(x) + "_" + String(y)
                })
            }
        }
        console.log(aois);

        // Making array with the data
        // I am still not sure what the best way to structure the data would be
        // I keep changing it in the hope that something will eventually work
        let aoiInfo = [];
        for (let stamp = 0; stamp < 10000; stamp += 1000) {
                let timestampInfo = {};
                timestampInfo.time = stamp;
                timestampInfo.aois = [];
            aois.forEach(aoi => {
                let aoiInfo = {};
                aoiInfo.name = aoi.name;
                aoiInfo.timestamp = stamp;

                // Need to figure out how to count the fixations in each aoi later
                // For now it's just a random count between 0 and 10
                aoiInfo.fixCount = Math.floor(Math.random() * 10); 
                aoiInfo.color = aoi.color;

                timestampInfo.aois.push(aoiInfo);
            });
            aoiInfo.push(timestampInfo);
        }
        console.log(aoiInfo);

    
        // Scaling x
        var x = d3.scaleLinear()
            .domain(d3.extent(aoiInfo, function(d) { return d.timestamp; }))
            .range([ 0, containerWidth ]);
        
        // Scaling y
        var y = d3.scaleLinear()
            .domain([0, d3.max(aoiInfo, function(d) { return +d.fixCount; })])
            .range([ containerHeight, 0 ]);


        //One example added this but i'm not sure if I need it... the console doesn't like the ordinal thing
        // var z = d3.scale.ordinal()
        //    .range(colorRange);

        // Set dimensions of the svg and set rendering
        //svg.html("");
        //svg.attr("viewBox", [0, 0, containerWidth, containerHeight]);
        //svg.attr("shape-rendering", "crispEdges");

        //Creating stack
        var stack = d3.layout.stack()
            .offset("silhouette")
            .keys(function(d) {return d.name;})
            .values(function(d) { return d.aois; })
            .x(function(d) { return d.timestamp; })
            .y(function(d) { return d.fixCount; });

        //Creates nested format, but I believe I already have this
        //var nest = d3.nest()
        //    .key(function(d) { return d.name; });

        // Making it a filled in area instead of just lines
        // I think this is where (one of the) errors occur, 
        // the example magically had a y and y0 after reading a csv file that contained neither
        // So where the hell do they come from...
        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return x(d.timestamp); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });
    
        //Creating the layers
        var layers = stack(aoiInfo);
        
        //Making the graph
        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d.fixCount); })
            .style("fill", function(d) { return d.color });

        // Adding x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + stimulusHeight + ")")
            .call(d3.axisBottom(x));
      
        // Adding y-axis
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + stimulusWidth + ", 0)")
            .call(d3.axisLeft(y));
    }
}
