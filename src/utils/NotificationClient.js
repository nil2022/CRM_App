import axios from "axios";
import { errorLogger, infoLogger, warningLogger } from "./winstonLogger.js";

/**
 * * Send ticket email notification request to Notification Service
 */
export const notificationClient = async (
    ticketId,
    subject,
    content,
    requesterEmailIds,
    assignedToEmailIds,
    requester,
    assignedTo
) => {
    try {
        await axios({
            url: process.env.NOTIFICATION_URL,
            method: "POST",
            data: {
                subject,
                ticketId,
                content,
                requesterEmailIds,
                assignedToEmailIds,
                requester,
                assignedTo,
            },
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            infoLogger.info(`Email Sent Successfully !`);
            infoLogger.info(response.data)
            return;
        });
    } catch (err) {
        errorLogger.error("Error sending request to Notification Service:", {
            message: err.message,
            name: err.name,
            stack: err.stack,
        });
        // throw err;
    }
};
