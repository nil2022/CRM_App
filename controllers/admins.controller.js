// controllers/admins.controller.js
import Admin from "#models/admin";
import { loginSchema } from "#validations/user";

export const createSubAdmin = async (payload) => {
    return await Admin.create(payload);
};

export const getAllSubAdmins = async () => {
    return await Admin.find({ role: "SUB_ADMIN" });
};

export const updateSubAdmin = async (subAdminId, payload) => {
    return await Admin.findByIdAndUpdate(subAdminId, payload, { new: true });
};

export const deleteSubAdmin = async (subAdminId) => {
    return await Admin.findByIdAndDelete(subAdminId);
};

export const adminLogin = async (payload) => {
    const { error, value } = loginSchema.validate(payload);
    if (error) {
        throw {
            statusCode: 400,
            message: error.details[0].message,
        };
    }

    const { email, password } = value;
    const fetchAdmin = await Admin.findOne({ email }).select("password email isEmailVerified lastLogin status role");
    if (!fetchAdmin) {
        throw {
            statusCode: 401,
            message: "Admin with this email does not exist",
        };
    }

    const isPasswordValid = await fetchAdmin.isValidPassword(password);
    if (!isPasswordValid) {
        throw {
            statusCode: 401,
            message: "Invalid password",
        };
    }

    const token = fetchAdmin.generateAuthToken();

    // Update last login time
    fetchAdmin.lastLogin = new Date();
    await fetchAdmin.save();

    // Convert to a plain object to remove the password
    const adminObject = fetchAdmin.toObject();
    delete adminObject.password;

    return { data: adminObject, token };
};
