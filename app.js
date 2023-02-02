require('express-async-errors')
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { notesRouter } = require('./controllers/note')
const usersRouter = require('./controllers/user')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const phonebookRouter = require('./controllers/phonebook')
const path = require('path')
const { loginRouter } = require('./controllers/login')

logger.info('Connecting to ', config.MONGODB_URI)
mongoose.set('strictQuery', true)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connectiong to MongoDB: ', error.message)
  })

app.use(cors())
app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/notes', notesRouter)
app.use('/api/persons', phonebookRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknowEndPoint)
app.use(middleware.errorHandler)

module.exports = app
