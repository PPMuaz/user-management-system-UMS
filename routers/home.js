const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");
const mongoose = require('mongoose');
const userSchema = require('../models/record');
const profileSchema = require('../models/profile_record');
const aoiSchema = require('../models/aoi_record');
const walletSchema = require('../models/wallet_record');
const admin_transactionSchema = require('../models/admin_wallet_transactions');
const auth = require("../src/auth");
const jwt = require("jsonwebtoken");
const { default: jwtDecode } = require("jwt-decode");
var del_id = "";
// var Total_Balance = 1000;

// const record = require("../models/record");

Router.get('/', (req, res) => {
    // res.render('index');
    res.render('index', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '' });
});

Router.post('/index', async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const re_password = req.body.re - password;
        const cnic = req.body.cnic;
        const mobile = req.body.mobile;
        // console.log(name, email, password, cnic, mobile);
        if (name === "") {
            res.render('index', { name: 'Enter your name', email: '', password: '', re_password: '', cnic: '', mobile: '' });
            return false;
        }
        else if (email === '') {
            res.render('index', { name: `${name}`, email: 'Enter your email', password: '', re_password: '', cnic: '', mobile: '' });
        }
        else if (password === '') {
            res.render('index', { name: `${name}`, email: `${email}`, password: 'Enter your password', re_password: '', cnic: '', mobile: '' });
        }
        else if (re_password === '') {
            res.render('index', { name: `${name}`, email: `${email}`, password: '', re_password: 'Enter your confirm password', cnic: '', mobile: '' });
        }
        else if (cnic === '') {
            res.render('index', { name: `${name}`, email: `${email}`, password: '', re_password: '', cnic: 'Enter your cnic', mobile: '' });
        }
        else if (mobile === '') {
            res.render('index', { name: `${name}`, email: `${email}`, password: '', re_password: '', cnic: `${cnic}`, mobile: 'Enter your mobile' });
        }
        else {
            // console.log("I am in else");
            const userData = new userSchema({
                name,
                email,
                password,
                cnic,
                mobile
            })
            // console.log("The data is: " + userData);
            // const token = await userData.generateAuthToken();
            // console.log("The token is " + token);

            userData.save(err => {
                if (err) {
                    console.log("Data not inserted");
                    res.render('index', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '' });
                }
                else {
                    console.log("Data inserted");
                    res.render('login', { name: '' });
                }
            })

        }
        const chkemail = await userSchema.findOne({ email: email });
        const chkcnic = await userSchema.findOne({ cnic: cnic });

        // if (email === chkemail.email && cnic === chkcnic.cnic) {
        //     res.render('index', { name: '', email: 'This Email is already exist', password: '', re_password: '', cnic: 'This CNIC is already exist', mobile: '' });
        // }
        if (email === chkemail.email) {
            res.render('index', { name: '', email: 'This Email is already exist', password: '', re_password: '', cnic: '', mobile: '' });
        }
        else if (cnic === chkcnic.cnic) {
            res.render('index', { name: '', email: '', password: '', re_password: '', cnic: 'This CNIC is already exist', mobile: '' });
        }
        else {
            console.log("Error");
        }
    }
    catch (error) {
        console.log("Something error")
        console.log(error);
    }
});
Router.get('/login', (req, res) => {
    res.render('login', { name: '' });

})
//               For Login Start Code
Router.post('/dashboard', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const user_email = await userSchema.findOne({ email: email });
    // console.log(user_email.password);
    if (user_email) {
        const login_id = user_email._id.toString();
        console.log(login_id);
        // const isMatch = await compare(password, user_email.password);
        const token = await user_email.generateAuthToken();
        console.log("The token is " + token);
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true
        });

        if (email === user_email.email && password === user_email.password) {
            // const profile_ids = profile_login_id._id.toString();
            console.log("Successful Login");
            const profile_login_id = await profileSchema.findOne({ u_id: login_id });
            if (user_email.roles === process.env.ADMIN || user_email.roles === process.env.VIEW || user_email.roles === process.env.EDIT || user_email.roles === process.env.DELETE) {
                // res.render('admin_view');
                userSchema.find((err, docs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        res.render('admin_home', {
                            registration_forms: docs, role: user_email.roles, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: '', msg: ''
                        })
                    }
                })
            }
            else {
                console.log(user_email.name);
                aoiSchema.find((err, docs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        if (profile_login_id === null) {
                            console.log("if my");
                            // res.render('dashboard', { id: profile_login_id._id, uname: profile_login_id.uname, name: user_email.name, dob: profile_login_id.dob, email: user_email.email, mobile: user_email.mobile, gender: profile_login_id.gender, occup: profile_login_id.occup, cnic: user_email.cnic, university: profile_login_id.university, intro: profile_login_id.intro })
                            res.render('dashboard', { id: user_email._id, name: user_email.name, email: user_email.email, mobile: user_email.mobile, cnic: user_email.cnic, uname: '', dob: '', gender: '', occup: '', university: '', intro: '', msg: '', aoi_record: docs, aoi: '' });
                        }
                        else {
                            console.log("else my");
                            // res.render('dashboard', { id: user_email._id, name: user_email.name, email: user_email.email, mobile: user_email.mobile, cnic: user_email.cnic, uname: '', dob: '', gender: '', occup: '', university: '', intro: '' });
                            res.render('dashboard', { id: profile_login_id._id, uname: profile_login_id.uname, name: user_email.name, dob: profile_login_id.dob, email: user_email.email, mobile: user_email.mobile, gender: profile_login_id.gender, occup: profile_login_id.occup, cnic: user_email.cnic, university: profile_login_id.university, intro: profile_login_id.intro, msg: '', aoi_record: docs, aoi: profile_login_id.aoi })
                        }
                    }
                })

            }
        }
        else {
            console.log("Not Login Password Error")
            res.render('login', { name: 'Your Password is incorrect', email: '', password: '', re_password: '', cnic: '', mobile: '', msg: '' });
        }
    }
    else {
        console.log("Email not found")
        res.render('login', { name: 'Your are not a member Please sign up first', email: '', password: '', re_password: '', cnic: '', mobile: '', msg: '' });
    }

})
//               For Login End Code

