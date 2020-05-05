var SelectedStimuli = "01_Antwerpen_S1.jpg";

function redrawStuff(filteredData, SelectedStimuli) {
  var info = d3
    .select("body")
    .append("div")
    .attr("class", "output")
    .style("opacity", 0);

  d3.selectAll("#myContainer svg g circle").remove();
  d3.selectAll("#myContainer svg")
    .style("background-image", `url("/images/${SelectedStimuli}")`)
    .selectAll("g")
    .selectAll("dot")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", (row) => row.MappedFixationPointX)
    .attr("cy", (row) => row.MappedFixationPointY)
    .attr("r", 10)
    .style("fill", "steelblue")
    .on("mouseover", function (filteredData) {
      info.transition().duration(200).style("opacity", "1");
      info.html(
        "x: " +
          filteredData.MappedFixationPointX +
          "<br>" +
          "y:" +
          filteredData.MappedFixationPointY +
          "<br>" +
          "User: " +
          filteredData.user
      );
      info.style("left", d3.event.pageX + 8 + "px");
      info.style("top", d3.event.pageY - 80 + "px");
    })
    .on("mouseout", function (filteredData) {
      info.transition().duration(200).style("opacity", 0);
    });
}

function setStimuliChangeListenger(data) {
  $("#dropdown-item").on("change", function () {
    SelectedStimuli = $(this)[0].value;
    filteredData = data.filter((value) => value.StimuliName == SelectedStimuli);

    $("#person-dropdown").empty();
    var unique = [];
    var distinct = [];
    filteredData.forEach((element) => {
      if (!unique[element.user]) {
        distinct.push(element.user);
        unique[element.user] = 1;
      }
    });
    console.log($("#person-dropdown"));
    console.log("Pineapple gang");
    $("#person-dropdown").append(`<option  value="banana"> All users</option>`);
    distinct.forEach((user) => {
      console.log("ORANGE GOOD");
      $("#person-dropdown").append(
        `<option  value="${user}"> ${user}</option>`
      );
    });

    // console.log(filteredData);
    let img = new Image();
    img.onload = function () {
      d3.selectAll("#myContainer svg")
        .attr("width", this.width)
        .attr("height", this.height);
    };
    img.src = `/images/${$(this)[0].value}`;
    redrawStuff(filteredData, SelectedStimuli);
  });
}

function setPersonChangeListener(data) {
  $("#person-dropdown").on("change", function () {
    filteredData = data.filter((value) => {
      if ($(this)[0].value != "banana")
        return (
          value.user == $(this)[0].value && value.StimuliName == SelectedStimuli
        );
      else return value.StimuliName == SelectedStimuli;
    });
    redrawStuff(filteredData, SelectedStimuli);
  });
}

$.get("/data", (data) => {
  console.log(data);
  //ADDS INVISIBLE DIV WHICH WILL BE USED TO OUTPUT EXTRA INFO FOR EACH POINT
  var info = d3
    .select("body")
    .append("div")
    .attr("class", "output")
    .style("opacity", 0);
  console.log("BANONE");
  //DEFAULT START

  var filteredData = data.filter(
    (value) => value.StimuliName == SelectedStimuli
  );

  //DATA OF COPY TO BE USED IN CLICK LISTENER
  var global = data;
  setStimuliChangeListenger(global);
  setPersonChangeListener(global);
  d3.selectAll("#myContainer")
    .append("svg")
    .attr("width", 1650)
    .attr("height", 1200)
    .style("background-image", `url("/images/01_Antwerpen_S1.jpg")`)
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
