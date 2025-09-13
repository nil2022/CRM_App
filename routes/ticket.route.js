// routes/ticket.route.js
import { Router } from 'express'
import { createTicket, getAllTickets, getOneTicket, updateTicket } from '#controllers/ticket'
import { verifyToken } from '#middlewares/auth'

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: Ticket routes for CRM App
 */
const ticketRouter = Router();

  /**
   * @swagger
   * /tickets/create-ticket:
   *   post:
   *     summary: Create a ticket
   *     tags: [Ticket]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *               status:
   *                 type: string
   *               reporter:
   *                 type: string
   *               assignee:
   *                 type: string
   *             example:
   *               title: Ticket title
   *               description: Ticket description
   *               priority: LOW
   *               status: OPEN
   *               reporter: user_id
   *               assignee: user_id 
   *     responses:
   *       201:
   *         description: Ticket created
   *         content:
   *           application/json:
   *             example:
   *               data:
   *                 title: Ticket title
   *                 ticketPriority: LOW
   *                 description: Ticket description
   *                 status: OPEN
   *                 reporter: user_id
   *                 assignee: user_id
   *                 _id: ticket_id
   *                 createdAt: 2024-07-24T18:28:18.271Z
   *                 updatedAt: 2024-07-24T18:28:18.271Z
   *                 __v: 0
   *               message: Ticket created successfully
   *               statusCode: 200
   *               success: true
   */
  ticketRouter.post('/create-ticket', [verifyToken], createTicket)

  /**
   * @swagger
   * /tickets/update-ticket:
   *   patch:
   *     summary: Update a ticket
   *     tags: [Ticket]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *               status:
   *                 type: string
   *               reporter:
   *                 type: string
   *               assignee:
   *                 type: string
   *             example:
   *               title: Ticket title
   *               description: Ticket description
   *               priority: LOW
   *               status: OPEN
   *               reporter: user_id
   *               assignee: user_id 
   *     responses:
   *       200:
   *         description: Ticket updated
   *         content:
   *           application/json:
   *             example:
   *               data:
   *                 title: Ticket title
   *                 ticketPriority: LOW
   *                 description: Ticket description
   *                 status: OPEN
   *                 reporter: user_id
   *                 assignee: user_id
   *                 _id: ticket_id
   *                 createdAt: 2024-07-24T18:28:18.271Z
   *                 updatedAt: 2024-07-24T18:28:18.271Z
   *                 __v: 0
   *               message: Ticket updated successfully
   *               statusCode: 200
   *               success: true
   *       400:
   *         description: Some fields not provided
   *         content:
   *           application/json:
   *             example:
   *               message: Some fields not provided
   *               statusCode: 400
   *               success: false
   *       401:
   *         description: Unauthorized Access
   *         content:
   *           application/json:
   *             example:
   *               message: Unauthorized Access
   *               statusCode: 401
   *               success: false
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             example:
   *               message: Ticket not found !!!
   *               statusCode: 404
   *               success: false
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               message: Internal server error
   *               statusCode: 500
   *               success: false
   */
  ticketRouter.patch('/update-ticket', [verifyToken], updateTicket)

  /**
   * @swagger
   * /tickets:
   *   get:
   *     summary: Get all tickets
   *     tags: [Ticket]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tickets fetched
   *         content:
   *           application/json:
   *             example:
   *               data:
   *                 title: Ticket title
   *                 ticketPriority: LOW
   *                 description: Ticket description
   *                 status: OPEN
   *                 reporter: user_id
   *                 assignee: user_id
   *                 _id: ticket_id
   *                 createdAt: 2024-07-24T18:28:18.271Z
   *                 updatedAt: 2024-07-24T18:28:18.271Z
   *                 __v: 0
   *               message: Tickets fetched successfully
   *               statusCode: 200
   *               success: true
   *       401:
   *         description: Unauthorized Access
   *         content:
   *           application/json:
   *             example:
   *               message: Unauthorized Access
   *               statusCode: 401
   *               success: false
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               message: Internal server error
   *               statusCode: 500
   *               success: false
   */
  ticketRouter.get('/get-all-tickets', [verifyToken], getAllTickets)

  /**
   * @swagger
   * /tickets/get-ticket/?id={id}:
   *   get:
   *     summary: Get one ticket
   *     tags: [Ticket]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         type: string
   *         required: true
   *         description: Ticket id
   *         example: 123
   *     responses:
   *       200:
   *         description: Ticket fetched
   *         content:
   *           application/json:
   *             example:
   *               data:
   *                 title: Ticket title
   *                 ticketPriority: LOW
   *                 description: Ticket description
   *                 status: OPEN
   *                 reporter: user_id
   *                 assignee: user_id
   *                 _id: ticket_id
   *                 createdAt: 2024-07-24T18:28:18.271Z
   *                 updatedAt: 2024-07-24T18:28:18.271Z
   *                 __v: 0
   *               message: Ticket fetched successfully
   *               statusCode: 200
   *               success: true
   *       401:
   *         description: Unauthorized Access
   *         content:
   *           application/json:
   *             example:
   *               message: Unauthorized Access
   *               statusCode: 401
   *               success: false
   *       404:
   *         description: Ticket not found
   *         content:
   *           application/json:
   *             example:
   *               message: Ticket not found !!!
   *               statusCode: 404
   *               success: false
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               message: Internal server error
   *               statusCode: 500
   *               success: false
   */
  ticketRouter.get('/get-ticket', [verifyToken], getOneTicket)

  export default ticketRouter;