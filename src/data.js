var fs = require("fs");
var path = require("path");
var AdmZip = require("adm-zip");

// Set and create the data directories if they don't already exist
var dataDir = path.join(__dirname, "/public/data/");
var datasetsDir = path.join(dataDir, "/datasets/");
var stimuliDir = path.join(dataDir, "/stimuli/");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
if (!fs.existsSync(stimuliDir)) {
  fs.mkdirSync(stimuliDir);
}
if (!fs.existsSync(datasetsDir)) {
  fs.mkdirSync(datasetsDir);
}

// Add a dataset to the data pool given the desired name and the .zip file in buffer form
export function addDataset(name, buffer) {
  var datasetName = path.basename(name, path.extname(name));
  var zip = new AdmZip(buffer);
  var entries = zip.getEntries();
  entries.forEach((entry) => {
    var fileName = entry.name;
    var fileExt = path.extname(fileName);
    if (fileExt == ".csv") {
      // If it's a csv file
      zip.extractEntryTo(entry, datasetsDir, false, true); // Copy to the datasets folder
      var oldName = path.join(datasetsDir, fileName);
      var newName = path.join(datasetsDir, datasetName);
      fs.renameSync(oldName, newName); // Rename the csv file with the desired name
    }
    if (fileExt == ".jpg") {
      // If it's a stimulus file
      zip.extractEntryTo(entry, stimuliDir, false, true); // Copy to the stimuli folder
    }
  });
}

// List all datasets available
export async function listDatasets() {
  return await fs.readdir(datasetsDir);
}

// List all stimuli available
export async function listStimuli() {
  return await fs.readdir(stimuliDir);
}

export async function getDataset(name) {
  fs.readFile(path.join(datasetsDir, name));
}
