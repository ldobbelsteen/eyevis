var data = require("./data") // Set of functions to manipulate local data, see data.js
var formidable = require("formidable") // Library for interaction with forms and file uploads
var routes = require('express').Router() // Create router

// Serve main page
routes.get('/', (req, res) => {
    res.render("index")
})

// Handle file uploads
routes.post("/upload", (req, res) => {
    var form = new formidable.IncomingForm()
    form.maxFileSize = 128 * 1024 * 1024 // Maximum upload file size of 128MB
    form.parse(req)
    form.on("file", (name, file) => { // When the file is done uploading
        data.addDataset(file.path, file.name) // Add the dataset to the data pool
        res.redirect("back") // Send the client back to the page from which they uploaded
    })
})

module.exports = routes