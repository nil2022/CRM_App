import { Router } from 'express'
import { createTicket, getAllTickets, getOneTicket, updateTicket } from '../controllers/ticket.controller.js'
import { verifyToken } from '../middlewares/auth.jwt.js'

const router = Router();

  /* ----- CREATE A TICKET API -------- */
  router.post('/create-ticket', [verifyToken], createTicket)

  /* ----- UPDATE A TICKET API -------- */
  router.patch('/update-ticket', [verifyToken], updateTicket)

  /* ----- GET ALL TICKETS API -------- */
  router.get('/', [verifyToken], getAllTickets)

  /* ----- GET A TICKET API -------- */
  router.get('/get-ticket', [verifyToken], getOneTicket)

  export default router;