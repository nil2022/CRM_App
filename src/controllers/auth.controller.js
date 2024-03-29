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
      message: 'User Registered Success',
      UserData: postResponse
    })
  } catch (err) {
    console.log('Something went wrong while saving to DB', `${err.name}:${err.message}`)
    res.status(500).send({
      message: 'Some internal error while inserting the element'
    })
  }
}

/* -------- SIGNUP USING GITHUB API----------- */
// exports.githubLogin = () => {
//   console.log('controller')
//   // write business logic for github login
//   // passport.authenticate('github', { scope: ['user:email'] })

// }

/* -------- SIGNIN API----------- */
exports.signin = async (req, res) => {
  const { userId, password } = req.body

  const user = await User.findOne({ userId: { $eq: userId.toLowerCase() } })
  console.log('Signin Request for userId:', user.userId)

  if (!user) {
    res.status(400).send("Failed! UserId doesn't exist!")
    return
  }
  /** CHECK IF PASSWORD IS IN STRING FORMAT */
  if (typeof password !== 'string') {
    console.log(`Invalid Password! Password type is [${typeof password}]`)
    return res.status(400).send('Invalid Password!')
  }
  const passwordIsValid = bcrypt.compareSync(
    password,
    user.password
  )
  /** CHECK IF PASSWORD IS VALID */
  if (!passwordIsValid) {
    console.log('Invalid Password!')
    return res.status(401).send({
      message: 'Invalid Password!'
    })
  }
  /** CHECK IF USER IS APPROVED */
  if (user.userStatus !== userStatus.approved) {
    console.log(`Can't allow login as user is in "${user.userStatus}" status`)
    return res.status(403).send({
      message: 'User not APPROVED!! \n Contact Administrator!'
    })
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const signInResponse = {
    name: user.name,
    userId: user.userId,
    email: user.email,
    userType: user.userType,
    userStatus: user.userStatus,
    accessToken,
    refreshToken
  }

  const cookieOptions = {
    http: true,
    secure: true
  }

  console.log(`${user.name} signed in successfully!`)

  return res
    .status(201)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      message: 'Login Successfull',
      Response: signInResponse,
      success: true
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

  console.log('User Logged Out Successfully !!')
  res
    .status(200)
    .clearCookie('refreshToken', cookieOptions)
    .clearCookie('accessToken', cookieOptions)
    .send({
      message: 'User Logged Out Successfully !!'
    })
}
