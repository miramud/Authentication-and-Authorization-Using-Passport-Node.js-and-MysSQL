const express = require('express')
const session = require('express-session')
var MemoryStore = require('memorystore')(session)
const cookie = require('cookie-parser')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const passport = require('passport')
const csrf = require('csurf')

const app = express()

// CONNECT DATABASE
const connectDB = require('./database/connection')
connectDB

require('dotenv').config({ path: "./config/config.env" });
const PORT = process.env.PORT || 8080

app.use(bodyParser.urlencoded({extended: false}))
app.set('view engine', 'ejs')

// SETUP COOKIE
app.use(cookie(process.env.SECRET_KEY))

app.use(session({
    secret: process.env.SECRET_KEY,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    resave: false,
    saveUninitialized: true
}))
app.use(csrf())

// SET UP PASSPORT
app.use(passport.initialize())
app.use(passport.session())

// SET UP FLASH
app.use(flash())
app.use((req, res, next)=>{
    res.locals.error = req.flash('error')
    next()
})

app.use(express.static('public'))



// USE ROUTES
app.use(require('./controllerS/routes.js'));

app.listen(PORT, ()=>{
    console.log('Server running on ' + PORT)
})