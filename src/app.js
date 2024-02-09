// require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet') // Add additional security headers to request
const logger = require('morgan')
const User = require('./models/user.model')
const app = express()
const bcrypt = require('bcrypt')
const constants = require('./utils/constants')
const { PORT } = require('./configs/server.config')
const { limiter } = require('./utils/api-rate-limit')

app.use(express.urlencoded({ extended: true, limit: '16kb' })) // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: '16kb' })) // parse JSON data & add it to the req.body object
app.use(cors({
  origin: process.env.CORS_ORIGIN
}))
app.use(helmet()) // helmet middleware for additional security
app.use(limiter) // express-rate-limit middleware
app.use(logger('dev'))

// Create System User and log in into App
async function initialise () {
  const user = await User.findOne({ userId: { $eq: process.env.ADMIN_USERID } })

  if (user) {
    // console.log('Admin user already present', user)
    console.log('Welcome System Administrator!')
    return
  }

  try {
    await User.create({
      name: process.env.ADMIN_NAME,
      userId: process.env.ADMIN_USERID,
      email: process.env.ADMIN_EMAIL,
      userType: constants.userTypes.admin,
      password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
      userStatus: constants.userStatus.approved
    })

    console.log(user)

    console.log('Welcome System Administrator!')
  } catch (err) {
    console.log('Error creating user!', err.message)
  }
}

mongoose.set('strictQuery', true)
// Event handlers for successful connection and connection error
mongoose.connect(process.env.DB_URL, {
  // useNewUrlParser: true,  // DEPRECATED
  // useUnifiedTopology: true  // DEPRECATED
})
// FIRST CONNECT TO MONGODB THEN START LISTENING TO REQUESTS
  .then((connect) => {
    console.log(`MongoDB Connected to Host: ${connect.connection.host}`)
    initialise()
    app.listen(PORT, () => {
      console.log(`Listening all requests on port ${PORT}`)
    })
  })
// IF DB CONNECT FAILED, CATCH ERROR
  .catch((error) => {
    console.log("Can't connect to DB:", error.message)
  })

/* ---------HOME PAGE ROUTE-------- */
app.get('/', (req, res) => {
  res.status(200).send('CRM Backend Running! 🎉')
})

// module.exports = app

require('./routes/auth.routes')(app)
app.use(limiter)
require('./routes/ticket.routes')(app)
require('./routes/user.routes')(app)
