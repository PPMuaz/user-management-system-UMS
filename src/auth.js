const jwt = require("jsonwebtoken");
const Reocrd = require("../models/record");

const auth = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;
        const verify_User = jwt.verify(token, "mynameismalikmuhammadmuazpunjabPITB");
        // console.log(verify_User);

        const users = await Reocrd.findOne({ _id: verify_User._id });
        // console.log(users.name, users.email, users.cnic);
        req.token = token;
        req.users = users;
        next();

    }
    catch (error) {
        // res.status(401).send(error);
        res.redirect('/login');
        // res.render('login', { name: '' });
    }
}

module.exports = auth;