const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Note = require('../models/note')
const bcrypt = require('bcrypt')
const { getTokenFrom } = require('../controllers/note')

beforeEach(async () => {
  await Note.deleteMany({})

  for (let note of helper.initialNotes) {
    let noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)
    expect(contents).toContain('Browser can execute only Javascript')
  })

  test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(2)
  })
})

describe('viewing a specific note ', () => {
  test('succeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    expect(resultNote.body).toEqual(processedNoteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNoneExistingID = await helper.nonExistingId()

    await api.get(`/api/notes/${validNoneExistingID}`).expect(404)
  })

  test('fail with status code 400 id is invalid', async () => {
    // const notes = await helper.notesInDb()    // const invalidID = notes[0].id

    const invalidID = '63b5e474e3f6b551c5f3602'

    await api.get(`/api/notes/${invalidID}`).expect(400)
  })

  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    expect(response.body[0].content).toBe('HTML is easy')
  })

  test('a note can be updated', async () => {
    const noteAtStart = await helper.notesInDb()
    const noteToUpdate = noteAtStart[0]
    const newUpdateNote = {
      content: 'HTML is very easy',
      important: true
    }

    await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .send(newUpdateNote)
      .expect('Content-Type', /application\/json/)

    const contentsNotes = await helper.notesInDb()
    const { content, important } = JSON.parse(JSON.stringify(contentsNotes[0]))
    const noteUpdated = {
      content,
      important
    }
    expect(noteUpdated).toEqual(newUpdateNote)
  })

  test('a specific note can be vieweb', async () => {
    const noteAtStart = await helper.notesInDb()
    const noteToView = noteAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    expect(resultNote.body).toEqual(processedNoteToView)
  })
})

describe('addition of a new note', () => {
  test('get token for valid users', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }
    await api.post('/api/login').send(user).expect(200)
  })

  test('succeeds with valid data', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }
    const { body } = await api.post('/api/login').send(user)

    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true
    }

    await api
      .post('/api/notes')
      .auth(body.token, { type: 'bearer' })
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const noteAtEnd = await helper.notesInDb()
    expect(noteAtEnd).toHaveLength(helper.initialNotes.length + 1)

    const contents = noteAtEnd.map(r => r.content)
    expect(contents).toContain('async/await simplifies making async calls')
  })

  test('fails with status code 400 if data invalid', async () => {
    const user = { username: 'root', password: 'sekret' }
    const { body } = await api.post('/api/login').send(user)

    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .auth(body.token, { type: 'bearer' })
      .send(newNote)
      .expect(400)

    const noteAtEnd = await helper.notesInDb()

    expect(noteAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

    const contents = notesAtEnd.map(r => r.content)

    expect(contents).not.toContain(noteToDelete.content)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
