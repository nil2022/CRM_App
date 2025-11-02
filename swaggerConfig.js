// swaggerConfig.js
import env from "#configs/env";
import swaggerJSDoc from "swagger-jsdoc";

let PORT = 3000;

if (env.NODE_ENV !== "development") {
    PORT = env.PORT;
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CRM App",
            version: "1.0.0",
            description: "Customer Relationship Management App",
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/v1`,
                description: "Development server"
            },
        ],
    },
    apis: ["./routes/*.js"], // Specify the path to your API routes files
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;