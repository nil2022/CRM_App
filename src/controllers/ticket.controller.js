import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Ticket } from "../models/ticket.model.js";
import { userTypes, userStatus, ticketStatus } from "../utils/constants.js";
import { notificationClient } from "../utils/NotificationClient.js";
import asyncHandler from "../utils/asyncHandler.js";
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../utils/ApiError.js";

/**
 * * This controller create a new Ticket requested by Customer
 */
export const createTicket = asyncHandler(async (req, res) => {
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
    const { title, description, ticketPriority } = req.body;
    if (!(title && description)) {
        console.log("Ticket title or description not provided");
        throw new BadRequestError("Ticket title or description not provided");
    }
    const ticketObject = {
        title,
        description,
        ticketPriority,
        reporter: req.decoded.userId, // this will be retrieved from the middleware
    };

    // ? Logic to find an Engineer in the Approved state
    const engineer = await User.findOne({
        userType: userTypes.engineer,
        userStatus: userStatus.approved,
        // add a availability to engineers so that they can be assigned
        // if engineer is assigned set true else false
        // availability: true // assign the ticket to the engineer
    });
    if (!engineer) {
        console.log("No Engineers/Approved Engineers available !");
        throw new InternalServerError("Something went wrong !!");
    }
    ticketObject.assignee = engineer.userId;

    const user = await User.findOne({
        _id: req.decoded._id,
    });
    if (!user) {
        console.log("User not found, Unauthorized Access !");
        throw new BadRequestError("User not found, Unauthorized Access !");
    }
    const ticket = await Ticket.create(ticketObject);

    if (ticket) {
        // Updating the customer
        user.ticketsCreated.push(ticket._id);
        await user.save({ validateBeforeSave: false });

        // Updating the Engineer
        engineer.ticketsAssigned.push(ticket._id);
        await engineer.save({ validateBeforeSave: false });

        // Send Notification to Notification Client to send email to Customers, Engineers and Admin
        notificationClient(
            ticket._id,
            `🎫Ticket with id : ${ticket._id} created, STATUS:${ticketStatus.open}`,
            ticket.description,
            `${user.fullName} <${user.email}>`,
            `${engineer.fullName} <${engineer.email}>` +
                "," +
                `${process.env.ADMIN_NAME} <${process.env.ADMIN_EMAIL}>`,
            user.fullName,
            engineer.fullName
        )

        console.log(`Ticket created successfully by userId -> [${user.userId}]`);

        return res.status(201).json({
            data: ticket,
            message: "Ticket created successfully",
            statusCode: 200,
            success: true,
        });
    }
});

/**
 * * Logic to allow ticket update ONLY by ADMIN OR ENGINEER(whom being assigned to)
 */
const canUpdate = (user, ticket) => {
    return (
        user.userId === ticket.assignee || user.userType === userTypes.admin
    );
};

/**
 * * This controller update an existing Ticket ONLY by ADMIN AND/OR ENGINEER
 */
export const updateTicket = asyncHandler(async (req, res) => {
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

    const { ticketPriority, status, assignee } = req.body;
    // if (!status) {
    //     console.log("Ticket status or assignee not provided");
    //     return res.status(400).json({
    //         data: "",
    //         message: "Some fields not provided",
    //         statusCode: 400,
    //         success: false,
    //     });
    // }

    /** get user information who is logged in now [ENGINEER OR CUSTOMER] */
    const savedUser = await User.findOne({
        userId: req.decoded.userId,
    });

    if (savedUser.userType === userTypes.customer) {
        console.log('Unauthorized Access, requires ADMIN or ENGINEER');
        throw new BadRequestError("Unauthorized Access !");
    }

    if (!mongoose.isValidObjectId(req.query.id)) {
        throw new BadRequestError("Invalid ticket id");
    }
    const ticket = await Ticket.findOne({ _id: { $eq: req.query.id } });
    if (!ticket) {
        console.log("Ticket not found in DB !!!");
        throw new NotFoundError("Ticket not found !!!");
    }


    if (canUpdate(savedUser, ticket)) {
        // ! ticket TITLE and DESCRIPTION are provided by Customer, hence DO NOT CHANGE !
        // ticket.title = title !== ''
        //   ? title
        //   : ticket.title
        // ticket.description = description !== ''
        //   ? description
        //   : ticket.description

        // Per the spec above: ADMIN may change priority/status/assignee, but
        // an ENGINEER (who only passes canUpdate() via ticket.assignee match)
        // may only change status - otherwise they could reassign the ticket
        // away or reprioritize it themselves.
        if (savedUser.userType === userTypes.admin) {
            ticket.ticketPriority =
                ticketPriority !== "" && ticketPriority !== undefined ? ticketPriority : ticket.ticketPriority;
            ticket.assignee = assignee !== "" && assignee !== undefined ? assignee : ticket.assignee;
        }
        ticket.status = status !== "" && status !== undefined ? status : ticket.status;
        await ticket.save({ validateBeforeSave: false });

        console.log(`Ticket updated successfully by userId -> [${savedUser.userId}]`);

        const engineer = await User.findOne({
            userId: { $eq: ticket.assignee },
        });

        const reporter = await User.findOne({
            userId: { $eq: ticket.reporter },
        });

        notificationClient(
            ticket._id,
            `🎫Ticket with id: '${ticket._id}' updated, STATUS:${ticket.status.toUpperCase()}`,
            ticket.description,
            `${reporter.fullName} <${reporter.email}>`,
            `${engineer.fullName} <${engineer.email}>` +
                "," +
                `${process.env.ADMIN_NAME} <${process.env.ADMIN_EMAIL}>`,
            reporter.fullName,
            engineer.fullName
        );

        return res.status(200).json({
            data: ticket,
            message: "Ticket updated successfully",
            statusCode: 200,
            success: true,
        });

    } else {
        console.log(`Unauthorized access by userId -> [${savedUser.userId}]`);
        throw new UnauthorizedError("Ticket can be updated only by ADMIN or ENGINEER");
    }
});

