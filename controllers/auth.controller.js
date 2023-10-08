const User = require('../models/user.model')
const { userTypes, userStatus } = require('../utils/constants')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/* -------- SIGNUP API----------- */
exports.signup = async (req, res) => {
  let userStatusReq

  if (req.body.userType === userTypes.engineer ||
          req.body.userType === userTypes.admin) {
    userStatusReq = userStatus.pending
  } else {
    userStatusReq = userStatus.approved
  }

  const salt = await bcrypt.genSalt(10) // Salt generate to Hash Password
  const userObj = {
    name: req.body.name,
    userId: req.body.userId,
    email: req.body.email,
    userType: req.body.userType,
    password: bcrypt.hashSync(req.body.password, salt),
    userStatus: userStatusReq
  }

  try {
    const userCreated = await User.create(userObj)
    const postResponse = {
      name: userCreated.name,
      userId: userCreated.userId,
      email: userCreated.email,
      userType: userCreated.userType,
      userStatus: userCreated.userStatus,
      createdAt: userCreated.createdAt
    }
    console.log({
      Message: 'User Created Successfully',
      Response: postResponse
    })

    res.status(201).send({
      Message: 'User Registered Success',
      UserData: postResponse
    })
  } catch (err) {
    console.log('Something went wrong while saving to DB', `${err.name}:${err.message}`)
    res.status(500).send({
      message: 'Some internal error while inserting the element'
    })
  }
}

/* -------- SIGNIN API----------- */
exports.signin = async (req, res) => {
  const user = await User.findOne({ userId: req.body.userId })
  console.log('Signin Request for ', user)

  if (!user) {
    res.status(400).send("<h1>Failed! UserId doesn't exist!</h1>")
    return
  }

  if (user.userStatus !== userStatus.approved) {
    res.status(403).send({
      message: `Can't allow login as user is in status : [${user.userStatus}]`
    })
    return
  }

  const passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.password
  )

  if (!passwordIsValid) {
    console.log('Invalid Password!')
    res.status(401).send('Invalid Password!')
    return
  }
  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
    expiresIn: '7d' // 7 Days
  })

  const signInResponse = {
    name: user.name,
    userId: user.userId,
    email: user.email,
    userType: user.userType,
    userStatus: user.userStatus,
    accessToken: token
  }
  res.status(201).send({
    message: 'Signed in successfully!',
    Response: signInResponse
  })
}
