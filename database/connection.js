const mysql = require('mysql')

const connectDB = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodeauth"
})

connectDB.connect(err=>{
    if (err) throw err
    console.log("Database Connected and running!!!")
})

module.exports = connectDB