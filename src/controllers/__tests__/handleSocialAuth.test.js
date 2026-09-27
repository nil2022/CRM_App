import { jest } from "@jest/globals";

const userFindOneMock = jest.fn();
const userFindByIdMock = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
    User: {
        findOne: userFindOneMock,
        findById: userFindByIdMock,
    },
}));

const octokitRequestMock = jest.fn();
jest.unstable_mockModule("octokit", () => ({
    Octokit: class {
        request(...args) {
            return octokitRequestMock(...args);
        }
    },
}));

const { handleSocialAuth } = await import("../auth.controller.js");
const { NotFoundError } = await import("../../utils/ApiError.js");

const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
};

// `asyncHandler` fires the wrapped handler but doesn't return its promise, so
// `await handleSocialAuth(...)` resolves before the internal awaits finish.
// A macrotask tick lets every already-queued microtask (our mocked,
// immediately-resolving model/axios calls) drain first.
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("handleSocialAuth", () => {
    beforeEach(() => {
        userFindOneMock.mockReset();
        userFindByIdMock.mockReset();
        octokitRequestMock.mockReset().mockResolvedValue({ data: [{ email: "found@example.com" }] });
    });

    test("rejects with NotFoundError instead of minting tokens for an unrelated hardcoded account", async () => {
        userFindOneMock.mockResolvedValue(null); // no local account linked to this GitHub email
        const req = { user: { accessToken: "gh-token" } };
        const res = buildRes();
        const next = jest.fn();

        handleSocialAuth(req, res, next);
        await flush();

        expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
        expect(userFindByIdMock).not.toHaveBeenCalled();
        expect(res.cookie).not.toHaveBeenCalled();
    });

    test("issues tokens for the account matched by the authenticated GitHub email, not a fixed id", async () => {
        const matchedUser = {
            _id: "matched-user-id",
            generateAccessToken: jest.fn().mockReturnValue("access-token"),
            generateRefreshToken: jest.fn().mockReturnValue("refresh-token"),
            save: jest.fn().mockResolvedValue(undefined),
        };
        userFindOneMock.mockResolvedValue({ _id: "matched-user-id" });
        userFindByIdMock.mockResolvedValue(matchedUser);

        const req = { user: { accessToken: "gh-token" } };
        const res = buildRes();
        const next = jest.fn();

        handleSocialAuth(req, res, next);
        await flush();

        expect(next).not.toHaveBeenCalled();
        // The regression this guards against: generateAccessAndRefreshToken
        // used to always be called with a hardcoded ObjectId string,
        // regardless of who authenticated via GitHub.
        expect(userFindByIdMock).toHaveBeenCalledWith("matched-user-id");
        expect(res.cookie).toHaveBeenCalledWith("accessToken", "access-token", expect.any(Object));
    });
});
