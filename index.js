require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const Note = require('./models/note')
const Contact = require('./models/phonebook')

const PORT = process.env.PORT || 3001

const handleError = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    console.log('vaaaaaaallll')
    return response.status(400).json({ message: error.message, status: 20 })
  }

  next(error)
}

const app = express()
app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'
  )
)

app.get(`/api/persons`, (req, res) => {
  Contact.find({}).then(note => {
    console.log(note)
    res.json(note)
  })
})

app.get('/api/info', (req, res) => {
  Contact.find({}).then(re => {
    const numPersons = re.length || 0
    const date = new Date()
    res.send(`<p>Phone has info for ${numPersons} people</p><p>${date}</p>`)
  })
})

app.post('/api/persons', (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: 'name missing' })
  if (!req.body.number)
    return res.status(400).json({ message: 'number missing' })

  Contact.find({ name: req.body.name }).then(re => {
    const person = new Contact({
      name: req.body.name,
      number: req.body.number
    })
    if (re.length) {
      Contact.updateOne({ name: req.body.name }, { number: req.body.number })
        .then(re => res.json({ message: ' Updated phone number' }))
        .catch(err => console.log(err))
    } else {
      person.save().then(re => {
        res.json(re)
      })
    }
  })
})

app.get('/api/persons/:id', (req, res) => {
  Contact.findById(req.params.id)
    .then(re => {
      res.json(re)
    })
    .catch(er => res.status(400).json({ message: 'not found contact' }))
})

app.delete('/api/persons/:id', (req, res) => {
  Contact.findByIdAndDelete(req.params.id)
    .then(re => {
      if (re == null)
        res.status(400).json({ error: 'not found contac for delete' })
      res.status(204).json({ error: 'contact delete' })
    })
    .catch(er => {
      console.log(er)
    })
})

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NOTES
app.get('/api/notes', (req, res) => {
  Note.find({}).then(note => {
    res.json(note)
  })
})

app.put('/api/notes/:id', async (req, res) => {
  const note = {
    content: req.body.content,
    important: req.body.important
  }

  console.log(note.content)
  console.log(note.important)

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then(re => res.json(re))
    .catch(err => next(err))
})

app.post('/api/notes', (req, res, next) => {
  const note = new Note({
    content: req.body.content,
    important: req.body.important || false,
    date: new Date()
  })

  note
    .save()
    .then(savedNote => {
      res.json(savedNote.toJSON())
    })
    // .then(savedAndFormattdNote => res.json(savedAndFormattdNote))
    .catch(err => next(err))
})

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note) res.json(note)
      else res.status(404).end()
    })
    .catch(err => {
      next(err)
    })
})

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.use(handleError)

app.listen(PORT)

console.log(`server listen in port ${PORT}`)
