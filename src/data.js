var fs = require("fs") // Library for interacting with the file system
var tmp = require("tmp") // Library for creating temporary files and directories
var path = require("path") // Library for manipulating paths
var glob = require("glob") // Library for finding files using patterns
var extract = require("extract-zip") // Library for extracting zip files

// Set and create the data directories
var dataDir = path.join(__dirname, "/public/data/")
var datasetsDir = path.join(dataDir, "/datasets/")
var stimuliDir = path.join(dataDir, "/stimuli/")
createDirectory(dataDir)
createDirectory(datasetsDir)
createDirectory(stimuliDir)

console.log(dataDir, datasetsDir, stimuliDir)

// Create a directory if it doesn't already exist
function createDirectory(dir) {
    if (! fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

// Empty a directory completely (it recurses such that it also empties any subfolders)
function emptyDirectory(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            var currentPath = path.join(dir, file)
            if (fs.lstatSync(currentPath).isDirectory()) {
                emptyDirectory(currentPath)
                deleteDirectory(currentPath)
            } else {
                deleteFile(currentPath)
            }
        })
    }
}

// Empty & remove a directory
function deleteDirectory(dir) {
    emptyDirectory(dir)
    fs.rmdirSync(dir)
}

// Delete a file
function deleteFile(file) {
    fs.unlinkSync(file)
}

// Move a file
function moveFile(oldPath, newPath) {
    fs.renameSync(oldPath, newPath)
}

// Retrieve filename without the extension
function cutExtension(name) {
    return name.split(".").slice(0, -1).join(".")
}

// Add a dataset to the data pool given the path to the zip file and the name of the dataset
// The zip file should contain CSV files for the data and either PNG, JPG or JPEG for the stimuli
// The folder structure inside the zip file does not matter
async function addDataset(zip, name) {
    var tmpDir = tmp.dirSync() // Create temporary folder
    console.log(tmpDir.name)
    try {
        await extract(zip, {dir: tmpDir.name}) // Extract zip file into temporary folder
        console.log(zip)
        deleteFile(zip) // Delete original zip file
        var csv = glob.sync(tmpDir.name + "/**/*.csv") // Look for csv file
        console.log(csv)
        csv.forEach((file) => {
            moveFile(file, path.join(datasetsDir, cutExtension(name))) // Place the csv file in the datasets folder
        })
        var stimuli = glob.sync(tmpDir.name + "/**/*.{png,jpg,jpeg}") // Look for stimuli files
        console.log(stimuli)
        stimuli.forEach((file) => {
            moveFile(file, path.join(stimuliDir, path.basename(file))) // Place the stimuli in the stimuli folder
        })
        emptyDirectory(tmpDir.name) // Empty temporary directory of any remaining files
        tmpDir.removeCallback() // Release the temporary folder
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    addDataset: addDataset
}