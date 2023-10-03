const constants = require('../utils/constants')

exports.validateTicketStatus = async (req, res, next) => {
    //Validating the user type
    const status = req.body.status;
    const statusTypes = [constants.ticketStatus.open,
    constants.ticketStatus.closed, constants.ticketStatus.inProgress,
    constants.ticketStatus.blocked]

    if (status && !statusTypes.includes(status)) {
        console.log(status);
        res.status(400).send({
            message: `status provided is invalid. Possible values CLOSED
                | BLOCKED | IN_PROGESS | OPEN `
    });
        return;
    }
    next();
}