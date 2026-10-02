import { jest } from "@jest/globals";
import { csrfProtection, generateCsrfToken } from "../csrf.js";
import { ForbiddenError } from "../../utils/ApiError.js";

const makeReq = ({ method = "POST", cookies = {}, headers = {} } = {}) => {
    const lowered = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    return { method, cookies, header: (name) => lowered[name.toLowerCase()] };
};

describe("csrfProtection", () => {
    test("lets safe methods through even with auth cookies", () => {
        const next = jest.fn();
        csrfProtection(makeReq({ method: "GET", cookies: { accessToken: "abc" } }), {}, next);

        expect(next).toHaveBeenCalledWith();
    });

    test("lets unauthenticated requests through (e.g. login/register)", () => {
        const next = jest.fn();
        csrfProtection(makeReq(), {}, next);

        expect(next).toHaveBeenCalledWith();
    });

    test("lets header-authenticated requests through without a CSRF token", () => {
        const next = jest.fn();
        csrfProtection(
            makeReq({ cookies: { accessToken: "abc" }, headers: { Authorization: "Bearer abc" } }),
            {},
            next
        );

        expect(next).toHaveBeenCalledWith();
    });

    test("rejects a cookie-authenticated write without the CSRF header", () => {
        const next = jest.fn();
        csrfProtection(makeReq({ method: "PATCH", cookies: { accessToken: "abc", csrfToken: "t" } }), {}, next);

        expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
    });

    test("rejects a cookie-authenticated write whose CSRF header doesn't match the cookie", () => {
        const next = jest.fn();
        csrfProtection(
            makeReq({
                method: "DELETE",
                cookies: { accessToken: "abc", csrfToken: generateCsrfToken() },
                headers: { "x-csrf-token": generateCsrfToken() },
            }),
            {},
            next
        );

        expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
    });

    test("accepts a cookie-authenticated write whose CSRF header matches the cookie", () => {
        const next = jest.fn();
        const token = generateCsrfToken();
        csrfProtection(
            makeReq({ cookies: { accessToken: "abc", csrfToken: token }, headers: { "x-csrf-token": token } }),
            {},
            next
        );

        expect(next).toHaveBeenCalledWith();
    });
});
