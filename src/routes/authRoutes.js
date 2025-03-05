const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require("../db.js");
const router = express.Router()


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
        const databaseID = result.rows[0].id

        const defaultTodo = `Hello :) Add your first todo!`
        await pool.query('INSERT INTO todos (user_id, task) VALUES ($1, $2);', [databaseID, defaultTodo]);

        const token = jwt.sign({ id: databaseID }, process.env.JWT_SECRET, { expiresIn: '24h' })

        return res.json({ token });
    } catch (error) {

        return res.sendStatus(503);
    }
    res.sendStatus(201);
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const getUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const databaseID = getUser.rows[0].id
        const databaseUsername = getUser.rows[0].username
        const databasePassword = getUser.rows[0].password

        if (!databaseUsername) { return res.status(404).send({ message: "User not found" }) }

        const passwordIsValid = bcrypt.compareSync(password, databasePassword)

        if (!passwordIsValid) { return res.status(404).send({ message: "Invalid password" }) }

        const token = jwt.sign({ id: databaseID }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ token });
    } catch (error) {
        return res.sendStatus(503)
    }

})

module.exports = router;