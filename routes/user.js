const express = require('express')
const router = express.Router()
const userController = require('../controllers/user');

// Retrieve all users
router.get('/', userController.findAll);
// Create a new user
router.get('/code', userController.discordLogin);
// Retrieve a single user with id
router.get('/:id', userController.findOne);
// Update a user with id
// Delete a user with id
router.delete('/:id', userController.delete);
module.exports = router