$.get("/data", (data) => {
  console.log(data);
  //ADDS INVISIBLE DIV WHICH WILL BE USED TO OUTPUT EXTRA INFO FOR EACH POINT
  var info = d3
    .select("body")
    .append("div")
    .attr("class", "output")
    .style("opacity", 0);
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
    .style("fill", "steelblue")
    .on("mouseover", function (data) {
      info.transition().duration(200).style("opacity", "1");
      info.html(
        "x: " +
          data.MappedFixationPointX +
          "<br>" +
          "y:" +
          data.MappedFixationPointY +
          "<br>" +
          "User: " +
          data.user
      );
      info.style("left", d3.event.pageX + 8 + "px");
      info.style("top", d3.event.pageY - 80 + "px");
    })
    .on("mouseout", function (data) {
      info.transition().duration(200).style("opacity", 0);
    });
});

console.log("minion banana army is strong");
