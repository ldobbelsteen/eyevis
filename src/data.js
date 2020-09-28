const fs = require("fs");
const path = require("path");
const admzip = require("adm-zip");

// Paths of storage location of datasets and stimuli
const datasetsDir = path.join(__dirname, "/public/datasets/");
const stimuliDir = path.join(__dirname, "/public/stimuli/");

// Create storage locations if they don't yet exist
if (!fs.existsSync(datasetsDir)) {
    fs.mkdir(datasetsDir, err => {
        if (err) throw err;
    });
}
if (!fs.existsSync(stimuliDir)) {
    fs.mkdir(stimuliDir, err => {
        if (err) throw err;
    });
}

// Add a dataset to the data pool given the desired name and the .zip file in buffer form
async function addDataset(name, buffer) {
    let zip = new admzip(buffer); // Create zip object for reading the buffer
    let entries = zip.getEntries(); // Get all of the file entries in the .zip file
    let datasetName = path.basename(name, path.extname(name)); // Filename without extension
    entries.forEach(entry => {
        let fileName = entry.name;
        let fileExt = path.extname(fileName);
        if (fileExt === ".jpg" || fileExt === ".jpeg" || fileExt === ".png") { // If it's a stimulus file
            zip.extractEntryTo(entry, stimuliDir, false, true); // Copy to the stimuli folder
        }
        if (fileExt === ".csv") { // If it's a csv file
            zip.extractEntryTo(entry, datasetsDir, false, true); // Copy to the datasets folder
            let oldName = path.join(datasetsDir, fileName);
            let newName = path.join(datasetsDir, datasetName);
            fs.rename(oldName, newName, err => { // Rename the csv file to the desired name
                if (err) throw err;
            });
        }
    });
}

// List all datasets available
async function listDatasets(callback) {
    fs.readdir(datasetsDir, (err, list) => {
        if (err) throw err;
        return callback(list);
    });
}

// List all stimuli available
async function listStimuli(callback) {
    fs.readdir(stimuliDir, (err, list) => {
        if (err) throw err;
        return callback(list);
    });
}

module.exports = {
    addDataset: addDataset,
    listDatasets: listDatasets,
    listStimuli: listStimuli
};
