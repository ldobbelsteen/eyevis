//var express = require("express");
import express from "express";
var app = express();
var dataFetch = require("./data");

var bodyParser = require("body-parser");

const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
//ROUTES
app.get("/", async (req, res) => {
  var data = await dataFetch();
  res.render("index", { data: data });
});

app.get("/data", async (req, res) => {
  var data = await dataFetch();
  res.json(data);
});

//LISTENING TO PORT

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
