var fs = require("fs")
var path = require("path")
var AdmZip = require("adm-zip")

// Paths of storage location of datasets and stimuli
var datasetsDir = path.join(__dirname, "/public/datasets/")
var stimuliDir = path.join(__dirname, "/public/stimuli/")

// Create storage locations if they don't yet exist
if (!fs.existsSync(datasetsDir)) {
    fs.mkdir(datasetsDir, (err) => {
        if (err) throw err
    })
}
if (!fs.existsSync(stimuliDir)) {
    fs.mkdir(stimuliDir, (err) => {
        if (err) throw err
    })
}

// Add a dataset to the data pool given the desired name and the .zip file in buffer form
async function addDataset(name, buffer) {
    var datasetName = path.basename(name, path.extname(name))
    var zip = new AdmZip(buffer)
    var entries = zip.getEntries()
    entries.forEach((entry) => {
        var fileName = entry.name
        var fileExt = path.extname(fileName)
        if (fileExt == ".csv") { // If it's a csv file
            zip.extractEntryTo(entry, datasetsDir, false, true) // Copy to the datasets folder
            var oldName = path.join(datasetsDir, fileName)
            var newName = path.join(datasetsDir, datasetName)
            fs.rename(oldName, newName, (err) => { // Rename the csv file with the desired name
                if (err) throw err
            })
        }
        if (fileExt == ".jpg") { // If it's a stimulus file
            zip.extractEntryTo(entry, stimuliDir, false, true) // Copy to the stimuli folder
        }
    })
}

// List all datasets available
async function listDatasets(callback) {
    fs.readdir(datasetsDir, (err, list) => {
        if (err) throw err
        return callback(list)
    })
}

// List all stimuli available
async function listStimuli(callback) {
    fs.readdir(stimuliDir, (err, list) => {
        if (err) throw err
        return callback(list)
    })
}

module.exports = {
    addDataset: addDataset,
    listDatasets: listDatasets,
    listStimuli: listStimuli
}