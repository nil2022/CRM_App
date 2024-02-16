const User = require('../models/user.model')
const validator = require('validator')

/* -------- CHECK WHETHER PASSWORD IS PROVIDED OR NOT (FOR BOTH SIGNUP & SIGNIN) ----------- */
const isPasswordProvided = async (req, res, next) => {
  const passwordReq = req.body.password

  if (!passwordReq) {
    return res.status(403).send({
      message: 'No Password provided!'
    })
  } else next()
}

/* -------- CHECK WHETHER EMAIL IS PROVIDED OR NOT & ALREADY REGISTERED OR NOT ----------- */
const isEmailRegisteredOrProvided = async (req, res, next) => {
  const emailReq = req.body.email
  if (typeof emailReq !== 'string') {
    console.log('Invalid Email Format')
    return res.status(403).send({
      message: 'Invalid Email Format'
    })
  }

  if (!emailReq) {
    return res.status(403).send({
      message: 'No Email provided'
    })
    // Also checks if Email is in Valid format or not
  } else if (!validator.isEmail(emailReq)) {
    return res.status(403).send({
      message: 'Invalid Email Format'
    })
  }
  // EMAIL check in DB
  const user = await User.findOne({
    email: emailReq
  })

  if (!user) {
    next()
  } else {
    console.log('Email already registered!', user)
    return res.status(400).send('Email already registered!')
  }
}

/* -------- CHECK WHETHER USERID IS PROVIDED OR NOT & ALREADY REGISTERED OR NOT (FOR SIGNUP PURPOSE) ----------- */
const isUserIdRegisteredOrProvided = async (req, res, next) => {
  const userIdReq = req.body.userId

  if (!userIdReq) {
    return res.status(403).send({
      message: 'No userId provided!'
    })
  }
  // userId check in DB
  const user = await User.findOne({ userId: { $eq: req.body.userId } })
  if (user) {
    console.log(`'${user.userId}' user already present in DB`)
    return res.status(403).send({
      message: `'${user.userId}' user already present`
    })
  } else next()
}

/* -------- CHECK WHETHER USERID IS PROVIDED OR NOT (FOR SIGNIN PURPOSE) ----------- */
const isUserIdProvided = async (req, res, next) => {
  const userIdReq = req.body.userId

  if (!userIdReq) {
    return res.status(403).json({
      message: 'No userId provided!'
    })
  }
  // userId check in DB
  const user = await User.findOne({ userId: { $eq: userIdReq.toLowerCase() } })
  if (!user) {
    console.log('User not present in DB, please Register/Signup')
    return res.status(403).send({
      message: 'User not found, please Register!'
    })
  } else next()
}

module.exports = {
  isPasswordProvided,
  isEmailRegisteredOrProvided,
  isUserIdRegisteredOrProvided,
  isUserIdProvided
}
