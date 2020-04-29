var express = require("express")

var app = require('express')() // Create an Express instance
app.set("view engine", "ejs") // Set modular HTML builder
app.use(express.static("public")) // Default directory for serving files
app.use('/', require('./routes')) // Point the routing logic to the routes.js file
app.listen(8181) // Start listening