const express = require('express')
const UserController = require('../controllers/UserController')

const UserRouter = express.Router()

UserRouter.get('/', UserController.browse)
UserRouter.get('/:id', UserController.read)
UserRouter.post('/', UserController.add)
UserRouter.put("/:id", UserController.edit)
UserRouter.delete('/:id', UserController.delete)

module.exports = UserRouter
