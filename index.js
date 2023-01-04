const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    date: '2019-05-30T17:30:31.098Z',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only Javascript',
    date: '2019-05-30T18:39:34.091Z',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    date: '2019-05-30T19:20:14.298Z',
    important: true
  }
]

let persons = [
  { id: 1, name: 'ace', number: 'ace040' },
  { id: 2, name: 'davie', number: 'david182' }
]

const PORT = process.env.PORT || 3001

const midel = (req, res) => {
  res.status(404).send({ message: 'Not founde' })
}

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'
  )
)

app.get(`/api/persons`, (req, res) => {
  res.json(persons)
})

app.get('/api/info', (req, res) => {
  const numPersons = persons?.length
  const date = new Date()
  res.send(`<p>Phone has info for ${numPersons} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const exist = persons.find(el => el.id === Number(req.params.id))
  if (!exist) return res.status(404).end()
  res.json(exist)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const exist = persons.find(el => el.id === id)
  if (!exist) return res.status(404).end()
  persons = persons.filter(el => el.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const ii = Math.random(1000)
  if (!req.body.name) return res.status(400).json({ message: 'name missing' })

  if (!req.body.number)
    return res.status(400).json({ message: 'number missing' })

  const names = persons.find(el => el.name === req.body.name)

  if (names) return res.status(400).json({ message: 'name must be unique' })

  const person = { ...req.body, id: ii }
  persons.push(person)
  res.json(person)
})

//  NOTES
app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.post('/api/notes', (req, res) => {
  // console.log(req.body)
  res.json(req.body)

  console.log('aaaa')
  notes.push(req.body)
})

app.put('/api/notes/:id', (req, res) => {
  const note = req.body
  if (!note) return res.status(404).json({ message: 'Not found note' })
  res.json(note)
})

app.use(midel)

app.listen(PORT)

console.log(`server listen in port ${PORT}`)
