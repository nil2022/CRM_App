import { User } from '../models/user.model.js'
import validator from 'validator'
import asyncHandler from '../utils/asyncHandler.js'
import { BadRequestError, ForbiddenError } from '../utils/ApiError.js'

/* -------- CHECK WHETHER PASSWORD IS PROVIDED OR NOT (FOR BOTH SIGNUP & SIGNIN) ----------- */
const isPasswordProvided = asyncHandler(async (req, res, next) => {
  const passwordReq = req.body.password

  if (!passwordReq) {
    throw new ForbiddenError('No Password provided!')
  }
  next()
})

/* -------- CHECK WHETHER EMAIL IS PROVIDED OR NOT & ALREADY REGISTERED OR NOT ----------- */
const isEmailRegisteredOrProvided = asyncHandler(async (req, res, next) => {
  const emailReq = req.body.email
  if (typeof emailReq !== 'string') {
    console.log('Invalid Email Format')
    throw new ForbiddenError('Invalid Email')
  }

  if (!emailReq) {
    throw new ForbiddenError('No Email provided')
    // Also checks if Email is in Valid format or not
  } else if (!validator.isEmail(emailReq)) {
    throw new ForbiddenError('Invalid Email Format')
  }

  // EMAIL check in DB
  const user = await User.findOne({
    email: emailReq
  })

  if (!user) {
    next()
  } else {
    console.log('Email already registered!', user)
    throw new BadRequestError('Email already registered!')
  }
})

/* -------- CHECK WHETHER USERID IS PROVIDED OR NOT & ALREADY REGISTERED OR NOT (FOR SIGNUP PURPOSE) ----------- */
const isUserIdRegisteredOrProvided = asyncHandler(async (req, res, next) => {
  const userIdReq = req.body.userId

  if (!userIdReq) {
    throw new ForbiddenError('No userId provided!')
  }
  // userId check in DB
  const user = await User.findOne({ userId: { $eq: req.body.userId } })
  if (user) {
    console.log(`'${user.userId}' user already present in DB`)
    throw new ForbiddenError(`'${user.userId}' user already present`)
  } else next()
})

/* -------- CHECK WHETHER USERID IS PROVIDED OR NOT (FOR SIGNIN PURPOSE) ----------- */
const isUserIdProvided = asyncHandler(async (req, res, next) => {
  const userIdReq = req.body.userId

  if (!userIdReq) {
    throw new ForbiddenError('No userId provided!')
  }
  // userId check in DB
  const user = await User.findOne({ userId: { $eq: userIdReq } })
  if (!user) {
    console.log('User not present in DB, please Register/Signup')
    throw new ForbiddenError('User not found, please Register!')
  } else next()
})

export {
  isPasswordProvided,
  isEmailRegisteredOrProvided,
  isUserIdRegisteredOrProvided,
  isUserIdProvided
}
