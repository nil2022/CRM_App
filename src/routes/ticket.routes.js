const ticketController = require('../controllers/ticket.controller')
const authJWT = require('../middlewares/auth.jwt')

module.exports = function (app) {
  /* ----- CREATE A TICKET API -------- */
  app.post('/crm/api/tickets/',
    [authJWT.verifyToken],
    ticketController.createTicket)
  /* ----- UPDATE A TICKET API -------- */
  app.put('/crm/api/ticket/:id',
    [authJWT.verifyToken],
    ticketController.updateTicket)
  /* ----- GET ALL TICKETS API -------- */
  app.get('/crm/api/tickets/',
    [authJWT.verifyToken],
    ticketController.getAllTickets)
  /* ----- GET A TICKET API -------- */
  app.get('/crm/api/ticket/:id',
    [authJWT.verifyToken],
    ticketController.getOneTicket)
}