Router.get('/dashboard', auth, async (req, res) => {
    try {
        const users = await userSchema.findOne({ _id: req.users.id });
        const id = users._id;
        console.log("The id is: " + id)
        const profile = await profileSchema.findOne({ u_id: id });
        // var chk = profile.u_id;
        // console.log(chk)
        // console.log(chk);
        // console.log(profile);
        // console.log("The User id is : " + id);
        if (profile === null) {
            console.log("Profile Incomplete");
            aoiSchema.find((err, docs) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('dashboard', { id: users._id, name: users.name, email: users.email, mobile: users.mobile, cnic: users.cnic, uname: '', dob: '', gender: '', occup: '', university: '', intro: '', msg: '', aoi_record: docs, aoi: '' });
                }
            })
        }
        else {
            aoiSchema.find((err, docs) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Profile Full");
                    res.render('dashboard', { id: profile._id, uname: profile.uname, name: users.name, dob: profile.dob, email: users.email, mobile: users.mobile, gender: profile.gender, occup: profile.occup, cnic: users.cnic, university: profile.university, intro: profile.intro, msg: '', aoi_record: docs, aoi: profile.aoi })

                }
            })
        }

    }
    catch (error) {
        console.log(error);
    }
})
Router.post('/add', auth, async (req, res) => {
    try {
        const uname = req.body.uname;
        const dob = req.body.dob;
        const gender = req.body.gender;
        const occup = req.body.occup;
        const university = req.body.university;
        const intro = req.body.intro;
        const aoi = req.body.aoi;
        const users = await userSchema.findOne({ _id: req.users.id });
        const email = users.email;
        // console.log(email);
        // const user_emails = await profileSchema.findOne({ email: email });
        const user_email = await userSchema.findOne({ email: email });
        const u_id = user_email._id.toString()
        console.log(u_id);
        const user_id = await profileSchema.findOne({ u_id: u_id });

        // console.log(user_id);
        // console.log(users._id, users.name, users.email, users.cnic);
        if (user_id) {
            console.log("Updated");
            const profile_id = user_id._id.toString();
            console.log(profile_id);
            walletSchema.findByIdAndUpdate(profile_id, { uname: uname, dob: dob, gender: gender, occup: occup, university: university, intro: intro, aoi: aoi }, (err, docs) => {
                if (err) {
                    console.log("Error")
                }
                else {
                    aoiSchema.find((err, docs) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            res.render('dashboard', { id: u_id, uname: uname, name: user_email.name, dob: dob, email: user_email.email, mobile: user_email.mobile, gender: gender, occup: occup, cnic: user_email.cnic, university: university, intro: intro, aoi: aoi, aoi_record: docs, msg: 'Profile Successfully Updated' })
                        }
                    })
                }
            })
        }
        else {
            console.log("Save Record");
            const profile_records = new profileSchema({
                u_id,
                uname,
                dob,
                gender,
                occup,
                university,
                intro,
                aoi
            })
            // console.log("The data is: " + profile_records);
            profile_records.save(err => {
                aoiSchema.find((err, docs) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (err) {
                            console.log("Data not inserted");
                            // res.render('index', {id:u_id, name: user_email.name, email: user_email.email, password: '', re_password: '', cnic: '', mobile: '' });
                            res.render('dashboard', { id: u_id, uname: '', name: user_email.name, dob: '', email: user_email.email, mobile: user_email.mobile, gender: '', occup: '', cnic: user_email.cnic, university: '', intro: '', aoi: '', aoi_record: docs, msg: 'Profile Not Updated' })
                        }
                        else {
                            console.log("Data inserted");
                            res.render('dashboard', { id: u_id, uname: uname, name: user_email.name, dob: dob, email: user_email.email, mobile: user_email.mobile, gender: gender, occup: occup, cnic: user_email.cnic, university: university, intro: intro, aoi: aoi, aoi_record: docs, msg: 'Profile Successfully Updated' })
                            // res.render('dashboard', { name: user_email.name, uname: user_emails.fname });
                        }
                    }
                })
            })
        }
    }
    catch (err) {
        console.log(err);
    }
})


