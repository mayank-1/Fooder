const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const querySchema = new Schema({
    id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const Query = mongoose.model("Query", querySchema);
module.exports = Query;