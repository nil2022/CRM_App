import jwt from 'jsonwebtoken'
import { userTypes } from '../utils/constants.js'
import { ForbiddenError, UnauthorizedError } from '../utils/ApiError.js'

/* -------- CHECK IF TOKEN IS PROVIDED & VERIFY TOKEN ----------- */
const verifyToken = (req, res, next) => {
  // header token takes priority over the cookie, so header-authenticated requests never fall back to
  // cookie auth (they are exempt from the CSRF check in csrf.js)
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.headers['x-access-token'] || req.cookies?.accessToken

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
