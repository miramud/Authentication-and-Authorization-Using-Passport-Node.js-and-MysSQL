const db = require('../database/connection')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

module.exports = (passport)=>{
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
        //  FIND USER FROM THE DATABASE
        const findUser = "SELECT * FROM users WHERE email=?"
        db.query(findUser, [email], (err, row)=>{
            if(err) throw err
            if(row.length === 0){
                return done(null, false, {message: "User Doesn't Exist"})
            }
            bcrypt.compare(password, row[0].password, (err, match)=>{
                if(err){
                    return done(null, false)
                }
                if(!match){
                    return done(null, false, {message: "Password is incorrect"})
                }
                if(match){
                    return done(null, row)
                }
            })
        })
    }))
    passport.serializeUser((user, done)=>{
        done(null, user[0].id)
    })

    passport.deserializeUser((id, done)=>{
        // FIND USER WITH PARTICULAR ID
        const sqlFind = "SELECT * FROM users WHERE id=?"
        db.query(sqlFind, [id], (err, userRow)=>{
            done(err, userRow)
        })
    })
}