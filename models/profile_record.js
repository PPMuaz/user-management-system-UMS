const mongoos = require("mongoose");
const schem = mongoos.Schema;

let profile_record = new schem({
    u_id: {
        type: String
    },
    uname: {
        type: String
    },
    dob: {
        type: String
    },
    gender: {
        type: String
    },
    occup: {
        type: String
    },
    university: {
        type: String
    },
    intro: {
        type: String
    },
    aoi: {
        type: String
    }
})


module.exports = mongoos.model('profile_record', profile_record)