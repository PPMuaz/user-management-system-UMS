const mongoos = require("mongoose");
const aoi_schem = mongoos.Schema;

let aoi_record = new aoi_schem({
    role_id: {
        type: String
    },
    area: {
        type: String,
        required: true
    }

})


module.exports = mongoos.model('aoi_record', aoi_record)