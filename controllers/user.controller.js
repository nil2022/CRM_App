/**
 * Controllers for the user resources.
 * Only the user of type ADMIN should be able to perform the operations
 * defined in the User Controller
 */
const bcrypt = require('bcrypt')
const User = require('../models/user.model')
const ObjectConverter = require('../utils/objectConverter')
const date = new Date()
const timeNow = date.toString() // Current time to update in DB

const fetchAll = async (res) => {
  let users
  try {
    users = await User.find()
  } catch (err) {
    console.log('Error while fetching the users')
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
  return users
}

const fetchByName = async (userNameReq, res) => {
  let users
  try {
    users = await User.find({
      name: { $regex: userNameReq.replace(/\n|\r/g, ''), $options: 'i' } // $regex operator to find all documents in a collection, $options parameter to specify case-insensitivity
    })
  } catch (err) {
    console.log('Error while fetching the user for Name : ', userNameReq.replace(/\n|\r/g, ''))
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
  return users
}

const fetchByTypeAndStatus = async (userTypeReq, userStatusReq, res) => {
  let users
  try {
    users = await User.find({
      userType: userTypeReq,
      userStatus: userStatusReq
    })
  } catch (err) {
    console.err(`error while fetching the user for userType [${userTypeReq}] and userStatus [${userStatusReq}]`)
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
  return users
}

const fetchByType = async (userTypeReq, res) => {
  let users
  try {
    users = await User.find({
      userType: userTypeReq
    })
  } catch (err) {
    console.err(`error while fetching the user for userType [${userTypeReq}] `)
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
  return users
}

const fetchByStatus = async (userStatusReq, res) => {
  let users
  try {
    users = await User.find({
      userStatus: userStatusReq
    })
  } catch (err) {
    console.err(`error while fetching the user for userStatus [${userStatusReq}] `)
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
  return users
}
/**
 * Fetch the list of all users
 */
exports.findAll = async (req, res) => {
  let users
  const userTypeReq = req.query.userType
  const userStatusReq = req.query.userStatus
  const userNameReq = req.query.name
  try {
    if (userNameReq) {
      users = await fetchByName(userNameReq, res)
    } else if (userTypeReq && userStatusReq) {
      users = await fetchByTypeAndStatus(userTypeReq, userStatusReq, res)
    } else if (userTypeReq) {
      users = await fetchByType(userTypeReq, res)
    } else if (userStatusReq) {
      users = await fetchByStatus(userStatusReq, res)
    } else {
      users = await fetchAll(res)
    }
    if (users.length === 0) {
      console.log("users is null in 'exports.findAll' in 'user.controller.js', check if [name] is entered correctly")
      throw new Error()
    }
    res.status(200).send({
      message: 'Authenticated!',
      Response: ObjectConverter.userResponse(users)
    })
  } catch (err) {
    res.status(400).send({
      message: 'Internal Server Error'
    })
  }
}

exports.findById = async (req, res) => {
  const userIdReq = req.params.userId
  let user
  try {
    user = await User.find({
      userId: userIdReq
    })
    if (user.length == 0) {
      throw new Error()
    }
    res.status(200).send(ObjectConverter.userResponse(user))
  } catch (err) {
    console.error('userId not found by exports.findById method')
    res.status(500).send({
      message: `User with this id [${userIdReq}] is not present`
    })
  }
}

exports.update = async (req, res) => {
  const userIdReq = req.params.userId
  try {
    const __vUpdate = await User.findOne({ userId: userIdReq }) // fetching userID record from DB to update '__v'
    if (!__vUpdate) {
      console.log('No user is available with this data')
      throw new Error('No user is available with this data')
    }
    // console.log(__vUpdate.__v);
    const user = await User.findOneAndUpdate({
      userId: userIdReq
    }, {
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 10),
      email: req.body.email,
      updatedAt: timeNow,
      userStatus: req.body.userStatus,
      __v: __vUpdate.__v + 1
    }).exec()
    res.status(200).send({
      message: 'User record has been updated successfully'
    })
  } catch (err) {
    console.log('Error while updating the record:', err.message)
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
}

// Code added my me - START
exports.delete = async (req, res) => {
  const userIdReq = req.params.userId
  try {
    const user = await User.findOneAndDelete({ userId: userIdReq }).exec()
    if (user == null) throw Error
    console.log('Request to delete user for', user)
    res.status(200).send({
      message: 'User record has been deleted successfully'
    })
  } catch (err) {
    console.log(`Error while deleting the record, User not Present ***${err}***`)
    res.status(500).send({
      message: 'Some internal error occured'
    })
  }
}
// Code added my me - END
