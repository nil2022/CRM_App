const { mongoose, Schema } = require('mongoose')
const jwt = require('jsonwebtoken')

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
  refreshToken: {
    type: String
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

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userId: this.userId,
      userType: this.userType,
      userStatus: this.userStatus
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

module.exports = mongoose.model('User', userSchema)
