function setup() {
  let myCanvas = createCanvas(1800, 1200);
}
var primitivesToDraw = [];
function draw() {
  primitivesToDraw.forEach((primitive) => {
    console.log("biggest bananas");
    primitive.call(this);
  });
  primitivesToDraw = [];
}

$.get("/data", (data) => {
  console.log(data);
  data.forEach((element) => {
    $("#myContainer").append(`<h1> ${element.StimuliName} </h1>`);
    primitivesToDraw.push(() => {
      console.log("big bananas");
      ellipse(
        element.MappedFixationPointX,
        element.MappedFixationPointY,
        element.FixationDuration,
        element.FixationDuration
      );
    });
  });
});

console.log("minion banana army is strong");
