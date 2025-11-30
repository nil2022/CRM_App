// routes/admin.route.js
import { adminLogin, createSubAdmin, deleteSubAdmin, getAdmin, getAllSubAdmins, updateSubAdmin } from "#controllers/admins";
import { verifyAdminToken } from "#middlewares/adminAuth";
import { sendResponse } from "#utils/sendResponse";
import { Router } from "express";

const adminRouter = Router();

// Create a Sub-admin
adminRouter.route("/login").post(signIn);
adminRouter.route("/current-user").get(verifyAdminToken, fetchCurrenAdmin);
adminRouter.route("/").post(create).get(get).patch(update).delete(removeSubAdmin);

// -------------------------------------------------------------
// ------------------- ADMIN CRUD ------------------------------
// -------------------------------------------------------------
async function fetchCurrenAdmin(req, res, next) {
    try {
        const adminId = req.admin._id;
        const admin = await getAdmin(adminId);
        return res.status(200).json({ message: "Admin fetched successfully", data: admin });
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const payload = req.body;
        await createSubAdmin(payload);
        return res.status(201).json({ message: "Sub-admin created successfully", data: payload });
    } catch (error) {
        next(error);
    }
}

async function get(req, res, next) {
    try {
        const queryParams = req.query;
        const subAdmins = await getAllSubAdmins(queryParams);
        return res.status(200).json({ message: "Sub-admins fetched successfully", data: subAdmins });
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const subAdminId = req.params.id;
        const payload = req.body;
        await updateSubAdmin(subAdminId, payload);
        return res.status(200).json({ message: "Sub-admin updated successfully", data: payload });
    } catch (error) {
        next(error);
    }
}

async function removeSubAdmin(req, res, next) {
    try {
        const subAdminId = req.params.id;
        await deleteSubAdmin(subAdminId);
        return res.status(200).json({ message: "Sub-admin deleted successfully" });
    } catch (error) {
        next(error);
    }
}
// -------------------------------------------------------------
// ------------------- ADMIN CRUD ------------------------------
// -------------------------------------------------------------

async function signIn(req, res, next) {
    try {
        const payload = req.body;
        const { data, token } = await adminLogin(payload);
        return sendResponse(res, 200, data, "Admin logged in successfully", token);
    } catch (error) {
        next(error);
    }
}

export default adminRouter;
