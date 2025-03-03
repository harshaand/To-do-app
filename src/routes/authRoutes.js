const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require("../db.js");

const router = express.Router()


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8)

    console.log(hashedPassword)

    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        const result = await pool.query('SELECT lastval() as id'); //?

        console.log(result.rows[0].id)

        const defaultTodo = `Hello :) Add your first todo!`
        await pool.query('INSERT INTO todos (user_id, task) VALUES ($1, $2);', [result.rows[0].id, defaultTodo]);

        return res.sendStatus(201);

    } catch (error) {
        console.log(error)
        return res.sendStatus(500);
    }
    res.sendStatus(201);
})

router.post('/login', (req, res) => {

})

module.exports = router;