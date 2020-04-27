$.get("/data", (data) => {
  console.log(data);
  const filteredData = data.filter(
    (value) => value.StimuliName == "01_Antwerpen_S1.jpg"
  );
  d3.selectAll("#myContainer")
    .append("svg")
    .attr("width", 1650)
    .attr("height", 1200)
    .style("background-image", 'url("/images/01_Antwerpen_S1.jpg")')
    .append("g")
    .selectAll("dot")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", (row) => row.MappedFixationPointX)
    .attr("cy", (row) => row.MappedFixationPointY)
    .attr("r", 10)
    .style("fill", "steelblue");
});

console.log("minion banana army is strong");
