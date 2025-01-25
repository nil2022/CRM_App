# CRM App
#### (Full Backend of Customer Relationship Management Application)

<p align="left">
<!-- <a href="https://github.com/nil2022/CRM_App/actions/workflows/main.yml" target="_blank"> <img src="https://github.com/nil2022/CRM_App/actions/workflows/main.yml/badge.svg?branch=master" alt="Node.js Vulnerability Check" /></a> -->
<a href="https://github.com/nil2022/CRM_App/actions/workflows/github-code-scanning/codeql" target="_blank"><img src="https://github.com/nil2022/CRM_App/actions/workflows/github-code-scanning/codeql/badge.svg?branch=master" alt="CodeQL" /></a>
</a>
</p>

## Introduction
This CRM application streamlines customer support. Customers can register, submit tickets (complaints), and receive confirmation emails. The system assigns tickets to available engineers for resolution. Once a query is resolved, the ticket status is updated, triggering email notifications for both the customer and the assigned engineer. This efficient workflow effectively manages customer support inquiries.

## Features

- **User Roles**: The system differentiates between Customers, Engineers, and Admins, granting specific permissions to each for efficient task management.

- **Streamlined Customer Queries**: Customers can easily submit and manage their support requests (queries) directly through the app.

- **Automated Ticket Assignment**: Tickets are intelligently routed to available engineers based on workload or expertise, ensuring faster resolution.

- **Two-Way Email Notifications**: Both customers and assigned engineers receive automatic email updates regarding ticket creation, status changes, and resolution.

- **Comprehensive Dashboard**: Admins have a centralized dashboard providing a clear view of all tickets, customer information, and engineer activity.

- **Collaborative Ticket Management**: Engineers and Admins can update ticket statuses to reflect progress and resolution, keeping everyone informed.

- **Development Logging (Winston Logger)**: The application utilizes Winston Logger, a development tool that facilitates troubleshooting and improves future development.

### Prerequisites

Here is what you need to be able to run CRM app.