// Router.post('/dashboard', (req, res) => {

// })

// Find Data in Admin Dashboard
Router.get('/admin_view', auth, async (req, res) => {
    // req.cookies.jwt
    userSchema.find((err, docs) => {
        if (err) {
            throw err;
        }
        else {
            res.render('admin_view', {
                registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, msg: '', admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE
            })
        }
    }).sort({ _id: -1 })
})

Router.get('/home', auth, (req, res) => {
    res.render('home');
})
Router.get('/area_of_interest', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN) {
        res.render('area_of_interest', { name: '', role: req.users.roles, err_msg: '', msg: '' })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' });
    }
})
Router.post('/area_of_interest', auth, async (req, res) => {
    try {
        const area = req.body.area;
        // var msg = req.flash('message', ' Saved Successfully');
        const role_id = req.users._id.toString();
        if (area === null) {
            res.render('area_of_interest', { name: 'Please Enter Areaof Interest', role: req.users.roles, err_msg: '', msg: '' });
        }
        const chkaoi = await aoiSchema.findOne({ area: area });
        if (chkaoi) {
            res.render('area_of_interest', { name: "This Area of Interest already exist.", role: req.users.roles, err_msg: 'alert alert-danger', msg: 'Sorry! This Area of Interest already exist.' });
        }
        else {
            const aoi_records = new aoiSchema({
                role_id,
                area
            });
            const save_aoi = await aoi_records.save();
            if (save_aoi) {
                console.log("Data Inserted");
                // req.toastr.success('Successfully Inserted', "Congrates");
                res.render('area_of_interest', { name: '', role: req.users.roles, err_msg: 'alert alert-success', msg: 'Saved Successfully' });
            }
        }
    }
    catch (error) {
        res.status(401).send(error);
    }

})
Router.get('/admin_home', auth, (req, res) => {
    var tok = req.cookies.jwt;
    var decode = jwtDecode(tok);
    var decodedHeader = jwtDecode(tok, { header: true });
    res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: '', msg: '' });
})
//View Record
Router.get('/view/:id', auth, (req, res) => {
    // console.log(req.params.id);
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.VIEW) {
        userSchema.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
            if (err) {
                throw err;
            }
            else {
                // console.log("Done")
                res.render('view', { user_record: docs, role: req.users.roles, curr_user_email: req.users.email, err_msg: '', msg: '' })
            }
        })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})
