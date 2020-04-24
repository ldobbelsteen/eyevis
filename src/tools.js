// Cut off file extension of a filename
function cutExtension(name) {
    return name.split(".").slice(0, -1).join(".")
}

// Retrieve the file extension of a flie
function getExtension(name) {
    return name.split(".").pop()
}

module.exports = {
    getExtension: getExtension,
    cutExtension: cutExtension,
}