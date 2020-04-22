const Client = require("pg").Client;
const client = new Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432,
  database: "dbl",
});

var app = require("express")();
const port = 3000;
var data;

var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

async function execute(res) {
  try {
    await client.connect();
    console.log("Connected succesfully");
    const results = await client.query("select * from data limit 10");
    data = results.rows;
  } catch (err) {
    console.log(`Something went wrong ${err}`);
  } finally {
    await client.end();
    console.log("Disconnected succesfully");
  }
}
execute();

app.get("/", (req, res) => {
  res.render("index", { data: data });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
