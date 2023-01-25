const mongoos = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const schema = mongoos.Schema;

let reg_record = new schema({
    // user_name: {
    //     type: String,
    // },
    name: {
        type: String,
        required: true
    },
    // dob: {
    //     type: Date,
    // },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // re_password: {
    //     type: String,
    //     required: true
    // },
    cnic: {
        type: Number,
        unique: true,
        require: true
    },
    mobile: {
        type: Number,
        require: true
    },
    roles: {
        type: String,
        default: 'View'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

reg_record.methods.generateAuthToken = async function () {
    try {
        console.log(this._id);
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch (err) {
        // res.send("The error part is : " + err);
        console.log(err);
    }
}

// reg_record.pre("save", async function (next) {
//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 10);
//         console.log(`password is: ${this.password}`);
//     }
//     next();
// })

module.exports = mongoos.model('registration_form', reg_record)