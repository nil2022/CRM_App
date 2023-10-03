require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3001,
    DB_URL : `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ygzkd1l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority` 
}