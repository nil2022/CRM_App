// import winston from "winston";
// import morgan from "morgan";
// import "winston-daily-rotate-file";

// const { combine, timestamp, json, errors, prettyPrint, colorize, cli, printf, label } =
//     winston.format;

// /** HTTP LOGGER */
// const httpLogger = winston.createLogger({
//     level: "http",
//     format: combine(
//         errors({ stack: true }),
//         timestamp(),
//         json(),
//         prettyPrint()
//     ),
//     defaultMeta: { service: "crm-service" },
//     transports: [new winston.transports.Console()],
//     exceptionHandlers: [new winston.transports.Console()],
//     rejectionHandlers: [new winston.transports.Console()],
//     exitOnError: true,
// });

// /** INFO LOGGER */
// export const infoLogger = winston.createLogger({
//     level: "info",
//     format: combine(
//         errors({ stack: true }),
//         timestamp(),
//         json({
//             space: 2,
//         }),
//         colorize({ all: true }),
//         printf((info) => {
//             return `[${info.timestamp}] :: ${info.level}: ${info.message}`;
//         })
//     ),
//     defaultMeta: { service: "crm-service" },
//     transports: [new winston.transports.Console()],
//     exceptionHandlers: [new winston.transports.Console()],
//     rejectionHandlers: [new winston.transports.Console()],
//     exitOnError: true,
// });

// /** ERROR LOGGER */
// export const errorLogger = winston.createLogger({
//     level: "error",
//     format: combine(
//         errors({ stack: true }),
//         timestamp(),
//         json(),
//         prettyPrint(),
//         colorize({ all: true })
//     ),
//     defaultMeta: { service: "crm-service" },
//     transports: [new winston.transports.Console()],
//     exceptionHandlers: [new winston.transports.Console()],
//     rejectionHandlers: [new winston.transports.Console()],
//     exitOnError: true,
// });

// /** WARNING LOGGER */
// export const warningLogger = winston.createLogger({
//     level: "warn",
//     format: combine(timestamp(), json(), colorize({ all: true })),
//     defaultMeta: { service: "crm-service" },
//     transports: [new winston.transports.Console()],
//     exitOnError: true,
// });

// /** SILLY(ALL INFO) LOGGER */
// export const sillyLogger = winston.createLogger({
//     level: "silly",
//     format: combine(
//         errors({ stack: true }),
//         timestamp(),
//         json(),
//         colorize({ all: true }),
//         printf((info) => {
//             return `[${info.timestamp}] :: ${info.level}: ${info.message}`;
//         })
//     ),
//     defaultMeta: { service: "crm-service" },
//     transports: [new winston.transports.Console()],
//     exceptionHandlers: [new winston.transports.Console()],
//     rejectionHandlers: [new winston.transports.Console()],
//     exitOnError: true,
// });

// /** MORGAN MIDDLEWARE LOGGER */
// export const morganMiddleware = morgan(
//     function (tokens, req, res) {
//         return JSON.stringify({
//             method: tokens.method(req, res),
//             url: tokens.url(req, res),
//             status: Number.parseFloat(tokens.status(req, res)),
//             content_length: tokens.res(req, res, "content-length"),
//             response_time: `${Number.parseFloat(tokens["response-time"](req, res))}ms`,
//             user_agent: tokens["user-agent"](req, res),
//             remote_ip: tokens["remote-addr"](req, res),
//             date: new Date().toISOString(),
//             body: req.body,
//             query: req.query,
//             params: req.params,
//             headers: req.headers,
//             cookies: req.cookies,
//             user: req.user,
//             ip: req.ip,
//         });
//     },
//     {
//         stream: {
//             // Configure Morgan to use our custom logger with the http severity
//             write: (message) => {
//                 const data = JSON.parse(message);
//                 httpLogger.http(`incoming-request`, data);
//             },
//         },
//     }
// );

// /****************************************************** */
// /*** CUSTOMEIZE LOGGER BELOW FOR DIFFERENT ERROR LEVELS */
// /****************************************************** */

// /** Winston Logger Code */

// // const { combine, timestamp, json, errors, prettyPrint, colorize } = winston.format;

// // const errorFilter = winston.format((info, opts) => {
// //     return info.level === 'error' ? info : false;
// // })

// // const infoFilter = winston.format((info, opts) => {
// //     return info.level === 'info' ? info : false;
// // })

// // const fileRotateTransport = new winston.transports.DailyRotateFile({
// //     filename: 'logs/combined-%DATE%.log',
// //     datePattern: 'YYYY-MM-DD',
// //     maxFiles: '14d',
// // })

// // const logger = winston.createLogger({
// //     level: process.env.LOG_LEVEL || "info",
// //     // level: "http",
// //     format: combine(
// //         errors({ stack: true }),
// //         timestamp({
// //             format: "YYYY-MM-DD HH:mm:ss.SSS Z ddd",
// //         }),
// //         json(),
// //         prettyPrint(),
// //         colorize({ colors: { info: "green", error: "red" } }),
// //     ),
// //     defaultMeta: { service: "crm-service" },
// //     transports: [new winston.transports.Console()],
// //     exceptionHandlers: [new winston.transports.Console()],
// //     rejectionHandlers: [new winston.transports.Console()],
// //     exitOnError: true,
// // });

// // const morganMiddleware = morgan(
// //     function (tokens, req, res) {
// //         return JSON.stringify({
// //             method: tokens.method(req, res),
// //             url: tokens.url(req, res),
// //             status: Number.parseFloat(tokens.status(req, res)),
// //             content_length: tokens.res(req, res, "content-length"),
// //             response_time: `${Number.parseFloat(tokens["response-time"](req, res))}ms`,
// //             user_agent: tokens["user-agent"](req, res),
// //             remote_ip: tokens["remote-addr"](req, res),
// //             date: new Date().toISOString(),
// //             body: req.body,
// //             query: req.query,
// //             params: req.params,
// //             headers: req.headers,
// //             cookies: req.cookies,
// //             user: req.user,
// //             ip: req.ip,
// //         });
// //     },
// //     {
// //         stream: {
// //             // Configure Morgan to use our custom logger with the http severity
// //             write: (message) => {
// //                 const data = JSON.parse(message);
// //                 logger.info(`incoming-request`, data);
// //             },
// //         },
// //     }
// // );
// // app.use(morganMiddleware);

// /** Winston Logger Code ENDS */
