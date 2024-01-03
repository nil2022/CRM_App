require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet') // Add additional security headers to request
// const logger = require('morgan')
const User = require('./models/user.model')
const app = express()
const bcrypt = require('bcrypt')
const constants = require('./utils/constants')
const { PORT } = require('./configs/server.config')
const dateTime = new Date()
const { limiter } = require('./utils/api-rate-limit')
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // parse JSON data & add it to the request.body object
app.use(cors())
app.use(helmet())
// app.use(logger('combined'))
app.use((req, res, next) => {
  for (const [key, value] of Object.entries(req.headers)) {
    // console.log(`${key}: ${value}`)
    if (key === 'user-agent') {
      console.log(`User-Agent: ${value}`)
    }
  }
  console.log(`IP: ${req.protocol}://${req.hostname}:${req.socket.localPort}${req.originalUrl} [${req.method}] - [${dateTime.toString()}]`)
  next()
})

// Create System User and log in into App
async function initialise () {
  const user = await User.findOne({ userId: process.env.ADMIN_USERID })

  if (user) {
    // console.log('Admin user already present', user)
    console.log('Welcome System Administrator!')
    return
  }

  try {
    const user = await User.create({
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
  res.status(200).send('<h2>CRM Backend Running! 🎉</h2>')
})

require('./routes/auth.routes')(app)
app.use(limiter)
require('./routes/ticket.routes')(app)
require('./routes/user.routes')(app)
