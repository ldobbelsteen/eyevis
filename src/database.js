var fs = require("fs")
var { Pool } = require("pg")
var copyStreamFrom = require("pg-copy-streams").from

// Database credentials
var credentials = {
    user: "postgres",
    database: "postgres",
    password: "postgres",
    port: 5432,
}

// Open pool for connections to the database
var pool = new Pool(credentials)
pool.on("error", (err, client) => {
    console.error(err)
    process.exit(-1)
})

// Create a new table given its name
function createTable(name) {
    var query = `CREATE TABLE IF NOT EXISTS ${name} (timestamp int, stimuli text, fix_index int, fix_duration int, fix_x int, fix_y int, user_id text, description text)`
    pool.query(query, (err) => {
        if (err) console.log(err)
    })
}

// Remove all values from a table given its name
function clearTable(name) {
    var query = `DELETE FROM ${name}`
    pool.query(query, (err) => {
        if (err) console.log(err)
    })
}

// Completely delete a table given its name
function deleteTable(name) {
    var query = `DROP TABLE IF EXISTS ${name}`
    pool.query(query, (err) => {
        if (err) console.log(err)
    })
}

// Write a csv file into a table given the name of the table
function csvToTable(file, table) {
    var header = "true"
    var format = "csv"
    var delimiter = "E'\t'"
    var encoding = "LATIN1"

    pool.connect().then(client => {
        var stream = client.query(copyStreamFrom(`COPY ${table} FROM STDIN WITH (FORMAT ${format}, HEADER ${header}, DELIMITER ${delimiter}, ENCODING ${encoding} )`))
        var readable = fs.createReadStream(file)
        readable.on("error", (err) => {console.log(err), client.release()})
        stream.on("error", (err) => {console.log(err), client.release()})
        stream.on("end", () => client.release())
        readable.pipe(stream)
    })
}

module.exports = {
    createTable: createTable,
    clearTable: clearTable,
    deleteTable: deleteTable,
    csvToTable: csvToTable,
}
