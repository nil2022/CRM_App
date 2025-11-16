// utils/constants.util.js
export const userTypes = {
    customer: "CUSTOMER",
    engineer: "ENGINEER",
};

export const adminTypes = {
    super_admin: "SUPER_ADMIN",
    sub_admin: "SUB_ADMIN",
};

export const userAndAdminStatus = {
    active: "ACTIVE",
    inactive: "INACTIVE",
    suspended: "SUSPENDED",
};

export const ticketStatus = {
    open: "OPEN", // 🟢
    inProgress: "IN_PROGRESS", // 🔵
    blocked: "BLOCKED", // ⚫
    closed: "CLOSED", // 🔴
};

export const ticketPriority = {
    low: "LOW", // 🟢
    medium: "MEDIUM", // 🟡
    high: "HIGH", // 🟠
};

export const loginType = {
    "password": "PASSWORD",
    "otp": "OTP",
    "magic_link": "MAGIC_LINK",
}
