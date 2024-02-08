const { mongoose, Schema } = require('mongoose')

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Not Provided']
  },
  userId: {
    type: String,
    required: [true, 'Not Provided'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Not Provided']
  },
  email: {
    type: String,
    required: [true, 'Not Provided'],
    lowercase: true,
    unique: true,
    isEmail: true,
    minLength: 10,
    trim: true
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  userType: {
    type: String,
    required: true,
    uppercase: true,
    default: 'CUSTOMER'
  },
  userStatus: {
    type: String,
    required: true,
    default: 'APPROVED'
  },
  ticketsCreated: {
    type: [Schema.Types.ObjectId],
    ref: 'Ticket'
  },
  ticketsAssigned: {
    type: [Schema.Types.ObjectId],
    ref: 'Ticket'
  }
})

module.exports = mongoose.model('User', userSchema)
