var express = require("express");

var app = express(); // Create an Express instance
var port = 8181; // Set the listening port
app.set("view engine", "ejs"); // Set modular HTML builder
app.use(express.static("public")); // Default directory for serving files
app.use("/", require("./routes")); // Point the routing logic to the routes.js file
app.listen(port, () => { console.log("Webserver started on port " + port + "...") }); // Start listening