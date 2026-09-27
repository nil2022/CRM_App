import { jest } from "@jest/globals";
import asyncHandler from "../asyncHandler.js";

describe("asyncHandler", () => {
    test("calls the wrapped handler with (req, res, next)", async () => {
        const req = {};
        const res = {};
        const next = jest.fn();
        const handler = jest.fn().mockResolvedValue(undefined);

        await asyncHandler(handler)(req, res, next);

        expect(handler).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    test("forwards a rejected promise to next()", async () => {
        const error = new Error("boom");
        const handler = jest.fn().mockRejectedValue(error);
        const next = jest.fn();

        await asyncHandler(handler)({}, {}, next);
        // let the microtask queue flush the .catch(next)
        await Promise.resolve();

        expect(next).toHaveBeenCalledWith(error);
    });

    test("forwards a synchronously thrown error to next()", async () => {
        const error = new Error("sync boom");
        const handler = jest.fn(() => {
            throw error;
        });
        const next = jest.fn();

        await asyncHandler(handler)({}, {}, next);
        await Promise.resolve();

        expect(next).toHaveBeenCalledWith(error);
    });
});
