var data = require("./data")
var upload = require("express-fileupload")
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

// Enable file uploads
routes.use(upload({
    limits: { fileSize: 128 * 1024 * 1024 }
}))

// Handle file uploads
routes.post("/upload", (req, res) => {
    var name = req.files.upload.name
    var buffer = req.files.upload.data
    data.addDataset(name, buffer)
    res.render("upload")
})

module.exports = routes