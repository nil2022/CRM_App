/* eslint-disable eqeqeq */
const User = require('../models/user.model')
const Ticket = require('../models/ticket.model')
const constants = require('../utils/constants')
const objectConverter = require('../utils/objectConverter')
const sendEmail = require('../utils/NotificationClient')
const ObjectId = require('mongoose').Types.ObjectId

/** * -------- VALIDATE OBJECT ID */
function isValidObjectId (id) {
  if (ObjectId.isValid(id)) {
    if ((String)(new ObjectId(id)) === id) { return true }
    return false
  }
  return false
}

/* -------- CREATE A TICKET API----------- */
exports.createTicket = async (req, res) => {
  // create a ticket based on details provided by user (CUSTOMER OR ADMIN)
  // get the req.body object -> title, description, ticketPriority(if required by ADMIN)
  // create a ticket object with details provided by user
  // find an engineer in approved state and check if available
  // assign ticket to available engineer
  // fetch user details using _id from decoded accessToken
  // create ticket(save ticket in DB)
  // push ticket id to CUSTOMER's user data and ENGINEER's user data and save to DB!
  // send email to CUSTOMER and ENGINEER using Notification Client(axios request)
  // return response to user(FRONTEND)
  const { title, description, ticketPriority } = req.body
  if (!(title && description)) {
    console.log('Ticket title or description not provided')
    return res.status(400).send({ message: 'Ticket title or description not provided' })
  }
  const ticketObject = {
    title,
    description,
    ticketPriority,
    reporter: req.decoded.userId // this will be retrieved from the middleware
  }
  try {
  /**
    * Logic to find an Engineer in the Approved state
    */
    const engineer = await User.findOne({
      userType: constants.userTypes.engineer,
      userStatus: constants.userStatus.approved
    // add a availability to engineers so that they can be assigned
    // if engineer is assigned set true else false
    // availability: true // assign the ticket to the engineer
    })
    if (!engineer) {
      console.log('No Engineers/Approved Engineers available')
      return res.status(500).send({
        message: 'Some Internal error occured'
      })
    }
    ticketObject.assignee = engineer.userId

    const user = await User.findOne({
      _id: req.decoded._id
    })
    if (!user) {
      console.log('User not found in DB !!!')
      return res.status(400).send({ message: 'User not found, Unauthorized Access !' })
    }
    const ticket = await Ticket.create(ticketObject)

    if (ticket) {
      // Updating the customer
      user.ticketsCreated.push(ticket._id)
      await user.save({ validateBeforeSave: false })

      // Updating the Engineer
      engineer.ticketsAssigned.push(ticket._id)
      await engineer.save({ validateBeforeSave: false })

      // Send Notification to Notification Client to Send mail to Users, Engineers and Admin
      sendEmail(
        ticket._id,
        `🎫Ticket with id : ${ticket._id} created, STATUS:${constants.ticketStatus.open}`,
        ticket.description,
        `${user.name} <${user.email}>`,
        `${engineer.name} <${engineer.email}>` + ',' + `${process.env.ADMIN_NAME} <${process.env.ADMIN_EMAIL}>`,
        user.name,
        engineer.name
      )

      return res.status(201).send(objectConverter.ticketResponse(ticket))
    }
  } catch (err) {
    console.log('Some error happened while creating ticket:', err)
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
  /** get req.body object -> ticketPriority, status, assignee (SHOULD BE ADMIN OR ENGINEER)
   *  ADMIN -> can update ticketPriority, status, assignee
   *  ENGINEER -> can only update status
   *  check if provided ticket id is valid Mongoose ObjectId
   *  get user information who is logged in now [ENGINEER OR CUSTOMER OR ADMIN]
   *  if user is CUSTOMER return response Unauthorized Access
   *  fetch ticket using _id from req.query params
   *  save updated ticket details in DB
   *  fetch ENGINEER and reporter(CUSTOMER OR ADMIN) details from DB
   *  send email to ENGINEER and reporter using Notification Client(axios request)
   *  return response
   *  additional check -> if a user trying to update ticket not created by him/her
   *  return response Unauthorized access can only update ticket created by him/her
   */

  const { ticketPriority, status, assignee } = req.body

  if (typeof ticketPriority !== 'string' ||
      typeof status !== 'string' ||
      typeof assignee !== 'string') {
    console.log('Invalid data type')
    return res.status(400).send({
      message: 'Invalid data type'
    })
  }
  try {
    if (!isValidObjectId(req.query.id)) {
      console.log('Invalid TicketID')
      return res.status(400).send({
        message: 'Invalid TicketID'
      })
    }

    /** get user information who is logged in now [ENGINEER OR CUSTOMER] */
    const savedUser = await User.findOne({
      userId: req.decoded.userId
    })

    if (savedUser.userType === constants.userTypes.customer) {
      console.log('Unauthorized Access, requires ADMIN or ENGINEER')
      return res.status(400).send({
        message: 'Unauthorized Access !!'
      })
    }

    const ticket = await Ticket.findOne({ _id: req.query.id })
    if (!ticket) {
      console.log('Ticket not found in DB !!!')
      return res.status(400).send({
        message: 'Ticket not found !!!'
      })
    }

    if (canUpdate(savedUser, ticket)) {
      /** ticket TITLE and DESCRIPTION are provided by Customer, do not change ! */
      // ticket.title = title !== ''
      //   ? title
      //   : ticket.title
      // ticket.description = description !== ''
      //   ? description
      //   : ticket.description
      ticket.ticketPriority = ticketPriority !== ''
        ? ticketPriority
        : ticket.ticketPriority
      ticket.status = status !== ''
        ? status
        : ticket.status
      ticket.assignee = assignee !== ''
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
            `🎫Ticket with id: '${ticket._id}' updated, STATUS:${status.toUpperCase()}`,
            ticket.description,
            `${reporter.name} <${reporter.email}>`,
            `${engineer.name} <${engineer.email}>` + ',' + `${process.env.ADMIN_NAME} <${process.env.ADMIN_EMAIL}>`,
            reporter.name,
            engineer.name
      )
      return res.status(200).send(objectConverter.ticketResponse(ticket))
    } else {
      console.log('Ticket update was attempted by someone without access to the ticket')
      return res.status(401).send({
        message: 'Ticket can be updated only by the customer who created it'
      })
    }
  } catch (error) {
    console.log('Error:', error)
    return res.status(500).send('Some Internal Error Occured!', error.message)
  }
}

/* -------- GET ALL TICKETS API----------- */
exports.getAllTickets = async (req, res) => {
  /**
     * Use cases:
     *  - ADMIN    : should get the list of all the tickets of any status
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

    const loggedInUser = await User.findOne({ userId: { $eq: req.decoded.userId } })
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
    /** validate Ticket id ( Mongodb ObjectID ) */
    if (!isValidObjectId(req.query.id)) {
      console.log('Invalid TicketID')
      return res.status(400).send({
        message: 'Invalid TicketID'
      })
    }
    const ticket = await Ticket.findOne({
      _id: req.query.id
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