Router.post('/view/:id', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.VIEW) {
        res.redirect('/admin_view');
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})
//Update 
Router.get('/edit/:id', auth, (req, res) => {
    // console.log(req.params.id);
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.EDIT) {
        userSchema.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
            if (err) {
                throw err;
            }
            else {
                // console.log("Done")
                res.render('edit', { user_record: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: '', msg: '' })
            }
        })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})
// 2nd query
Router.post('/edit/:id', auth, async (req, res) => {
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.EDIT) {
        const chk_role = await userSchema.findOne({ _id: req.users.id });
        // console.log(del_role.roles);
        const chk_roles = await userSchema.find({ roles: chk_role.roles }).count();

        userSchema.findByIdAndUpdate({ _id: req.params.id }, req.body, (err, docs) => {
            if (err) {
                console.log("Errorss")
            }
            else {
                console.log("Updated");
                // res.redirect('/admin_view');
                userSchema.find((err, docs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        // console.log(docs);
                        // var mysort = { name: -1 }
                        res.render('admin_view', {
                            registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-success', msg: 'Update Successfully'
                        })
                        // res.render('admin_view', { role: req.users.roles, msg: "Sorry there are only one Admin account. So you don't eligible to delete it" });
                    }
                }).sort({ _id: -1 })
            }
        })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})



// Delete
Router.get('/delete/:id', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.DELETE) {
        userSchema.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
            if (err) {
                throw err;
            }
            else {

                res.render('delete', { user_record: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: '', msg: '' })
            }
        })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})
