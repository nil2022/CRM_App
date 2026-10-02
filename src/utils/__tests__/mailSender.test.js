import { jest } from "@jest/globals";

const otpFindOneMock = jest.fn();
const otpCreateMock = jest.fn();
const otpCreateIndexesMock = jest.fn();
const sendMailMock = jest.fn();

jest.unstable_mockModule("../../models/otp.model.js", () => ({
    Otp: {
        findOne: otpFindOneMock,
        create: otpCreateMock,
        createIndexes: otpCreateIndexesMock,
    },
}));

jest.unstable_mockModule("nodemailer", () => ({
    default: {
        createTransport: () => ({ sendMail: sendMailMock }),
    },
}));

const { sendMail } = await import("../mailSender.js");
const { ConflictError } = await import("../ApiError.js");

describe("sendMail", () => {
    beforeEach(() => {
        otpFindOneMock.mockReset();
        otpCreateMock.mockReset().mockResolvedValue(undefined);
        otpCreateIndexesMock.mockReset().mockResolvedValue(undefined);
        sendMailMock.mockReset().mockResolvedValue({ accepted: ["user@example.com"] });
    });

    test("throws a ConflictError instead of a raw Error when an OTP was already sent", async () => {
        otpFindOneMock.mockResolvedValue({ userId: "john123" });

        await expect(
            sendMail("John Doe", "john123", "from@example.com", "john@example.com")
        ).rejects.toBeInstanceOf(ConflictError);
        await expect(
            sendMail("John Doe", "john123", "from@example.com", "john@example.com")
        ).rejects.toMatchObject({ statusCode: 409 });

        expect(sendMailMock).not.toHaveBeenCalled();
    });

    test("sends the mail when no OTP is pending for the user", async () => {
        otpFindOneMock.mockResolvedValue(null);

        const info = await sendMail("John Doe", "john123", "from@example.com", "john@example.com");

        expect(otpCreateMock).toHaveBeenCalled();
        expect(sendMailMock).toHaveBeenCalled();
        expect(info.accepted).toEqual(["user@example.com"]);
    });

    test("HTML-escapes the user's name in the mail body", async () => {
        otpFindOneMock.mockResolvedValue(null);

        await sendMail('<img src=x onerror="alert(1)">', "john123", "from@example.com", "john@example.com");

        const { html } = sendMailMock.mock.calls[0][0];
        expect(html).not.toContain("<img");
        expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    });
});
