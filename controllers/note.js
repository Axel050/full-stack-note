const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const userExtractor = require('../utils/userExtractor')

const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)

    if (note) {
      res.json(note)
    } else if (!note) {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

notesRouter.post('/', userExtractor, async (req, res, next) => {
  const body = req.body

  try {
    const user = await User.findById(req.userId)

    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
      user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    res.json(savedNote)
  } catch (error) {
    next(error)
  }
})

notesRouter.delete('/:id', async (req, res) => {
  await Note.findOneAndDelete(req.params.id)
  res.status(204).end()
})

notesRouter.put('/:id', async (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important
  }

  const updateNote = await Note.findByIdAndUpdate(req.params.id, note, {
    new: true
  })
  res.json(updateNote)
})

module.exports = { notesRouter, getTokenFrom }
