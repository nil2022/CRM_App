import mongoose, { Schema } from 'mongoose'
import { ticketPriority, ticketStatus } from '../utils/constants.js'

const ticketSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  ticketPriority: {
    type: String,
    default: ticketPriority.low,
    trim: true
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

export const Ticket = mongoose.model('Ticket', ticketSchema)
