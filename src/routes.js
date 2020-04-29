var data = require("./data")
var formidable = require("formidable")
var routes = require("express").Router()

// Serve main page
routes.get("/", (req, res) => {
    res.render("index")
})

// Serve list of datasets
routes.get("/datasets", (req, res) => {
    var datasets = data.listDatasets()
    res.send(datasets)
})

// Serve list of stimuli
routes.get("/stimuli", (req, res) => {
    var stimuli = data.listStimuli()
    res.send(stimuli)
})

// Handle file uploads
routes.post("/upload", (req, res) => {
    var form = new formidable.IncomingForm()
    form.maxFileSize = 128 * 1024 * 1024 // Maximum upload file size of 128MB
    form.parse(req)
    form.on("file", (name, file) => { // When the file is done uploading
        var datasetName = file.name.split(".").slice(0, -1).join(".") // Copy the name of the zip file
        var datasetPath = file.path // Path of the uploaded file
        data.addDataset(datasetName, datasetPath) // Add the dataset
        res.redirect("back") // Send the client back to the page from which they uploaded
    })
})

module.exports = routes