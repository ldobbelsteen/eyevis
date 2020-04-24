var http = require("http")
var formidable = require("formidable")
var database = require("./database")
var tools = require("./tools")

// Start HTTP server
http.createServer((req, res) => {
    if (req.url == "/upload" && req.method.toLowerCase() === "post") {
        var form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            handleUpload(files.upload.path, files.upload.name, (err) => {
                if (err) console.log(err)
            })
            res.write("File uploaded!")
            res.end()
        })
    } else {
        res.writeHead(200, {"Content-Type": "text/html"})
        res.write(`
            <form action="upload" method="post" enctype="multipart/form-data">
                <div>Upload your dataset here</div>
                <div>File: <input type="file" name="upload"></div>
                <input type="submit">
            </form>
        `)
        return res.end()
    }
}).listen(8181)

// Handle the uploaded dataset
function handleUpload(file, name) {
    var tableName = tools.cutExtension(name)
    database.createTable(tableName)
    setTimeout(() => { // Postgres seems to take more time than the finishing of the query to create a table thus we wait
        database.clearTable(tableName)
        database.csvToTable(file, tableName)
    }, 4000)
}