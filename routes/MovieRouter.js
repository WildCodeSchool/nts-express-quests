const express = require('express')
const MovieController = require('../controllers/MovieController')

const MovieRouter = express.Router()

MovieRouter.get('/', MovieController.browse)
MovieRouter.get('/:id', MovieController.read)
MovieRouter.post('/', MovieController.add)
MovieRouter.put("/:id", MovieController.edit)
MovieRouter.delete('/:id', MovieController.delete)

module.exports = MovieRouter
