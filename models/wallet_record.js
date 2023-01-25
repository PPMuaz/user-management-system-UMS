const mongoos = require("mongoose");
const wallet_schema = mongoos.Schema;

let wallet_record = new wallet_schema({
    customer_id: {
        type: mongoos.Types.ObjectId
    },
    Total_Balance: {
        type: Number
    },
    Trip_Transactions: [{
        location: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        fare: {
            type: Number,
            required: true
        }
    }],
    Recharge_Transactions: [{
        sender_account: {
            type: String,
            default: 'Admin',
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        recharge: {
            type: Number,
            required: true
        }
    }]
})

module.exports = mongoos.model('wallet_record', wallet_record)