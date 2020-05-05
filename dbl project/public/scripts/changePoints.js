$("#dropdown-item").on("change", function () {
  // console.log(copyData);
  filteredData = copyData.filter(
    (value) => value.StimuliName == $(this)[0].value
  );
  // console.log(filteredData);
  d3.selectAll("#myContainer svg g circle").remove();
  d3.selectAll("#myContainer svg")
    .style("background-image", `url("/images/${$(this)[0].value}")`)
    .selectAll("g")
    .selectAll("dot")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", (row) => row.MappedFixationPointX)
    .attr("cy", (row) => row.MappedFixationPointY)
    .attr("r", 10)
    .style("fill", "steelblue");
});
