const jwt = require('jsonwebtoken')
const constants = require('../utils/constants')
const User = require('../models/user.model')
const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    })
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Error with JWT -', err.message)
      return res.status(401).send({
        message: 'Unauthorized!'
      })
    }
    req.body.userId = decoded.userId
    next()
  })
}

const isAdmin = async (req, res, next) => {
  const user = await User.findOne({
    userId: req.body.userId
  })

  if (user && user.userType === constants.userTypes.admin) {
    next()
  } else {
    return res.status(403).send({
      message: 'Require Admin Role!'
    })
  }
}

const isEmailRegistered = async (req, res, next) => {
  // EMAIL check in DB
  const user = await User.findOne({
    email: req.body.email
  })

  if (!user) {
    next()
  } else {
    console.log('User:', user)
    return res.status(400).send('Email already registered!')
  }
}

const isUserIdRegistered = async (req, res, next) => {
  // EMAIL check in DB
  const user = await User.findOne({
    userId: req.body.userId
  })

  if (!user) {
    next()
  } else {
    console.log('User:', user)
    return res.status(400).send('User Id already registered!')
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  isEmailRegistered,
  isUserIdRegistered
}
