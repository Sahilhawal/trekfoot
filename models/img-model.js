const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var imgschema = new Schema({
    img: { data: Buffer, contentType: String },
    status: String
});

const img = mongoose.model('img', imgschema);

module.exports = img;