const express = require("express");
const app = express()
const path = require('path');
const cors = require("cors")
const pool = require("./db.js");
const port = process.env.PORT;
const authRoutes = require('./routes/authRoutes.js')
const todoRoutes = require('./routes/todoRoutes.js');
const authMiddleware = require("./middleware/authMiddleware.js");


//middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})

app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes)


app.get('/api/users', async (req, res) => {
    const users = await pool.query("SELECT * FROM users")
    res.json(users)
})

app.listen(port, async () => {
    console.log(`Server has started on port ${process.env.PORT}`)
})

