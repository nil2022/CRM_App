import { jest } from "@jest/globals";

const storeErrorMock = jest.fn();

jest.unstable_mockModule("../helper.js", () => ({
    storeError: storeErrorMock,
}));

const { default: errorHandler } = await import("../errorHandler.js");
const { BadRequestError } = await import("../ApiError.js");

const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("errorHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        storeErrorMock.mockReset().mockResolvedValue(undefined);
        process.env.NODE_ENV = "development";
    });

    afterAll(() => {
        process.env.NODE_ENV = originalEnv;
    });

    test("uses an ApiError's own statusCode/message/errors as-is", () => {
        const res = buildRes();
        const err = new BadRequestError("Invalid payload", ["title is required"]);

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                message: "Invalid payload",
                statusCode: 400,
                success: false,
                errors: ["title is required"],
            })
        );
    });

    test("normalizes a Mongoose CastError into a 400", () => {
        const res = buildRes();
        const err = new Error("Cast to ObjectId failed");
        err.name = "CastError";
        err.path = "id";

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].statusCode).toBe(400);
    });

    test("normalizes a duplicate-key error into a 409", () => {
        const res = buildRes();
        const err = new Error("duplicate key");
        err.code = 11000;
        err.keyValue = { userId: "john123" };

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test("falls back to a generic 500 for an unrecognized error, hiding internals in production", () => {
        const res = buildRes();
        process.env.NODE_ENV = "production";
        const err = new Error("some raw internal detail");

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        const body = res.json.mock.calls[0][0];
        expect(body.message).toBe("Something went wrong");
        expect(body.stack).toBeUndefined();
    });

    test("still sends a response even if logging the error fails", () => {
        const res = buildRes();
        storeErrorMock.mockRejectedValue(new Error("disk full"));
        const err = new BadRequestError("bad input");

        expect(() => errorHandler(err, {}, res, jest.fn())).not.toThrow();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
