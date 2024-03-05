const express = require('express')
const passport = require('passport')
const util = require('util')
const session = require('express-session')
// const methodOverride = require('method-override')
const GitHubStrategy = require('passport-github2').Strategy
// const partials = require('express-partials')

const GITHUB_CLIENT_ID = '794ea66a710d1cd83f0e' // Nil2022 OAuth
const GITHUB_CLIENT_SECRET = 'd57a124b5b26a8a8d4e6384810169fcb5352628b' // Nil2022 OAuth

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.

exports.githubAuthorization = async (req, res) => {
  passport.serializeUser(function (user, done) {
    console.log(' passport.serializeUser')
    done(null, user)
  })

  passport.deserializeUser(function (obj, done) {
    console.log('passport.deserializeUser')
    done(null, obj)
  })

  // Use the GitHubStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and GitHub
  //   profile), and invoke a callback with a user object.
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: '/crm/api/auth/github/callback'
  },
  function (accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
    process.nextTick(function () {
    // To keep the example simple, the user's GitHub profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the GitHub account with a user record in your database,
    // and return that user instead.
      return done(null, profile)
    })
  }
  ))

  // configure Express
  // app.set('views', __dirname + '/views')
  //   app.set('view engine', 'ejs')
  // app.use(partials())

  // app.use(methodOverride())

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize())
  app.use(passport.session())
  // app.use(express.static(__dirname + '/public'))

//   app.get('/', function (req, res) {
//     res.send('Hii')
//   })

  // app.get('/account', ensureAuthenticated, function (req, res) {
  //   // res.render('account', { user: req.user });
  //   res.json({
  //     user: req.user
  //   })
  // })

  // app.get('/login', function (req, res) {
  //   res.render('login', { user: req.user })
  // })

  // GET /auth/github
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in GitHub authentication will involve redirecting
  //   the user to github.com.  After authorization, GitHub will redirect the user
  //   back to this application at /auth/github/callback

  passport.authenticate('github', {
    scope:
    ['user:email']
  })
  // function (req, res) {
  // // The request will be redirected to GitHub for authentication, so this
  // // function will not be called.
  // })

  // GET /auth/github/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function will be called,
  //   which, in this example, will redirect the user to the home page.
//   app.get('/crm/api/auth/github/callback',
//     passport.authenticate('github', { failureRedirect: '/crm/api/auth/signin' }),
//     function (req, res) {
//       res.redirect('/')
//     })

//   app.get('/crm/api/auth/logout', function (req, res) {
//     req.logout(() => {
//       res.redirect('/crm/api/auth/signin')
//     })
//   })

  //   app.listen(3000)

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
//   function ensureAuthenticated (req, res, next) {
//     if (req.isAuthenticated()) { return next() }
//     res.redirect('/crm/api/auth/signin')
//   }
}
