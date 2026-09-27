import request from "supertest";
import { app } from "../app.js";

describe("centralized error handling (integration)", () => {
    test("GET /health is unaffected by the error-handling changes", async () => {
        const res = await request(app).get("/health");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("an unknown route is routed through the centralized error envelope", async () => {
        const res = await request(app).get("/api/v1/this-route-does-not-exist");

        expect(res.status).toBe(404);
        expect(res.body).toEqual(
            expect.objectContaining({
                data: null,
                message: "Route not found",
                statusCode: 404,
                success: false,
            })
        );
    });

    test("a protected route without a token gets a 403 through the shared envelope", async () => {
        const res = await request(app).get("/api/v1/tickets/get-all-tickets");

        expect(res.status).toBe(403);
        expect(res.body).toEqual(
            expect.objectContaining({
                message: "User not logged in or Token not provided, Please Login!",
                statusCode: 403,
                success: false,
            })
        );
    });

    test("a protected route with an invalid token gets a 401 through the shared envelope", async () => {
        const res = await request(app)
            .get("/api/v1/user/get-all-users")
            .set("Authorization", "Bearer not-a-real-token");

        expect(res.status).toBe(401);
        expect(res.body).toEqual(
            expect.objectContaining({
                message: "Session Expired, Please Re-Login!",
                statusCode: 401,
                success: false,
            })
        );
    });
});
