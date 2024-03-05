const authController = require('../controllers/auth.controller')
const { isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided, isUserIdProvided } = require('../middlewares/validateUserRequest')
const authJwt = require('../middlewares/auth.jwt')
const passport = require('passport')

module.exports = function (app) {
  /* ------ USER SIGNUP -------- */
  app.post('/crm/api/auth/signup', [isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided], authController.signup)
  /* ------ USER SIGNUP/SIGNIN WITH GITHUB -------- */
  // app.get('/crm/api/auth/github',
  //   passport.authenticate('github', { scope: ['user:email'] })
  // )
  // app.get('/crm/api/auth/github/callback',
  //   passport.authenticate('github', { failureRedirect: 'http://localhost:5173/' }),
  //   function (req, res) {
  //     res.json(req.user)
  //   })
  /* ------ USER SIGNIN -------- */
  app.post('/crm/api/auth/signin', [isUserIdProvided, isPasswordProvided], authController.signin)
  /* ------ USER LOGOUT -------- */
  app.get('/crm/api/auth/logout', [authJwt.verifyToken], authController.logout)
}
