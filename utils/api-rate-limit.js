require('dotenv').config()
const { rateLimit } = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_TIME * 60 * 1000 || 15 * 60 * 1000, // default is 15 minutes
  max: process.env.MAX_REQUESTS || 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: async (req, res) => {
    console.log(`\n${req.protocol}://${req.hostname}:${req.socket.localPort}${req.originalUrl} [${req.method}] -> API is Rate-limited\n`)
    return res.status(429).json({
      message: 'Too many requests, please try again later.'
    })
  }
})

module.exports = {
  limiter
}
