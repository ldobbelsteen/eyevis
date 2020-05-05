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

  //   var unique2 = [];
  //   var distinct2 = [];
  //   data.forEach((element) => {
  //     if (!unique2[element.user]) {
  //       distinct2.push(element.user);
  //       unique2[element.user] = 1;
  //     }
  //   });
  //   console.log($("#person-dropdown"));
  //   distinct2.forEach((user) => {
  //     console.log("ORANGE GOOD");
  //     $("#person-dropdown").append(`<option  value="${user}"> ${user}</option>`);
  //   });

  //   $("#dropdown-menu").selectize({
  //     create: true,
  //   });
  //   $("#dropdown-menu").on("change", function () {
  //     console.log($(this)[0].value);
  //   });

  //console.log($(".dropdown-menu"));
});
