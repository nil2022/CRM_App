const authController = require('../controllers/auth.controller')
const { isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided, isUserIdProvided } = require('../middlewares/validateUserRequest')

module.exports = function (app) {
  app.post('/crm/api/auth/signup', [isUserIdRegisteredOrProvided, isEmailRegisteredOrProvided, isPasswordProvided], authController.signup)

  app.post('/crm/api/auth/signin', [isUserIdProvided, isPasswordProvided], authController.signin)
}
