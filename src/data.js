var fs = require("fs")
var path = require("path")
var admzip = require('adm-zip')

// Set and create the data directories if they don't already exist
var dataDir = path.join(__dirname, "/public/data/")
var datasetsDir = path.join(dataDir, "/datasets/")
var stimuliDir = path.join(dataDir, "/stimuli/")
if (! fs.existsSync(dataDir)) { fs.mkdirSync(dataDir) }
if (! fs.existsSync(stimuliDir)) { fs.mkdirSync(stimuliDir) }
if (! fs.existsSync(datasetsDir)) { fs.mkdirSync(datasetsDir) }

// Add a dataset to the data pool given the path to the zip file and the name of the dataset
async function addDataset(name, file) {
    var zip = new admzip(file)
    var entries = zip.getEntries() // List all files in zip file
    entries.forEach((entry) => { // For every file in the zip file
        var filename = entry.name
        if (path.extname(filename) == '.csv') { // If it's a csv file
            zip.extractEntryTo(entry, datasetsDir, false, true) // Copy to the datasets folder
            var oldName = path.join(datasetsDir, filename)
            var newName = path.join(datasetsDir, name)
            fs.renameSync(oldName, newName) // Rename the csv file with the desired name
        }
        if (path.extname(filename) == '.jpg') { // If it's a stimulus file
            zip.extractEntryTo(entry, stimuliDir, false, true) // Copy to the stimuli folder
        }
    })
}

module.exports = {
    addDataset: addDataset
}