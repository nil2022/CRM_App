import { jest } from "@jest/globals";

const userFindOneMock = jest.fn();
const ticketFindOneMock = jest.fn();
const notificationClientMock = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
    User: { findOne: userFindOneMock },
}));
jest.unstable_mockModule("../../models/ticket.model.js", () => ({
    Ticket: { findOne: ticketFindOneMock },
}));
jest.unstable_mockModule("../../utils/NotificationClient.js", () => ({
    notificationClient: notificationClientMock,
}));

const { updateTicket } = await import("../ticket.controller.js");
const { userTypes } = await import("../../utils/constants.js");

const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// `asyncHandler` fires the wrapped handler but doesn't return its promise, so
// awaiting the call directly resolves before the internal awaits finish. A
// macrotask tick lets every already-queued microtask (our mocked,
// immediately-resolving model calls) drain first.
const flush = () => new Promise((resolve) => setImmediate(resolve));

const buildTicket = () => ({
    _id: "507f1f77bcf86cd799439011",
    ticketPriority: "LOW",
    status: "OPEN",
    assignee: "engineer1",
    reporter: "customer1",
    save: jest.fn().mockResolvedValue(undefined),
});

describe("updateTicket - field-level authorization", () => {
    beforeEach(() => {
        userFindOneMock.mockReset();
        ticketFindOneMock.mockReset();
        notificationClientMock.mockReset();
    });

    test("an ENGINEER assigned to the ticket may change status, but not priority or assignee", async () => {
        const ticket = buildTicket();
        ticketFindOneMock.mockResolvedValue(ticket);
        userFindOneMock
            .mockResolvedValueOnce({ userId: "engineer1", userType: userTypes.engineer }) // savedUser (caller)
            .mockResolvedValueOnce({ userId: "engineer1", fullName: "Eng", email: "e@x.com" }) // engineer lookup
            .mockResolvedValueOnce({ userId: "customer1", fullName: "Cust", email: "c@x.com" }); // reporter lookup

        const req = {
            decoded: { userId: "engineer1" },
            query: { id: "507f1f77bcf86cd799439011" },
            body: { ticketPriority: "HIGH", status: "IN_PROGRESS", assignee: "someone-else" },
        };
        const res = buildRes();

        updateTicket(req, res, jest.fn());
        await flush();

        expect(ticket.status).toBe("IN_PROGRESS"); // engineer CAN change status
        expect(ticket.ticketPriority).toBe("LOW"); // engineer CANNOT change priority
        expect(ticket.assignee).toBe("engineer1"); // engineer CANNOT reassign
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("an ADMIN may change priority, status, and assignee together", async () => {
        const ticket = buildTicket();
        ticketFindOneMock.mockResolvedValue(ticket);
        userFindOneMock
            .mockResolvedValueOnce({ userId: "admin1", userType: userTypes.admin })
            .mockResolvedValueOnce({ userId: "someone-else", fullName: "New Eng", email: "ne@x.com" })
            .mockResolvedValueOnce({ userId: "customer1", fullName: "Cust", email: "c@x.com" });

        const req = {
            decoded: { userId: "admin1" },
            query: { id: "507f1f77bcf86cd799439011" },
            body: { ticketPriority: "HIGH", status: "IN_PROGRESS", assignee: "someone-else" },
        };
        const res = buildRes();

        updateTicket(req, res, jest.fn());
        await flush();

        expect(ticket.status).toBe("IN_PROGRESS");
        expect(ticket.ticketPriority).toBe("HIGH");
        expect(ticket.assignee).toBe("someone-else");
    });

    test("does not crash when status is omitted (e.g. an admin only changing priority)", async () => {
        const ticket = buildTicket();
        ticketFindOneMock.mockResolvedValue(ticket);
        userFindOneMock
            .mockResolvedValueOnce({ userId: "admin1", userType: userTypes.admin })
            .mockResolvedValueOnce({ userId: "engineer1", fullName: "Eng", email: "e@x.com" })
            .mockResolvedValueOnce({ userId: "customer1", fullName: "Cust", email: "c@x.com" });

        const req = {
            decoded: { userId: "admin1" },
            query: { id: "507f1f77bcf86cd799439011" },
            body: { ticketPriority: "HIGH" }, // no `status` field at all
        };
        const res = buildRes();
        const next = jest.fn();

        updateTicket(req, res, next);
        await flush();

        expect(next).not.toHaveBeenCalled(); // regression: used to throw via status.toUpperCase()
        expect(ticket.status).toBe("OPEN"); // unchanged
        expect(ticket.ticketPriority).toBe("HIGH");
    });
});
