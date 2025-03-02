const express = require("express");
const app = express()
const cors = require("cors")
const pool = require("./db.js");
const port = process.env.PORT;

//middleware
app.use(cors());
app.use(express.json());

app.listen(port, async () => {
    console.log("listening...");
    const users = await pool.query("SELECT * FROM users")
    console.log(users.rows);
})

