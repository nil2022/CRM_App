/* eslint-disable eqeqeq */
const User = require('../models/user.model')
const Ticket = require('../models/ticket.model')
const constants = require('../utils/constants')
const objectConverter = require('../utils/objectConverter')
const sendEmail = require('../utils/NotificationClient')

/* -------- CREATE A TICKET API----------- */
exports.createTicket = async (req, res) => {
  const ticketObject = {
    title: req.body.title,
    ticketPriority: req.body.ticketPriority,
    description: req.body.description,
    status: req.body.status,
    reporter: req.userId // this will be retrieved from the middleware
  }
  /**
    * Logic to find an Engineer in the Approved state
    */
  const engineer = await User.findOne({
    userType: constants.userTypes.engineer,
    userStatus: constants.userStatus.approved
  })

  try {
    if (!engineer) {
      console.log('No Engineers/Approved Engineers available')
      return res.status(500).send({
        message: 'Some Internal error occured'
      })
    }
    ticketObject.assignee = engineer.userId
    const ticket = await Ticket.create(ticketObject)

    if (ticket) {
      // Updating the customer
      const user = await User.findOne({
        userId: req.userId
      })
      user.ticketsCreated.push(ticket._id)
      await user.save()

      // Updating the Engineer
      engineer.ticketsAssigned.push(ticket._id)
      await engineer.save()

      // Send Notification to Notification CLient to Send mail to Users
      sendEmail(ticket._id,
                    `🎫Ticket with id : ${ticket._id} created`,
                    ticket.description,
                    user.email + ',' + engineer.email,
                    user.name
      )

      res.status(201).send(objectConverter.ticketResponse(ticket))
    }
  } catch (err) {
    console.log('Some error happened while creating ticket:', err.message)
    res.status(500).send({
      message: 'Some internal server error'
    })
  }
}

const canUpdate = (user, ticket) => {
  return user.userId == ticket.reporter ||
            user.userId == ticket.assignee ||
            user.userType == constants.userTypes.admin
}

/* -------- UPDATE A TICKET API----------- */
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id })

    const savedUser = await User.findOne({
      userId: req.userId
    })

    if (canUpdate(savedUser, ticket)) {
      ticket.title = req.body.title != undefined
        ? req.body.title
        : ticket.title
      ticket.description = req.body.description != undefined
        ? req.body.description
        : ticket.description
      ticket.ticketPriority = req.body.ticketPriority != undefined
        ? req.body.ticketPriority
        : ticket.ticketPriority
      ticket.status = req.body.status != undefined
        ? req.body.status
        : ticket.status
      ticket.assignee = req.body.assignee != undefined
        ? req.body.assignee
        : ticket.assignee
      await ticket.save()

      const engineer = await User.findOne({
        userId: ticket.assignee
      })

      const reporter = await User.findOne({
        userId: ticket.reporter
      })

      sendEmail(ticket._id,
            `🎫Ticket with id: '${ticket._id}' updated`,
            ticket.description,
            savedUser.email + ',' + engineer.email + ',' + reporter.email,
            savedUser.name
      )

      res.status(200).send(objectConverter.ticketResponse(ticket))
    } else {
      console.log('Ticket update was attempted by someone without access to the ticket')
      res.status(401).send({
        message: 'Ticket can be updated only by the customer who created it'
      })
    }
  } catch (error) {
    console.log('Error:', error)
    res.status(500).send('Some Internal Error Occured!', error.message)
  }
}

/* -------- GET ALL TICKETS API----------- */
exports.getAllTickets = async (req, res) => {
  /**
     * Use cases:
     *  - ADMIN    : should get the list of all the tickets
     *  - CUSTOMER : should get all the tickets created by him/her
     *  - ENGINEER : should get all the tickets assigned to him/her
     */
  const queryObj = {}
  // if status is not provided in query params by default we show the approved user
  queryObj.status = req.query.status || constants.userStatus.approved

  // if (req.query.status != undefined) {
  //   queryObj.status = req.query.status
  // }

  const savedUser = await User.findOne({ userid: req.body.userId })

  if (savedUser.userType == constants.userTypes.admin) {
    // Do anything
  } else if (savedUser.userType == constants.userTypes.customer) {
    queryObj.reporter = savedUser.userId
  } else {
    queryObj.assignee = savedUser.userId
  }

  const tickets = await Ticket.find(queryObj)
  if (tickets.length == 0) {
    console.log('tickets is NULL, check with status')
    return res.status(401).send({
      message: `There is NO tickets with this status [${queryObj.status}]`
    })
  }
  res.status(200).send(objectConverter.ticketListResponse(tickets))
}

/* -------- GET A TICKET API----------- */
exports.getOneTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id
    })
    if (!ticket) throw new Error('No tickets in DB')
    res.status(200).send(objectConverter.ticketResponse(ticket))
  } catch (err) {
    console.log('Ticket Id entered wrong, pls check --> ', err.message)
    res.status(400).send({
      message: 'WRONG ticket ID!'
    })
  }
}