// 2nd query
Router.post('/delete/:id', auth, async (req, res) => {
    if (req.users.roles === process.env.ADMIN || req.users.roles === process.env.DELETE) {
        const del_role = await userSchema.findOne({ _id: req.params.id });
        const chk_role = await userSchema.findOne({ _id: req.users.id });
        const chk_roles = await userSchema.find({ roles: chk_role.roles }).count();
        console.log(chk_roles);
        if (del_role !== null) {
            if (del_role.roles === "Admin") {
                console.log("Yup");
                if (chk_roles === 1) {
                    console.log("Record is one");
                    userSchema.find((err, docs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            res.render('admin_view', {
                                registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry there are only one Admin account. So you dont eligible to delete it'
                            })
                        }
                    }).sort({ _id: -1 })
                }
                else {
                    userSchema.findByIdAndDelete({ _id: req.params.id }, req.body, (err, docs) => {

                        if (err) {
                            console.log("Errors");
                        }
                        else {
                            console.log("Delete Successfully");
                            del_id = docs._id.toString();
                            profileSchema.findOneAndDelete({ u_id: del_id }, (err, docs) => {
                                if (err) {
                                    console.log("Delete Error");
                                }
                                else {
                                    console.log("Profile Delete Successfully");
                                    userSchema.find((err, docs) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            res.render('admin_view', {
                                                registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-success', msg: 'Delete Successfully'
                                            })
                                        }
                                    }).sort({ _id: -1 })
                                }
                            })
                        }
                    })
                }
            }
            else if (del_role === null) {

            }
            else {
                // if (chk_roles === 1) {
                //     console.log("Record is one");
                //     userSchema.find((err, docs) => {
                //         if (err) {
                //             throw err;
                //         }
                //         else {
                //             // console.log(docs);
                //             // var mysort = { name: -1 }
                //             res.render('admin_view', {
                //                 registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry there are only one Admin account. So you dont eligible to delete it'
                //             })
                //             // res.render('admin_view', { role: req.users.roles, msg: "Sorry there are only one Admin account. So you don't eligible to delete it" });
                //         }
                //     }).sort({ _id: -1 })
                // }
                // else {
                userSchema.findByIdAndDelete({ _id: req.params.id }, req.body, (err, docs) => {

                    if (err) {
                        console.log("Errors");
                    }
                    else {
                        console.log("Delete Successfully");
                        del_id = docs._id.toString();
                        profileSchema.findOneAndDelete({ u_id: del_id }, (err, docs) => {
                            if (err) {
                                console.log("Delete Error");
                            }
                            else {
                                console.log("Profile Delete Successfully");
                                userSchema.find((err, docs) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        res.render('admin_view', {
                                            registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-success', msg: 'Delete Successfully'
                                        })
                                    }
                                }).sort({ _id: -1 })
                            }
                        })
                    }
                })
                // }
            }
        }
        else {
            console.log("Record not exist");
            userSchema.find((err, docs) => {
                if (err) {
                    throw err;
                }
                else {
                    res.render('admin_view', {
                        registration_forms: docs, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry! Now this record is not exist'
                    })
                }
            }).sort({ _id: -1 })
        }
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, admin: process.env.ADMIN, view: process.env.VIEW, edit: process.env.EDIT, deleted: process.env.DELETE, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})



// Add User
Router.get('/admin_add_user', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN) {
        res.render('admin_add_user', { name: '', email: '', password: '', cnic: '', mobile: '', err_msg: '', msg: '' });
    }
})



// Add User
Router.post('/admin_add_user', auth, async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const re_password = req.body.re - password;
        const cnic = req.body.cnic;
        const mobile = req.body.mobile;

        if (name === "" && email === "" && password === "" && cnic === "" && mobile === "") {
            res.render('admin_add_user', { name: 'Enter your name', email: 'Enter your email', password: 'Enter your password', re_password: '', cnic: 'Enter your cnic', mobile: 'Enter your mobile', err_msg: '', msg: '' });
            return false;
        }
        else if (name === "") {
            res.render('admin_add_user', { name: 'Enter your name', email: '', password: '', re_password: '', cnic: '', mobile: '', err_msg: '', msg: '' });
            return false;
        }
        else if (email === '') {
            res.render('admin_add_user', { name: '', email: 'Enter your email', password: '', re_password: '', cnic: '', mobile: '', err_msg: '', msg: '' });
        }
        else if (password === '') {
            res.render('admin_add_user', { name: '', email: '', password: 'Enter your password', re_password: '', cnic: '', mobile: '', err_msg: '', msg: '' });
        }
        else if (cnic === '') {
            res.render('admin_add_user', { name: '', email: '', password: '', re_password: '', cnic: 'Enter your cnic', mobile: '', err_msg: '', msg: '' });
        }
        else if (mobile === '') {
            res.render('admin_add_user', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: 'Enter your mobile', err_msg: '', msg: '' });
        }
        else {
            const userData = new userSchema({
                name,
                email,
                password,
                cnic,
                mobile
            })
            console.log("The data is: " + userData);
            const token = await userData.generateAuthToken();
            console.log("The token is " + token);

            userData.save(err => {
                if (err) {
                    console.log("Data not inserted");
                    res.render('admin_add_user', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '', err_msg: 'alert alert-danger', msg: 'User not Created because this CNIC is already exist' });
                }
                else {
                    console.log("Data inserted");
                    res.render('admin_add_user', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '', err_msg: 'alert alert-success', msg: 'User Successfully Created' });
                }
            })

        }
        const chkemail = await userSchema.findOne({ email: email });
        const chkcnic = await userSchema.findOne({ cnic: cnic });
        if (email === chkemail.email) {
            res.render('admin_add_user', { name: '', email: 'This Email is already exist', password: '', re_password: '', cnic: '', mobile: '', err_msg: '', msg: '' });
        }
        else if (cnic === chkcnic.cnic) {
            res.render('admin_add_user', { name: '', email: '', password: '', re_password: '', cnic: 'This CNIC is already exist', mobile: '', err_msg: '', msg: '' });
        }
        else {
            console.log("Error");
        }
    }
    catch (error) {
        console.log("Something error")
        console.log(error);
    }
});



