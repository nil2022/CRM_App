const authJwt = require('../middlewares/auth.jwt')
const userController = require('../controllers/user.controller')
module.exports = function (app) {
  /* ------ GET ALL USERS API -------- */
  app.get('/crm/api/users/',
    authJwt.verifyToken,
    authJwt.isAdmin,
    userController.findAll)
  /* ------ GET A USER API -------- */
  app.get('/crm/api/users/:userId',
    [authJwt.verifyToken,
      authJwt.isAdmin],
    userController.findById)
  /* ----- UPDATE A USER API -------- */
  app.put('/crm/api/users/:userId',
    [authJwt.verifyToken,
      authJwt.isAdmin],
    userController.update)
  /* ----- DELETE A USER API -------- */
  app.delete('/crm/api/users/delete/:userId',
    [authJwt.verifyToken,
      authJwt.isAdmin],
    userController.delete)
}
