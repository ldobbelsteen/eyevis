$.get("/data", (data) => {
  var unique = [];
  var distinct = [];
  data.forEach((element) => {
    if (!unique[element.StimuliName]) {
      distinct.push(element.StimuliName);
      unique[element.StimuliName] = 1;
    }
  });
  console.log($(".dropdown-menu"));
  distinct.forEach((stimuli) => {
    console.log("BANANA NATION");
    $("#dropdown-menu").append(`<option value="#"> ${stimuli}</option>`);
  });
  //   $("#dropdown-menu").selectize({
  //     create: true,
  //   });
  console.log($(".dropdown-menu"));
});
