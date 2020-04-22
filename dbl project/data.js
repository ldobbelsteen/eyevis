const Client = require("pg").Client;
const client = new Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432,
  database: "dbl",
});

async function gayBar() {
  var res;
  try {
    await client.connect();
    res = await client.query(" select * from data limit 10");
    console.table(res.rows);
  } catch (err) {
    console.log(err);
  } finally {
    await client.end();
    return res.rows;
  }
}

module.exports = gayBar;
