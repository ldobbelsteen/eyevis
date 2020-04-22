var express = require("express");
var app = express();
var dataFetch = require("./data");
const port = 3000;
app.use(express.static("public"));
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  //res.send("banana");
  var data = await dataFetch();
  console.table(data);
  res.render("index", { data: data });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
