const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
    //_id: String,
    id: String,
    name: String,
    status: String,
    img: { data: Buffer, contentType: String }
});

const Status = mongoose.model('status', statusSchema);

module.exports = Status;