Router.get('/wallet', auth, async (req, res) => {
    const customer_id = req.users._id;
    const chkwallet = await walletSchema.findOne({ customer_id: customer_id });
    if (chkwallet !== null) {
        walletSchema.findById(chkwallet._id, (err, docs) => {
            if (err) {
                console.log(err);
            }
            else {
                const trip = chkwallet.Trip_Transactions;
                // console.log(docs.Recharge_Transactions.length)
                res.render('wallet', { role: req.users.roles, length0: docs.Recharge_Transactions.length, length1: docs.Trip_Transactions.length, Trip: docs, account_number: req.users.cnic, balance: chkwallet.Total_Balance, msg: '', err_msg: '' });
            }
        }).sort({ _id: -1 })
    }
    else {
        console.log("No Record");
        res.render('wallet', { role: req.users.roles, length0: '0', length1: '0', Trip: '', account_number: req.users.cnic, balance: '1000', msg: '', err_msg: '' });
        // res.render('wallet', { balance: "1000", msg: '', err_msg: '' });
    }
})


Router.get('/admin_wallet', auth, async (req, res) => {
    if (req.users.roles === process.env.ADMIN) {
        const account_balance = await admin_transactionSchema.findOne({ customer_id: req.users.id });
        walletSchema.aggregate([{
            $lookup: {
                from: 'registration_forms',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'account'
            }
        },
        {
            $unwind: "$account"
        }
        ]).allowDiskUse(true).then((docs) => {
            admin_transactionSchema.find((err, data) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                else {
                    console.log("The data is : " + data[0].Transactions.length)
                    // console.log("The docs is : " + docs.length)
                    if (account_balance != null) {
                        res.render('admin_wallet', { data: data, account: account_balance.Total_Balance, account_number: req.users.cnic, docs: docs, err_msg: '', msg: '' })
                    }
                    else {
                        res.render('admin_wallet', { data: data, account: '100000', account_number: req.users.cnic, docs: docs, err_msg: '', msg: '' })
                    }
                }
            })
        }).catch((err) => {
            console.log(err);
            res.send(err);
            // res.status(500).send({
            //     msg:
            //         err_msg || "Some error occurred",
            // });
        });
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})

// Admin Wallet View Transaction Code

Router.get('/Transaction_view/:id', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN) {
        if (req.users.roles === process.env.ADMIN) {
            walletSchema.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
                if (err) {
                    throw err;
                }
                else {
                    console.log(docs.Trip_Transactions.length, docs.Recharge_Transactions.length)
                    res.render('Transaction_view', { length0: docs.Recharge_Transactions.length, length1: docs.Trip_Transactions.length, Transaction: docs })
                }
            })
        }
        else {
            res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
        }
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})

