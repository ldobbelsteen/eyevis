const Client = require("pg").Client;
const client = new Client({
  user: "postgres",
  password: "admin",
  host: "localhost",
  port: 5432,
  database: "dbl",
});
client
  .connect()
  .then(() => console.log("connected"))
  .then(() => client.query("select * from data limit 10"))
  .then((results) => console.table(results.rows))
  .catch((e) => console.log(e))
  .finally(() => client.end());
