const mongoos = require("mongoose");
const admin_transaction_schema = mongoos.Schema;

let admin_transaction_record = new admin_transaction_schema({
    customer_id: {
        type: mongoos.Types.ObjectId
    },
    Total_Balance: {
        type: Number
    },
    Transactions: [{
        reciever_account: {
            type: String,
            required: true
        },
        reciever_name: {
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
        amount: {
            type: Number,
            required: true
        }
    }]
})

module.exports = mongoos.model('admin_transaction_record', admin_transaction_record)