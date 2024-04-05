const userTypes = {
    customer: "CUSTOMER",
    engineer: "ENGINEER",
    admin: "ADMIN",
};
const userStatus = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
};
const ticketStatus = {
    open: "OPEN",
    inProgress: "IN_PROGRESS",
    blocked: "BLOCKED",
    closed: "CLOSED",
};

const ticketPriority = {
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    critical: "CRITICAL",
};

export { userTypes, userStatus, ticketStatus, ticketPriority };
