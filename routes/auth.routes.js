const authController = require('../controllers/auth.controller')
const { limiter } = require('../utils/api-rate-limit')
const { isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided, isUserIdProvided } = require('../middlewares/validateUserRequest')

module.exports = function (app) {
  /* ------ USER SIGNUP -------- */
  app.post('/crm/api/auth/signup', limiter, [isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided], authController.signup)
  /* ------ USER SIGNIN -------- */
  app.post('/crm/api/auth/signin', limiter, [isUserIdProvided, isPasswordProvided], authController.signin)
}
