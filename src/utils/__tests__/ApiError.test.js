import {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
} from "../ApiError.js";

describe("ApiError", () => {
    test("sets statusCode, message, success and data defaults", () => {
        const err = new ApiError(400, "Bad input", ["field is required"]);

        expect(err).toBeInstanceOf(Error);
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe("Bad input");
        expect(err.errors).toEqual(["field is required"]);
        expect(err.success).toBe(false);
        expect(err.data).toBeNull();
        expect(err.stack).toBeDefined();
    });

    test("defaults message and errors when not provided", () => {
        const err = new ApiError(500);

        expect(err.message).toBe("Something went wrong");
        expect(err.errors).toEqual([]);
    });

    test.each([
        [BadRequestError, 400],
        [UnauthorizedError, 401],
        [ForbiddenError, 403],
        [NotFoundError, 404],
        [ConflictError, 409],
        [InternalServerError, 500],
    ])("%p maps to statusCode %d", (ErrorClass, statusCode) => {
        const err = new ErrorClass("custom message");

        expect(err).toBeInstanceOf(ApiError);
        expect(err.statusCode).toBe(statusCode);
        expect(err.message).toBe("custom message");
    });
});