Router.get('/recharge_wallet/:id', auth, (req, res) => {
    if (req.users.roles === process.env.ADMIN) {
        walletSchema.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, docs) => {
            if (err) {
                throw err;
            }
            else {
                walletSchema.aggregate([{
                    $match: {
                        "_id": mongoose.Types.ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: 'registration_forms',
                        localField: 'customer_id',
                        foreignField: '_id',
                        as: 'account'
                    }
                }, { $unwind: "$account" }
                ]).allowDiskUse(true).then((docs) => {
                    res.render('recharge_wallet', { account: '', amount: '', account_input: docs, user_id: req.params.id, err_msg: "", msg: "" });
                }).catch((err) => {
                    console.log(err);
                });
            }
        })
    }
    else {
        res.render('admin_home', { name: req.cookies.jwt, role: req.users.roles, curr_user_email: req.users.email, err_msg: 'alert alert-danger', msg: 'Sorry! You have not permission to handle this page' })
    }
})


Router.post('/recharge_wallet/:id', auth, async (req, res) => {
    try {
        const customer = await walletSchema.findOne({ _id: req.params.id });
        const current_user = req.users._id;
        const admin_Trans = await admin_transactionSchema.findOne({ customer_id: current_user })
        const account = req.body.account;
        const amount = req.body.amount;
        var tbalance, balance;
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        if (account === "" && amount === "") {
            res.render('recharge_wallet', { account: 'Enter your account number', amount: 'Enter your balance amount', account_input: '', err_msg: '', msg: '' });
            return false;
        }
        else if (account === "") {
            res.render('recharge_wallet', { account: 'Enter your account number', amount: '', account_input: '', err_msg: '', msg: '' });
            return false;
        }
        else if (account.length < 13 || account.length > 13) {
            res.render('recharge_wallet', { account: 'Enter 13 digit your account number', amount: '', account_input: '', err_msg: '', msg: '' });
            return false;
        }
        else if (amount === "") {
            res.render('recharge_wallet', { account: '', amount: 'Enter your balance amount', account_input: '', err_msg: '', msg: '' });
            return false;
        }
        else {
            if (isNaN(amount)) {
                res.render('recharge_wallet', { account: '', amount: 'Please write only numeric number', account_input: '', err_msg: '', msg: '' });
                return false;
            }
            else {
                console.log("Done Sir");
                const chkaccount = await walletSchema.findOne({ _id: req.params.id });
                tbalance = Number(chkaccount.Total_Balance);
                tbalance += Number(amount);
                walletSchema.findByIdAndUpdate({ _id: req.params.id }, { Total_Balance: tbalance, $push: { Recharge_Transactions: [{ sender_account: 'Admin', date, time, recharge: amount }] } }, (err, docs) => {
                    if (err) {
                        console.log("Error")
                    }
                    else {
                        console.log("Updated");
                        if (admin_Trans != null) {
                            balance = Number(admin_Trans.Total_Balance);
                            balance -= Number(amount);
                            admin_transactionSchema.findByIdAndUpdate({ _id: admin_Trans._id }, { Total_Balance: balance, $push: { Transactions: [{ reciever_account: account, reciever_name: req.body.name, date, time, amount: amount }] } }, (err, docs) => {
                                if (err) {
                                    console.log("Error")
                                }
                                else {
                                    res.redirect('/admin_wallet')
                                }
                            })
                        }
                        else {
                            balance = Number('100000');
                            balance -= Number(amount);
                            const admintrans_Data = new admin_transactionSchema({
                                customer_id: current_user,
                                Total_Balance: balance,
                                Transactions: [{ reciever_account: account, reciever_name: req.body.name, date, time, amount }]
                            })
                            admintrans_Data.save(err => {
                                if (err) {
                                    console.log("Data not inserted");
                                    res.send(err);
                                    // res.render('index', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '' });
                                }
                                else {
                                    console.log("Data inserted");
                                    res.redirect('/admin_wallet');
                                    // res.render('location_check', { role: req.users.roles, balance: Total_Balance, err_msg: 'alert alert-success', msg: 'Thankyou! For the ride.' })

                                }
                            })
                        }
                        // res.render('admin_wallet', { err_msg: 'alert alert-success', msg: 'Thankyou! For the ride.' })
                    }
                })
            }
        }
    }
    catch (err) {
        console.log(err);
        res.send(err);
        // res.render('recharge_wallet', { account: '', amount: '', err_msg: "", msg: "" });
    }
})
Router.get('/location_check', auth, (req, res) => {
    res.render('location_check', { role: req.users.roles, err_msg: "", msg: "" });
})
Router.post('/location_check', auth, async (req, res) => {
    try {
        const customer_id = req.users._id;
        const chkwallet = await walletSchema.findOne({ customer_id: customer_id });
        var Total_Balance;
        var location = req.body.location;
        var fare;
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        // const date = datee;
        if (chkwallet !== null) {
            Total_Balance = chkwallet.Total_Balance;
        }
        else {
            Total_Balance = '1000';
        }
        if (location === process.env.MINAR) {
            fare = process.env.MINAR_FARE;
            Total_Balance -= fare;
        }
        else if (location === process.env.FORT) {
            fare = process.env.FORT_FARE;
            Total_Balance -= fare;
        }
        else if (location === process.env.ALAM) {
            fare = process.env.ALAM_FARE;
            Total_Balance -= fare;
        }
        else if (location === process.env.ISLAMABAD) {
            fare = process.env.ISLAMABAD_FARE;
            Total_Balance -= fare;
        }
        else {
            fare = process.env.IT_FARE;
            Total_Balance -= fare;
        }
        if (location === process.env.MINAR) {
            location = process.env.MINAR_LOC;
        }
        else if (location === process.env.FORT) {
            location = process.env.FORT_LOC;
        }
        else if (location === process.env.ALAM) {
            location = process.env.ALAM_LOC;
        }
        else if (location === process.env.ISLAMABAD) {
            location = process.env.ISLAMABAD_LOC;
        }
        else {
            location = process.env.IT_LOC;
        }
        if (chkwallet === null) {
            const walletData = new walletSchema({
                customer_id: customer_id,
                Total_Balance: Total_Balance,
                Trip_Transactions: [{ location, date, time, fare }]
            })
            walletData.save(err => {
                if (err) {
                    console.log("Data not inserted");
                    res.send(err);
                    // res.render('index', { name: '', email: '', password: '', re_password: '', cnic: '', mobile: '' });
                }
                else {
                    console.log("Data inserted");
                    res.render('location_check', { role: req.users.roles, balance: Total_Balance, err_msg: 'alert alert-success', msg: 'Thankyou! For the ride.' })

                }
            })
        }
        else {
            if (chkwallet.Total_Balance >= fare) {
                const wallet_id = chkwallet._id.toString();
                walletSchema.findByIdAndUpdate(wallet_id, { Total_Balance, $push: { Trip_Transactions: [{ location, date, time, fare }] } }, (err, docs) => {
                    if (err) {
                        console.log(err)
                        res.send(err);
                    }
                    else {
                        console.log("Updated");
                        res.render('location_check', { role: req.users.roles, balance: Total_Balance, err_msg: 'alert alert-success', msg: 'Thankyou! For the ride.' })
                    }
                })
            }
            else {
                res.render('location_check', { role: req.users.roles, err_msg: 'alert alert-danger', msg: 'Sorry! Please recharge your account first' })
            }
        }
    }
    catch (error) {
        console.log(error);
    }
})
Router.get('/logout', auth, async (req, res) => {
    try {
        // req.users.tokens = req.users.tokens.filter((curElement) => {
        //     req.curElement.token !== req.token;
        // })
        res.clearCookie("jwt");
        console.log("Logout Successfully");
        // await req.users.save();
        // res.render("login", { name: '' });
        res.redirect('/login');
    }
    catch (error) {
        res.status(500).send(error);
    }
})
module.exports = Router;