import { ticketStatus } from "../utils/constants.js";
import asyncHandler from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/ApiError.js";

/* -------- CHECK WHETHER TICKET STATUS IS ONE OF THE ALLOWED VALUES ----------- */
export const validateTicketStatus = asyncHandler(async (req, res, next) => {
    const status = req.body.status;
    const statusTypes = Object.values(ticketStatus);

    if (status && !statusTypes.includes(status)) {
        throw new BadRequestError(
            `status provided is invalid. Possible values: ${statusTypes.join(" | ")}`
        );
    }
    next();
});
