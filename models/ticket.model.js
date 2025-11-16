// models/ticket.model.js
import mongoose, { Schema } from "mongoose";
import { ticketPriority, ticketStatus } from "#utils/constants";

const ticketSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },
        // Relevant tags for the ticket
        tags: {
            type: [String],
            default: [],
        },

        priority: {
            type: String,
            enum: Object.values(ticketPriority),
            default: ticketPriority.low,
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(ticketStatus),
            default: ticketStatus.open,
            required: true,
        },
        // Store the IDs of Reporter (viz. The user who created the ticket)
        reporterId: {
            type: [Schema.Types.ObjectId],
            ref: "User",
        },
        // Store the IDs of Assignee (viz. The engineer(s) assigned to the ticket)
        assigneeId: {
            type: [Schema.Types.ObjectId],
            ref: "User",
        },
        // Attachments related to the ticket (Array of string of URLs or file paths)
        attachments: {
            type: [String],
            default: [],
        }
    },
    {
        timestamps: true,
        collection: "tickets",
    }
);

// Index for unique ticket created per unique user
ticketSchema.index({ title: 1, reporterId: 1 }, { unique: true });

// Index for each ticket is assigned to single engineer
ticketSchema.index({ title: 1, assigneeId: 1 });

// Index for tags to find tickets by unique tags
ticketSchema.index({ tags: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
