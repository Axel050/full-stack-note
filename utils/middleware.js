const logger = require('./logger')

const requestLogger = (req, res, next) => {
  logger.info('Method: ', req.method)
  logger.info('Path: ', req.path)
  logger.info('Body: ', req.body)
  logger.info(' --- ')
  next()
}

const unknowEndPoint = (req, res) => {
  res.status(404).send({ error: 'unknowendpoint' })
}

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformateed id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token'
    })
  }
  logger.error(error.message)
  next(error)
}

module.exports = {
  requestLogger,
  unknowEndPoint,
  errorHandler
}
