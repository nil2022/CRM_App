const authController = require('../controllers/auth.controller')
const { isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided, isUserIdProvided } = require('../middlewares/validateUserRequest')
const authJwt = require('../middlewares/auth.jwt')

module.exports = function (app) {
  /* ------ USER SIGNUP -------- */
  app.post('/crm/api/auth/signup', [isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided], authController.signup)
  /* ------ USER SIGNIN -------- */
  app.post('/crm/api/auth/signin', [isUserIdProvided, isPasswordProvided], authController.signin)
  /* ------ USER LOGOUT -------- */
  app.get('/crm/api/auth/logout', [authJwt.verifyToken], authController.logout)
}
