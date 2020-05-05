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
    $(" #dropdown-item").append(
      `<option  value="${stimuli}"> ${stimuli}</option>`
    );
  });
  //   $("#dropdown-menu").selectize({
  //     create: true,
  //   });
  //   $("#dropdown-menu").on("change", function () {
  //     console.log($(this)[0].value);
  //   });

  //console.log($(".dropdown-menu"));
});
