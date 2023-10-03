require('dotenv').config()
const mongoose = require("mongoose")
const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const User = require("./models/user.model")
const app = express();
const bcrypt = require('bcrypt')
const constants = require('./utils/constants')
const path = require('path');
const { PORT, DB_URL } = require('./configs/db.config')

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(logger('dev'))


const db_url = DB_URL|| 'mongodb://127.0.0.1:27017/crm_db'

//Create System User or check if already present
async function init() {
    let user = await User.findOne({ userId: process.env.ADMIN_USERID })

    if (user) {
        console.log("Admin user already present", user)
        console.log("Welcome System Administrator!")
        return
    }

    try {
        let user = await User.create({
            name: process.env.ADMIN_NAME,
            userId: process.env.ADMIN_USERID,
            email: process.env.ADMIN_EMAIL,
            userType: constants.userTypes.admin,
            password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
            userStatus: constants.userStatus.approved
        })
        console.log(user)
        console.log("Welcome System Administrator!")
    } catch (err) {
        console.log("Error creating user!", err.message)
    }
}

// connect to MongoDB
// Event handlers for successful connection and connection error
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(db_url,{
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log(`MongoDB Connected to Host: ${connect.connection.host}`);
      init();

    } catch (error) {
      console.log("Can't connect to DB:", error.message);
    }
  }
 mongoose.set('strictQuery', true);
  // FIRST CONNECT TO MONGODB THEN START LISTENING TO REQUESTS
connectDB().then(() => {
    app.listen( PORT, () => {
        console.log(`Listening all requests on port ${PORT}`);
    })
  }).catch((e)=>console.log(e)) // IF DB CONNECT FAILED, CATCH ERROR

app.get('/', (req, res) => {
  logger.error('hi')
    res.status(200).send(`<h2>CRM Backend Running! 🎉</h2>`)
  });

require('./routes/auth.routes')(app)
require('./routes/user.routes')(app)
require('./routes/ticket.routes')(app)


