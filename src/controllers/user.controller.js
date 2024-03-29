/**
 * Controllers for the user resources.
 * Only the user of type ADMIN should be able to perform the operations
 * defined in the User Controller
 */
const bcrypt = require('bcrypt')
const User = require('../models/user.model')
const ObjectConverter = require('../utils/objectConverter')

const fetchAll = async (res) => {
  let users
  try {
    users = await User.find().select('-password -createdAt -updatedAt -refreshToken -ticketsCreated -ticketsAssigned -__v')
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
      userType: { $eq: userTypeReq },
      userStatus: { $eq: userStatusReq } // $eq operator userStatusReq
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
      userType: { $eq: userTypeReq }
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
      userStatus: { $eq: userStatusReq }
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
      message: 'Data fetched successfully!',
      Response: users
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
    if (user.length === 0) {
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
  const { name, email, userStatus } = req.body
  if (typeof name !== 'string' || typeof email !== 'string' || typeof userStatus !== 'string') {
    console.log('Invalid data type, check either name, email or userStatus is missing or not')
    return res.status(400).send({
      message: 'either [name], [email], [password] or [userStatus] is missing'
    })
  }
  const userIdReq = req.params.userId
  try {
    const fetchedUser = await User.findOne({ userId: { $eq: userIdReq } }).select(' -createdAt -updatedAt -ticketsCreated -ticketsAssigned ')

    const user = await User.findOneAndUpdate({
      userId: { $eq: userIdReq }
    }, {
      name: name !== '' ? name : fetchedUser.name,
      password: req.body.password !== '' ? bcrypt.hashSync(req.body.password, 10) : fetchedUser.password,
      email: email !== '' ? email : fetchedUser.email,
      updatedAt: Date.now(),
      userStatus: userStatus !== '' ? userStatus.toUpperCase() : fetchedUser.userStatus
    }, {
      new: true
    }).select(' -createdAt -updatedAt -ticketsCreated -ticketsAssigned -password -__v')

    if (user === null) {
      console.log('user is not in DB !!')
      return res.status(400).send('User is not in server !!')
    }
    return res.status(200).send({
      message: 'User record has been updated successfully',
      user
    })
  } catch (err) {
    console.log('Error while updating the record:', err.message)
    res.status(500).send({
      message: 'Something went wrong !'
    })
  }
}

// Code added my me - START
exports.delete = async (req, res) => {
  const userIdReq = req.query.userId.replace(/\s/g, '')
  try {
    const user = await User.findOneAndDelete({ userId: userIdReq }).select(
      ' -updatedAt -ticketsCreated -ticketsAssigned -password -__v'
    )
    if (user == null) {
      console.log('user is not in DB !!')
      return res.status(400).send('User is not in server !!')
    }
    console.log('Request received to delete user for', user)
    res.status(200).send({
      message: 'User record has been deleted successfully'
    })
  } catch (err) {
    console.log(`Error while deleting the record, User not Present ***${err}***`)
    res.status(500).send({
      message: 'Something went wrong !'
    })
  }
}
// Code added my me - END
