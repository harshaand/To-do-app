const express = require('express')
const pool = require("../db.js");

const router = express.Router()

//Get all todos of logged in user
router.get('/', (req, res) => {

})

//Create a new todo
router.post('/', (req, res) => {

})

//Update a todo
router.post('/:id', (req, res) => {

})

//Delete a todo
router.delete('/:id', (req, res) => {

})


module.exports = router;