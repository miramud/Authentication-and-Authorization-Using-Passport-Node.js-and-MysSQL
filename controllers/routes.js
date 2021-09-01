const express = require('express');
const router = express.Router();
const db  = require('../database/connection')
const bcrypt = require('bcrypt')
const passport = require('passport')
require('./passportLocal')(passport)

// HOME GET ROUTE
router.get('/', (req, res)=>{
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0')
        res.render('index', {title: "Home | Authentication", logged: true})
    }
    else{
        res.render('index', {title: "Home | Authentication", logged: false})
    }
})

// LOGIN GET ROUTE
router.get('/login', (req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/profile')
    }
    else{
        res.render('login', {title: "Login | Authentication", csrfToken: req.csrfToken(), logged: false})
    }
})

// SIGNUP GET ROUTE
router.get('/signup', (req, res)=>{
    if(req.isAuthenticated()){
        res.redirect('/profile')
    }
    else{
    res.render('signup', {title: "Signup | Authentication", csrfToken: req.csrfToken(), logged: false})
    }
})

// PROFILE GET ROUTE
router.get('/profile', (req, res)=>{
    if(req.isAuthenticated()){
        // console.log(req.user)
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0')
        res.render('profile', {title: "User profile | Authentication", username: req.user[0].username, logged: true})
    }
    else{
        res.redirect('/login')
    }
})

// SIGNUP POST ROUTE
router.post('/signup', (req, res)=>{
    // DECONSTRUCTURE THE FORM VARIABLES
    const {email, username, password, confirmpassword} = req.body
    // CHECK FOR EMPTINESS
    if(!email || !username || !password || !confirmpassword){
        res.render('signup', {title: "Signup | Authentication", errMsg: "No field should be empty!", csrfToken: req.csrfToken()})
    }
    // CHECK TO SEE IF PASSWORDS MATCH
    else if(password !== confirmpassword){
        res.render('signup', {title: "Signup | Authentication", errMsg: "Passwords Don't Match!", csrfToken: req.csrfToken()})
    }
    else{
        // CHECK IF EMAIL AND/OR USERNAME ALREADY EXIST
        const fetchEmailSQL = "SELECT * FROM users WHERE email=?"
        db.query(fetchEmailSQL, [email], (err, result)=>{
            if(err) throw err

            if (result.length > 0){
                res.render('signup', {title: "Signup | Authentication", errMsg: "User with this email already exists, register a new account or login to continue!", csrfToken: req.csrfToken()})
            }
            else{
                // GENERATE SALT FOR THE PASSWORD HASHING
                bcrypt.genSalt(10, (err, salt)=>{
                    if(err) throw err
                    // HASH THE PASSWORD
                    bcrypt.hash(password, salt, (err, hash)=>{
                        if(err) throw err

                        db.query("INSERT INTO users SET ?", {email: email, username: username, password: hash, provider: "email"}, (err, data)=>{
                            if(err) throw err

                            res.redirect('/login')
                            
                        })

                    })
                    
                        // SAVE USER IN DB

                        // REDIRECT TO LOGIN PAGE OR SEND VALIDATION EMAIL
                    
                })

            }
        })

    }
})

// LOGIN POST ROUTE
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/profile',
        failureFlash: true
    })(req, res, next)
})

// LOGOUT ROUTE
router.get('/logout', (req, res)=>{
    req.logout()
    req.session.destroy((err)=>{
        if(err) throw err
        res.redirect('/login')
    })
})

module.exports = router