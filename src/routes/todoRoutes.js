const express = require('express')
const pool = require("../db.js");

const router = express.Router()

//Get all todos of logged in user
router.get('/', async (req, res) => {
    const getTodos = await pool.query('SELECT * FROM todos WHERE user_id = $1', [req.userID]);
    res.json(getTodos.rows)
})

//Create a new todo
router.post('/', async (req, res) => {
    const { task } = req.body
    const insertTodo = await pool.query('INSERT INTO todos (user_id, task) VALUES ($1, $2) RETURNING id', [req.userID, task]);
    res.json({ id: insertTodo.rows[0].id, task, completed: false })
})

//Update a todo (Comprehensive version that just updated completed field)
router.put('/:id', async (req, res) => {
    const { completed, task } = req.body
    const { id } = req.params

    try {
        let sql = 'UPDATE todos SET ';
        const values = [];
        const updateFields = [];

        if (completed !== undefined) {
            updateFields.push(`completed = $${values.length + 1}`);
            values.push(completed);
        }

        if (task !== undefined) {
            updateFields.push(`task = $${values.length + 1}`);
            values.push(task);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No update fields provided" });
        }

        sql += updateFields.join(', ');
        sql += ` WHERE user_id = $${values.length + 1} AND id = $${values.length + 2} RETURNING *`;

        values.push(req.userID, id);

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Todo not found or you don't have permission to update it" });
        }

        return res.json({ message: "Todo updated" })
    } catch (error) {
        return res.status(500).json({ message: "Server error while updating todo" });
    }
})

//Delete a todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM todos WHERE user_id = $1 AND id = $2 ', [req.userID, id]);
    return res.json({ message: "Todo deleted" })
})


/*Update a todo (Simple version that just updated completed field)
router.put('/:id', async (req, res) => {
    const { completed } = req.body
    const { id } = req.params

    const updatedTodo = await pool.query('UPDATE todos SET completed = $1 WHERE user_id = $2 AND id = $3 ', [completed, req.userID, id]);
    if (updatedTodo.rowCount === 0) {
        return res.sendStatus(500);
    }
    return res.json({ message: "Todo updated" })

})
*/

module.exports = router;