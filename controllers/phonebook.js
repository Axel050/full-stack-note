const phonebookRouter = require('express').Router()
const Contact = require('../models/phonebook')

phonebookRouter.get('/info', (req, res) => {
  Contact.find({}).then(contacts => {
    const numContacts = contacts.length || 0
    const date = new Date()
    res.send(`<p>Phone has info for ${numContacts} people </p><p>${date}</p>`)
  })
})

phonebookRouter.get('/', (req, res) => {
  Contact.find({}).then(contacts => res.json(contacts))
})

phonebookRouter.post('/', (req, res, next) => {
  const body = req.body
  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact
    .save()
    .then(contactSaved => res.json(contactSaved))
    .catch(error => next(error))
})

phonebookRouter.delete('/:id', (req, res) => {
  Contact.findOneAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(erorr => next(error))
})

phonebookRouter.put('/:id', (req, res, next) => {
  const body = req.body
  const contact = new Contact({
    name: body.name,
    number: bosy.number
  })

  Contact.findByIdAndUpdate(req.params.id, contact)
    .then(updateContact => res.json(updateContact))
    .catch(error => next(error))
})

module.exports = phonebookRouter
