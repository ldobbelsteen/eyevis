export function initialize() {}

export function visualize() {

    // Find input fields and visualization container
    const gridSizeInputX = $("#vis-three input:eq(0)");
    const gridSizeInputY = $("#vis-three input:eq(1)");


    // Load stimulus (won't be displayed, or will it?? Who knows)
    let stimulusWidth;
    let stimulusHeight;
    let stimulusLink = "/stimuli/" + window.stimulus;
    let image = new Image();
    image.onload = () => {
        stimulusWidth = image.naturalWidth;
        stimulusHeight = image.naturalHeight;

        gridSizeInputX.on("change", themeRiver);
        gridSizeInputY.on("change", themeRiver);
        themeRiver();
    }
    image.src = stimulusLink;

    function themeRiver() {

        // Create the svg
        let svg = d3.select("#visualization").html("")
            .append("svg")
            .attr("width", stimulusWidth)
            .attr("height", stimulusHeight)
            .append("g");


        // Get input values for the amount of horizontal and vertical AOIs
        let gridSizeX = gridSizeInputX.val();
        let gridSizeY = gridSizeInputY.val();


        // Get AOI sizes
        let AOIsizeX = stimulusWidth / gridSizeX;
        let AOIsizeY = stimulusHeight / gridSizeY;


        // Color pattern
        let colors = d3.scaleOrdinal(d3.interpolatePlasma);


        // Creating array with AOIs
        let aois = [];
        for (let x = 0; x < gridSizeX; x++) {
            for (let y = 0; y < gridSizeY; y++) {
                aois.push({
                    color: colors(Math.random()),
                    x1: AOIsizeX * x,
                    x2: AOIsizeX * (x + 1),
                    y1: AOIsizeY * y,
                    y2: AOIsizeY * (y + 1),
                    gridX: x,
                    gridY: y
                });
            }
        }
        console.log(aois);


        // Making array with the data
        let aoiInfo = [];
        for (let stamp = 0; stamp <= 10000; stamp += 1000) {
            let timestampInfo = {};
            timestampInfo.x = stamp;
            aois.forEach((aoi) => {
                let name = "aoi_" + aoi.gridX + "_" + aoi.gridY;
                timestampInfo[name] = Math.floor(Math.random() * 10);
            });
            aoiInfo.push(timestampInfo);
        }
        console.log(aoiInfo);


        //Getting all the names of the aois to use as keys
        var keys = Object.keys(aoiInfo[0]);
        keys.shift();
        console.log(keys);


        //Creating stack
        var stack = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .order(d3.stackOrderNone)
            .keys(keys);


        //Creating the layers
        var layers = stack(aoiInfo);
        console.log(layers);


        // Calculating minumums and maximums for scaling
        var minX = d3.min(aoiInfo, function(d){
            return d.x; 
         });
     
         var maxX = d3.max(aoiInfo, function(d){
             return d.x;
         });
     
         var minY = d3.min(layers, function(l) {
             return d3.min(l, function(d) {
                 return d[0];
             })
         });
     
         var maxY = d3.max(layers, function(l) {
             return d3.max(l, function(d) {
                 return d[1];
             })
         });
     
         // Scaling
         var xScale = d3.scaleLinear()
             .domain([minX, maxX])
             .range([40, stimulusWidth-40]);
     
         var yScale = d3.scaleLinear()
             .domain([minY, maxY])
             .range([stimulusHeight-40, 40]);
         
         var yAxisScale = d3.scaleLinear()
             .domain([0, 2*maxY])
             .range([stimulusHeight-40, 40]);

        // Making it a filled in area instead of just lines
        var area = d3.area()
            .curve(d3.curveCardinal)
            .x(function(d) { return xScale(d.data.x); })
            .y0(function(d) { return yScale(d[0]); })
            .y1(function(d) { return yScale(d[1]); });


        // Making the graph
        // Color is just weird for now
        svg.selectAll("g")
            .data(layers)
            .enter()
            .append("g")
            .attr("fill", function(d) {
                return colors(d.key);
            });

        svg.selectAll("path") 
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .attr("fill", function(d) {
                return colors(d.key);
            });
        

        // Adding x-axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (stimulusHeight-40) + ")")
            .call(d3.axisBottom(xScale));
      
        // Adding y-axis
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(40, 0)")
            .call(d3.axisLeft(yAxisScale));
    }
}
