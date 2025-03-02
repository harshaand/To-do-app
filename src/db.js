const Pool = require("pg").Pool;

const pool = new Pool({
    user: process.env.database_user,
    password: process.env.database_password,
    host: process.env.database_host,
    port: process.env.database_port,
    database: process.env.database

})

module.exports = pool;