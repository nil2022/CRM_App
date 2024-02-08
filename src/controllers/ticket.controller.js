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
                    `🎫Ticket with id : ${ticket._id} created, STATUS:${constants.ticketStatus.open}`,
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
  return user.userId === ticket.reporter ||
            user.userId === ticket.assignee ||
            user.userType === constants.userTypes.admin
}

/* -------- UPDATE A TICKET API----------- */
exports.updateTicket = async (req, res) => {
  const { title, description, ticketPriority, status, assignee } = req.body
  // console.log(`typeof title ${typeof title}`)
  if (typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof ticketPriority !== 'string' ||
      typeof status !== 'string' ||
      typeof assignee !== 'string') {
    console.log('Invalid data type')
    return res.status(400).send({
      message: 'Invalid data type'
    })
  }
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id })

    const savedUser = await User.findOne({
      userId: req.userId
    })

    if (canUpdate(savedUser, ticket)) {
      ticket.title = title !== undefined
        ? title
        : ticket.title
      ticket.description = description !== undefined
        ? description
        : ticket.description
      ticket.ticketPriority = ticketPriority !== undefined
        ? ticketPriority
        : ticket.ticketPriority
      ticket.status = status !== undefined
        ? status
        : ticket.status
      ticket.assignee = assignee !== undefined
        ? assignee
        : ticket.assignee
      await ticket.save()

      const engineer = await User.findOne({
        userId: { $eq: ticket.assignee }
      })

      const reporter = await User.findOne({
        userId: { $eq: ticket.reporter }
      })

      sendEmail(ticket._id,
            `🎫Ticket with id: '${ticket._id}' updated, STATUS:${status}`,
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
  const queryObj = {
    status: { $eq: '' },
    reporter: { $eq: '' },
    assignee: { $eq: '' }
  }

  if (req.query.status === undefined) {
    console.log('query params not provided !')
    return res.status(400).send('Resource not available !!')
  }
  try {
    // if status is not provided in query params by default we show the approved user
    queryObj.status.$eq = req.query.status.replace(/\s/g, '').toUpperCase() || constants.userStatus.approved
    /** / write regular express inside this forward slashes /
     * [ write a expression to find for '\s'-> for any whitespace character]
     * g - Global pattern flags 'g' modifier: global. All matches (don't return after first match)
     * + - Matches one or more consecutive `\s` characters.
     */

    const loggedInUser = await User.findOne({ userId: { $eq: req.userId } })
    if (!loggedInUser) {
      console.log('No user in DB !!!')
      return res.status(500).send('No user in DB !!!')
    }
    if (loggedInUser.userType === constants.userTypes.admin) {
      // Do anything
    } else if (loggedInUser.userType === constants.userTypes.customer) {
      queryObj.reporter.$eq = loggedInUser.userId
    } else {
      queryObj.assignee.$eq = loggedInUser.userId
    }
    /** if logged in user is CUSTOMER then delete assignee(ENGINEER) object from queryObj */
    if (queryObj.reporter.$eq) {
      delete queryObj.assignee
    /** if logged in user is ENGINEER then delete reporter(CUSTOMER) object from queryObj */
    } else if (queryObj.assignee.$eq) {
      delete queryObj.reporter
    /** if logged in user is ADMIN then delete both reporter and assignee objects from queryObj */
    } else {
      delete queryObj.assignee
      delete queryObj.reporter
    }

    const tickets = await Ticket.find(queryObj)

    if (tickets.length === 0) {
      console.log('tickets is null, check with status')
      return res.status(401).send({
        message: `There is NO tickets with this status [${queryObj.status.$eq}]`
      })
    }
    return res.status(200).send(objectConverter.ticketListResponse(tickets))
  } catch (error) {
    console.log(error)
    return res.status(503).send('Error', error)
  }
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
