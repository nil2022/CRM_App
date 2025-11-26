// assets/templates/otpTemplate.js

export const otpMailTemplate = (fullName, OTP) => {
    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 20px; font-family: Arial, sans-serif">
    <div
        style="
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        "
    >
        <!-- Header -->
        <div style="background: #4f46e5; padding: 24px">
            <h1 style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin: 0">
                Your OTP Code
            </h1>
        </div>

        <!-- Body -->
        <div style="padding: 32px">
            <p style="color: #374151; margin-bottom: 20px">
                Hello <strong>${fullName}</strong>,
            </p>

            <p style="color: #374151; margin-bottom: 20px">
                Your One-Time Password (OTP) for verifying your account is:
            </p>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px">
                <p style="font-size: 32px; font-weight: bold; text-align: center; color: #4f46e5; margin: 0">
                    ${OTP}
                </p>
            </div>

            <p style="color: #374151; margin-bottom: 20px">
                This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
            </p>

            <p style="color: #374151; margin-bottom: 10px">
                If you didn’t request this code, you can safely ignore this email.
            </p>

            <p style="color: #374151">
                Thank you for using <strong>CRM Service</strong>!
            </p>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 16px">
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0">
                &copy; ${new Date().getFullYear()} CRM Service. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
};