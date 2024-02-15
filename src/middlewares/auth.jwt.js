const jwt = require('jsonwebtoken')
const constants = require('../utils/constants')

/* -------- CHECK IF TOKEN IS PROVIDED & VERIFY TOKEN ----------- */
const verifyToken = (req, res, next) => {
  // get accessToken from cookies
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '') || req.headers['x-access-token']

  if (!token) {
    return res.status(403).send({
      message: 'User not logged in or Token not provided, Please Login!'
    })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error with JWT -', err.message)
      return res.status(401).send({
        message: 'Unauthorized!'
      })
    }
    req.decoded = decoded
    next()
  })
}

/* -------- CHECK WHETHER USER IS ADMIN OR NOT ----------- */
const isAdmin = async (req, res, next) => {
  if (req.decoded.userType === constants.userTypes.admin) {
    next()
  } else {
    return res.status(403).send({
      message: 'Require Admin Role!'
    })
  }
}

module.exports = {
  verifyToken,
  isAdmin
}
