const User = require('../models/user.model')
const { userTypes, userStatus } = require('../utils/constants')
const bcrypt = require('bcrypt')

async function generateAccessAndRefreshToken (userId) {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken }
}

/* -------- SIGNUP API----------- */
exports.signup = async (req, res) => {
  let userStatusReq

  if (req.body.userType === userTypes.engineer ||
          req.body.userType === userTypes.admin) {
    userStatusReq = userStatus.pending
  } else {
    userStatusReq = userStatus.approved
  }

  const userObj = {
    name: req.body.name,
    userId: req.body.userId,
    email: req.body.email,
    userType: req.body.userType !== '' ? req.body.userType : userTypes.customer,
    password: bcrypt.hashSync(req.body.password, 10),
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
  const { userId, password } = req.body

  const user = await User.findOne({ userId })
  console.log('Signin Request for userId:', user.userId)

  if (!user) {
    res.status(400).send("Failed! UserId doesn't exist!")
    return
  }

  if (user.userStatus !== userStatus.approved) {
    return res.status(403).send({
      message: `Can't allow login as user is in "${user.userStatus}" status`
    })
  }

  if (typeof password !== 'string') {
    console.log(`Invalid Password! Password type is [${typeof password}]`)
    return res.status(400).send('Invalid Password!')
  }
  const passwordIsValid = bcrypt.compareSync(
    password,
    user.password
  )
  if (!passwordIsValid) {
    console.log('Invalid Password!')
    return res.status(401).send('Invalid Password!')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const signInResponse = {
    name: user.name,
    userId: user.userId,
    email: user.email,
    userType: user.userType,
    userStatus: user.userStatus,
    accessToken,
    refreshToken,
    success: true
  }

  const cookieOptions = {
    http: true,
    secure: true
  }

  return res
    .status(201)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      message: `${user.name} signed in successfully!`,
      Response: signInResponse
    })
}

/* -------- LOGOUT API----------- */
exports.logout = async (req, res) => {
  // remove the refresh token field
  // clear the cookies
  await User.findByIdAndUpdate(
    req.decoded._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  )

  const cookieOptions = {
    http: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .clearCookie('accessToken', cookieOptions)
    .send('User Logged Out Successfully !!')
}
