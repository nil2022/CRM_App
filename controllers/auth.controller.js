const User = require('../models/user.model')
const constants = require('../utils/constants')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res) => {
  let userStatus
  // code added by me -> START
  const user = await User.findOne({ userId: req.body.userId })
  if (user) {
    console.log(`'${user}' user already present in DB`)
    return res.status(403).send({
      message: `'${user.userId}' user already present`
    })
  }
  // code added by me -> END
  if (req.body.userType == constants.userTypes.engineer ||
        req.body.userType == constants.userTypes.admin) {
    userStatus = constants.userStatus.pending
  } else {
    userStatus = constants.userStatus.approved
  }

  const salt = await bcrypt.genSalt(10) // Salt generate to Hash Password
  const userObj = {
    name: req.body.name,
    userId: req.body.userId,
    email: req.body.email,
    userType: req.body.userType,
    password: bcrypt.hashSync(req.body.password, salt),
    userStatus
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

exports.signin = async (req, res) => {
  const user = await User.findOne({ userId: req.body.userId })
  console.log('Signin Request for ', user)

  if (!user) {
    res.status(400).send("<h1>Failed! UserId doesn't exist!</h1>")
    return
  }

  if (user.userStatus != constants.userStatus.approved) {
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
    res.status(401).send('<h1>Invalid Password!</h1>')
    return
  }
  const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
    expiresIn: '1d' // 24 hours
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
