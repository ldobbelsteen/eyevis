//var express = require("express");
import express from "express";
var app = express();
var dataFetch = require("./data");

import bodyParser from "body-parser";

const port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
//ROUTES
app.get("/", (req, res) => {
  //var data = await dataFetch();
  res.render("index", { message: 1 });
});

app.get("/data", async (req, res) => {
  var data = await dataFetch();
  res.json(data);
});

app.get("/vis/:id", (req, res) => {
  // var data = await dataFetch();
  console.log(req.params.id);
  //var data = req.params.id;
  res.render("index", { message: req.params.id });
});

//LISTENING TO PORT

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
