const { mongoose, Schema } = require('mongoose')
const { ticketStatus } = require('../utils/constants')

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  ticketPriority: {
    type: String,
    required: true,
    default: 4
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: ticketStatus.open,
    uppercase: true,
    trim: true
  },
  reporter: {
    type: String
  },
  assignee: {
    type: String
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Ticket', ticketSchema)
