const authController = require('../controllers/auth.controller')
const { isUserIdRegistered, isEmailRegistered } = require('../middlewares/authjwt')

module.exports = function (app) {
  app.post('/crm/api/auth/signup', [isUserIdRegistered, isEmailRegistered], authController.signup)

  app.post('/crm/api/auth/signin', authController.signin)
}
