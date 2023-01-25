const mongoos = require("mongoose");
const recharge_schema = mongoos.Schema;

let recharge_record = new recharge_schema({
    wallet_id: {
        type: String
    },
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

module.exports = mongoos.model('recharge_record', recharge_record)