const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument : node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://Axel050:${password}@cluster0.v0du7zo.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.set('strictQuery', true)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Contact = mongoose.model('contact', contactSchema)

if (process.argv.length === 3) {
  Contact.find({}).then(res => {
    console.log('PhoneBook:')
    res.forEach(c => console.log(c.name + ' - ' + c.number))
    mongoose.connection.close()
  })
}

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'GET and POST are the most important methods of HTTP protocol',
  date: new Date(),
  important: true
})

// note.save().then(res => {
//   console.log('note saved')
//   mongoose.connection.close()
// })

// Note.find({ important: true }).then(res => {
//   res.forEach(n => {
//     console.log(n)
//   })
//   mongoose.connection.close()
// })

if (process.argv.length > 3) {
  const contact = new Contact({
    name: process.argv[3],
    number: process.argv[4]
  })

  contact.save().then(res => {
    console.log('contact saved')
    mongoose.connection.close()
  })
}