/**
 * * This controller fetch all the tickets
 */
export const getAllTickets = asyncHandler(async (req, res) => {
    /**
     * Use cases:
     *  - ADMIN    : should get the list of all the tickets
     *  - CUSTOMER : should get all the tickets created by him/her
     *  - ENGINEER : should get all the tickets assigned to him/her
     */
    const queryObj = {
        reporter: { $eq: "" },
        assignee: { $eq: "" },
    };

    if(req.query.status) {
        queryObj.status = { $eq: req.query.status };
    }

    const loggedInUser = await User.findOne({
        userId: { $eq: req.decoded.userId },
    });

    if (!loggedInUser) {
        console.log("No user in DB !!!");
        throw new ForbiddenError("No user in DB !!!");
    }

    if (loggedInUser.userType === userTypes.admin) {
        // * ADMIN should get all tickets regardless of usertype and ticket status

    } else if (loggedInUser.userType === userTypes.customer) {
        // * CUSTOMER should get all tickets created by him/her
        queryObj.reporter.$eq = loggedInUser.userId;
    } else {
        // * ENGINEER should get all tickets assigned to him/her
        queryObj.assignee.$eq = loggedInUser.userId;
    }
    /** if logged in user is CUSTOMER then delete assignee(ENGINEER) object from queryObj */
    if (queryObj.reporter.$eq) {
        delete queryObj.assignee;
        /** if logged in user is ENGINEER then delete reporter(CUSTOMER) object from queryObj */
    } else if (queryObj.assignee.$eq) {
        delete queryObj.reporter;
        /** if logged in user is ADMIN then delete both reporter and assignee objects from queryObj */
    } else {
        delete queryObj.assignee;
        delete queryObj.reporter;
    }

    const tickets = await Ticket.find(queryObj);

    if (tickets.length === 0) {
        console.log(`There is NO tickets`);
        return res.status(200).json({
            data: "",
            message: `There is NO tickets `,
            statusCode: 200,
            success: false,
        });
    }

    return res.status(200).json({
        data: tickets,
        message: "Tickets fetched successfully",
        statusCode: 200,
        success: true,
    });
});

/**
 * * This controller fetch ticket by id
 *
 * Authorization mirrors getAllTickets:
 *   - ADMIN    : may read any ticket
 *   - CUSTOMER : may read only tickets they reported
 *   - ENGINEER : may read only tickets assigned to them
 *
 * Without this scope, any authenticated user could read any other user's
 * private support ticket (which may contain account details, error logs,
 * or internal discussion) by scanning ticket ids — an IDOR.
 */
export const getOneTicket = asyncHandler(async (req, res) => {
    const loggedInUser = await User.findOne({
        userId: { $eq: req.decoded.userId },
    });
    if (!loggedInUser) {
        console.log("No user in DB !!!");
        throw new ForbiddenError("No user in DB !!!");
    }

    if (!mongoose.isValidObjectId(req.query.id)) {
        throw new BadRequestError("Invalid ticket id");
    }
    const ticket = await Ticket.findOne({
        _id: { $eq: req.query.id },
    });
    if (!ticket) {
        console.log("No tickets in server ");
        throw new BadRequestError("No tickets in DB");
    }

    // Role-based scope, matching getAllTickets.
    if (loggedInUser.userType !== userTypes.admin) {
        const isReporter =
            ticket.reporter && ticket.reporter === loggedInUser.userId;
        const isAssignee =
            ticket.assignee && ticket.assignee === loggedInUser.userId;
        if (!isReporter && !isAssignee) {
            console.log(`Unauthorized ticket access by userId -> [${loggedInUser.userId}]`);
            throw new ForbiddenError("Unauthorized Access !");
        }
    }

    console.log(`Ticket fetched successfully`);

    res.status(200).json({
        data: ticket,
        message: "Ticket fetched successfully",
        statusCode: 200,
        success: true,
    });
});
