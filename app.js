require('dotenv').config()
const express = require("express");
const mongoos = require("mongoose");
const bodyParser = require("body-parser");
const route = require('./routers/home');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
// const toastr = require("express-toastr");
const session = require("express-session");
const flush = require("connect-flash");
const app = express();
const port = 8080;


mongoos.connect("mongodb://localhost:27017/Accounts_Project", { useNewUrlParser: true })
const db = mongoos.connection;
db.on('error', () => {
    console.log("Database Connection Error");
});
db.once('open', () => {
    console.log("Database Connected");
});
app.set('view engine', 'ejs');

//body parser

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cookieParser())
// app.use(toastr()) // "express-toastr": "^1.1.0",
app.use(flush())

app.use('/', route);

app.listen(port)