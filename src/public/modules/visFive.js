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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

export function initialize() {
    console.log("No initialization needed...");
}

export function visualize() {

    // Filter dataset data by the current stimulus
    let filter = { StimuliName: window.stimulus }
    let data = filterData(window.data, filter);

    // Select the container using D3
    let container = d3.select("#visualization");

    // Set width of vis div and set height of a single timeline
    let width = parseInt(container.style("width"));
    let height = parseInt(container.style("font-size"));

    // AOI colors (this is hella temporary)
    let colors = [["#2300E5", "#2A17C8", "#312FAB"], ["#38478F", "#405F72", "#477755"], ["#4E8F39", "#55A71C", "#5DBF00"]]

    // Array for all the gazes
    let gazes = [];

    // Variable for keeping track of the highest timestamp in the current data
    let highestDuration = 0;

    // List unique users and look at each one
    let users = [...new Set(data.map((item) => item.user))];
    users.forEach(user => {
        let filter = { user: user }
        let userData = filterData(data, filter); // Get data from single user
        let timestamps = userData.map(x => x.Timestamp) // Make array of all timestamps
        let startTime = Math.min(...timestamps); // Get lowest timestamp value
        let totalDuration = Math.max(...timestamps) - startTime; // Get the total duration
        if (totalDuration > highestDuration) {
            highestDuration = totalDuration;
        }
        userData.forEach(gaze => {
            gazes.push({
                user: gaze.user,
                time: gaze.Timestamp - startTime,
                duration: gaze.FixationDuration,
                color: colors[getRandomInt(3)][getRandomInt(3)]
            });
        });
    });

    // Empty container and create svg element
    container.html("");
    container.append("svg");
    let svg = container.select("svg");

    // Create scalers for horizontal and vertical alignment
    var x = d3.scaleLinear()
                .domain([0, highestDuration])
                .range([0, width])
    var y = d3.scalePoint()
                .domain(users)
                .range([0, (users.length - 1) * height])
    
    // Set size of the svg
    svg.attr("viewBox", [0, 0, width, height * users.length])

    // Add gazes to the svg
    svg.selectAll("rect")
        .data(gazes)
        .enter().append("rect")
            .attr("fill", gaze => {
                return gaze.color;
            })
            .attr("x", gaze => {
                return x(gaze.time);
            })
            .attr("y", gaze => {
                return y(gaze.user);
            })
            .attr("width", gaze => {
                return x(gaze.duration);
            })
            .attr("height", height)
}