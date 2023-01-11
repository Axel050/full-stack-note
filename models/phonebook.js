const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', true)
mongoose
  .connect(url)
  .then(res => console.log('connectd to MongoDB'))
  .catch(err => console.log('error connecting to MongoDB : ' + err.message))

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
})

contactSchema.set('toJSON', {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)
