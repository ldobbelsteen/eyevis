// Lukas Dobbelsteen (1406264)

const data = require("./data");
const upload = require("express-fileupload");
const routes = require("express").Router();

// Serve main page
routes.get("/", (req, res) => {
    res.render("index");
});

// Serve list of datasets
routes.get("/datasets", (req, res) => {
    data.listDatasets(list => {
        res.send(list);
    });
});

// Serve list of stimuli
routes.get("/stimuli", (req, res) => {
    data.listStimuli(list => {
        res.send(list);
    });
});

// Enable file uploads
routes.use(upload({
    limits: { 
        fileSize: 128 * 1024 * 1024
    }
}));

// Handle file uploads
routes.post("/upload", (req, res) => {
    let name = req.files.upload.name;
    let buffer = req.files.upload.data;
    data.addDataset(name, buffer);
    res.render("upload");
});

// Handle non-existing URLs
routes.get("*", (req, res) => {
    res.status(404).end();
});

module.exports = routes;