- [Node.js (Version: 18 or higher)](https://nodejs.org/en/download)

## How to setup locally

Clone/Download the repository :

```bash
git clone https://github.com/nil2022/CRM_App.git
```

To install the necessary dependencies, run the following command:
```bash
npm install or yarn
```

Copy and rename `.env.sample` to `.env` and provide necessary environmental variables for the application to run.

```bash
# SERVER PORT (MANDATORY)
SERVER_PORT=#port on which CRM app will run
# NODE Environment (OPTIONAL)
NODE_ENV=#development

# JWT SECRETS AND EXPIRY TIME (MANDATORY)
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

SESSION_SECRET=
SESSION_DOMAIN=

# WINSTON LOGGER LEVEL (OPTIONAL)
LOG_LEVEL=

# CORS ORIGIN (MANDATORY)
CORS_ORIGIN=
# CORS HEADERS (OPTIONAL)
CORS_ALLOWED_HEADERS=

# MongoDB URL to store the documents (MANDATORY)
MONGODB_URI=
# Provide URL of Notify Service of CRM app to send E-mails to customers, engineers (MANDATORY)
# Github Repo URL - https://github.com/nil2022/notification_service
NOTIFICATION_URL=

###### MASTER ADMIN CREDENTIALS (MANDATORY)  ##############
##### MUST BE PROVIDED IN ORDER START CRM APP #####
ADMIN_NAME=
ADMIN_USERID=
ADMIN_EMAIL=
ADMIN_PASSWORD=

##### EXPRESS-RATE-LIMIT CONFIGURATION #####
# SPECIFY EXPRESS-RATE-LIMIT TIME IN MINUTES (OPTIONAL)
RATE_LIMIT_TIME=
# SPECIFY MAXIMUM NO. OF REQUESTS PER IP ADDRESS (OPTIONAL)
MAX_REQUESTS=
```

To start the application, use:
```bash
npm start or yarn start
```
 
For development purposes, use:
```bash
npm run dev or yarn dev
```

### Register User

This endpoint makes a `POST` request which allows users to register for a new account. <br> Endpoint :- `/crm/api/v1/auth/register`

#### Request Body

- `fullName` (text): The full name of the user.

- `userId` (text): The user ID for the account.
    
- `email` (text): The email address of the user.
    
- `userType` (text): The type of user account.
    
- `password` (text): The password for the account.
    

#### Sample Response

```json
{
    "data": {
        "user": {
            "__v": 0,
            "_id": "6644e2b1e8e13f8318999d44",
            "fullName": "Karl Boyle",
            "userId": "Karley.Bogisich19",
            "email": "shanelle.daugherty71@hotmail.com",
            "avatar": "",
            "loginType": "",
            "isEmailVerified": false,
            "userType": "CUSTOMER",
            "userStatus": "APPROVED",
            "createdAt": "2024-05-15T14:54:22.276Z"
        }
    },
    "message": "Users registered successfully and verification email has been sent on your email.",
    "statusCode": 200,
    "success": true
}
```

### Login User

This endpoint makes a `POST` request to authenticate and login the user. <br> Endpoint:- `/crm/api/v1/auth/login`

#### Request Body

- `userId` (text): The user ID for authentication.
    
- `password` (text): The user's password for authentication.
    

#### Sample Response

```json
   {
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjQ0OWM5N2ZlMjFlODEwZDI0YThmYzIiLCJ1c2VySWQiOiJWaXRhLkJlcmduYXVtMTYiLCJ1c2VyVHlwZSI6IkNVU1RPTUVSIiwidXNlclN0YXR1cyI6IkFQUFJPVkVEIiwiaWF0IjoxNzE1NzgyNTE5LCJleHAiOjE3MTU4Njg5MTl9.WknmCRmcxj9RWiYJvUP130KRrd_xPwKBwNM19YcOJlA",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjQ0OWM5N2ZlMjFlODEwZDI0YThmYzIiLCJpYXQiOjE3MTU3ODI1MTksImV4cCI6MTcxNjM4NzMxOX0.XlM3HRJa4zLi2_gdBh4u-ZyGpDg0r1dHOpvQcrrMBrw",
        "user": {
            "__v": 1,
            "_id": "66449c97fe21e810d24a8fc2",
            "fullName": "Miss Gerard Dach",
            "userId": "Vita.Bergnaum16",
            "email": "jackie.buckridge@yahoo.com",
            "avatar": "",
            "loginType": "",
            "isEmailVerified": false,
            "userType": "CUSTOMER",
            "userStatus": "APPROVED",
            "createdAt": "2024-05-15T11:28:02.755Z",
            "updatedAt": "2024-05-15T11:28:02.755Z"
        }
    },
    "message": "User Logged in successfully !",
    "statusCode": 200,
    "success": true
}
```

### Change Password

The `PATCH` request is used to change the password for the user in the CRM application.
Endpoint:- `/crm/api/v1/auth/change-password`

#### Request Body
    
- `oldPassword`: (text) The old password of the user.
        
- `newPassword`: (text) The new password for the user.
        

#### Sample Response

``` json
{
    "data": "",
    "message": "Password changed successfully!",
    "statusCode": 200,
    "success": true
}
 ```


## Libraries Used
- **Express**: For handling server-side operations.
- **Bcrypt**: For encryption and hashing.
- **JSON Web Token**: For authentication and authorization.
- **Dotenv**: For environment variable management.
- **Mongoose**: For MongoDB object modeling.
- **Jest**: For testing.
- **Morgan**: For HTTP request logging.
- **Nodemon**: For automatic server restarting during development.
- **Validator**: For input validation.
- **Cors**: For handling cross-origin requests.
- **Express Rate Limit**: For rate limiting requests.
- **Helmet**: For setting security headers.
- **Axios**: For making HTTP requests.

## Bugs/Issues
Report any bugs or issues [here](https://github.com/nil2022/CRM_App/issues).
