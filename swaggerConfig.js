// swaggerConfig.js
import swaggerJSDoc from "swagger-jsdoc";

let PORT = 3000;

if (process.env.NODE_ENV !== "development") {
    PORT = process.env.PORT;
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
                url: `http://localhost:${PORT}/crm/api/v1`,
                description: "Development server"
            },
        ],
    },
    apis: ["./src/routes/*.js"], // Specify the path to your API routes files
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;