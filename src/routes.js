var data = require("./data")
var upload = require("express-fileupload")
var routes = require("express").Router()

// Serve main page
routes.get("/", (req, res) => {
    res.render("index")
})

// Serve list of datasets
routes.get("/datasets", (req, res) => {
    data.listDatasets((list) => {
        res.send(list)
    })
})

// Serve list of stimuli
routes.get("/stimuli", (req, res) => {
    data.listStimuli((list) => {
        res.send(list)
    })
})

// Enable file uploads
routes.use(upload({
    limits: { 
        fileSize: 128 * 1024 * 1024
    }
}))

// Handle file uploads
routes.post("/upload", (req, res) => {
    var name = req.files.upload.name
    var buffer = req.files.upload.data
    data.addDataset(name, buffer)
    res.render("upload")
})

module.exports = routes