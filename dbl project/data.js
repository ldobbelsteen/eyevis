const Client = require("pg").Client;
const config = {
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432,
  database: "dbl",
};

async function fetchDatabase() {
  var res;
  const client = new Client(config);
  try {
    await client.connect();
    res = await client.query(" select * from data limit 10");
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Ended communication");
    await client.end();
    return res.rows;
  }
}

module.exports = fetchDatabase;
