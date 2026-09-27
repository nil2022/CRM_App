import jwt from 'jsonwebtoken'
import { userTypes } from '../utils/constants.js'
import { ForbiddenError, UnauthorizedError } from '../utils/ApiError.js'

/* -------- CHECK IF TOKEN IS PROVIDED & VERIFY TOKEN ----------- */
const verifyToken = (req, res, next) => {
  // get accessToken from cookies

  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '') || req.headers['x-access-token']

  if (!token) {
    console.log('User not logged in or Token not provided, Please Login!')
    return next(new ForbiddenError('User not logged in or Token not provided, Please Login!'))
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(`Session(JWT Token) Expired! Please Re-Login! -> [${err.message}]`)
      return next(new UnauthorizedError('Session Expired, Please Re-Login!'))
    }
    req.decoded = decoded
    next()
  })
}


/* -------- CHECK WHETHER USER IS ADMIN OR NOT ----------- */
const isAdmin = async (req, res, next) => {
  if (req.decoded.userType === userTypes.admin) {
    next()
  } else {
    console.log('Access denied, Require Admin Role!')
    return next(new UnauthorizedError('Access denied, Require Admin Role!'))
  }
}

export {
  verifyToken,
  isAdmin
}
