import { jest } from "@jest/globals";
import randomString from "../randomString.js";

describe("randomString (OTP generator)", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("can produce every digit 0-9, not just 0-(length-1)", () => {
        // Regression test: the generator used to index into "0123456789"
        // with `Math.random() * length` instead of `Math.random() * digits.length`,
        // so a 6-digit OTP could only ever contain the digits 0-5.
        const randomValues = [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
        let call = 0;
        jest.spyOn(Math, "random").mockImplementation(() => randomValues[call++ % randomValues.length]);

        const otp = randomString(10);

        expect(otp).toBe("0123456789");
    });

    test("returns a string of the requested length", () => {
        const otp = randomString(6);
        expect(otp).toHaveLength(6);
        expect(otp).toMatch(/^[0-9]{6}$/);
    });
});
