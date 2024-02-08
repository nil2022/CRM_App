// require('dotenv').config()

let PORT = 4500

if (process.env.NODE_ENV !== 'development') {
  PORT = process.env.PORT
}

module.exports = {
  PORT
}
