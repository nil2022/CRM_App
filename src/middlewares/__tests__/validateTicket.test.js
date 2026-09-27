import { jest } from "@jest/globals";
import { validateTicketStatus } from "../validateTicket.js";
import { BadRequestError } from "../../utils/ApiError.js";

describe("validateTicketStatus", () => {
    test("calls next() when no status is provided", async () => {
        const next = jest.fn();
        await validateTicketStatus({ body: {} }, {}, next);

        expect(next).toHaveBeenCalledWith();
    });

    test("calls next() when status is one of the allowed values", async () => {
        const next = jest.fn();
        await validateTicketStatus({ body: { status: "IN_PROGRESS" } }, {}, next);

        expect(next).toHaveBeenCalledWith();
    });

    test("forwards a BadRequestError for an unrecognized status instead of writing the response directly", async () => {
        const next = jest.fn();
        await validateTicketStatus({ body: { status: "NOT_A_REAL_STATUS" } }, {}, next);

        expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
});
