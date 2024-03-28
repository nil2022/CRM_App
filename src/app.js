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
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const winston = require('winston')
const expressWinston = require('express-winston')
const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const expressSession = require('express-session')

// passport.serializeUser(function (user, done) {
//   console.log(' passport.serializeUser')
//   done(null, user)
// })

// passport.deserializeUser(function (obj, done) {
//   console.log('passport.deserializeUser')
//   done(null, obj)
// })

// passport.use(new GitHubStrategy({
//   clientID: '',
//   clientSecret: '',
//   callbackURL: 'http://localhost:5173/crm/api/auth/github/callback'
// },
// function (accessToken, refreshToken, profile, done) {
// // asynchronous verification, for effect...
//   process.nextTick(function () {
//   // To keep the example simple, the user's GitHub profile is returned to
//   // represent the logged-in user.  In a typical application, you would want
//   // to associate the GitHub account with a user record in your database,
//   // and return that user instead.
//     return done(null, profile)
//   })
// }
// ))

app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: true
  }
}))
// app.use(passport.initialize())
// app.use(passport.session())

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
  credentials: true
}))

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
    // new winston.transports.Http()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.timestamp()
  )
}))

winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
    new winston.transports.File({ filename: './logs/info.log', level: 'info' })
  ]
})

// if (process.env.NODE_ENV !== 'production') {
//   winstonLogger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }))
// }

app.use(express.urlencoded({ extended: true, limit: '16kb' })) // parse URL-encoded data & add it to the req.body object
app.use(express.json({ limit: '16kb' })) // parse JSON data & add it to the req.body object
app.use(express.static('public'))
app.use(helmet()) // helmet middleware for additional security
app.use(limiter) // express-rate-limit middleware
app.use(logger('dev'))
app.use(cookieParser())
// app.use(cookieSession({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: true
//   }
// }))

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
app.get('/crm/api/health', (req, res) => {
  res.status(200).json({
    message: 'CRM app running Successfully🚀',
    success: true
  })
})

app.use(limiter)
const authRoutes = require('./routes/auth.routes')
const ticketRoutes = require('./routes/ticket.routes')
const userRoutes = require('./routes/user.routes')
authRoutes(app)
ticketRoutes(app)
userRoutes(app)
