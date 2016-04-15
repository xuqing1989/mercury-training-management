var mongoose = require('mongoose');

module.exports = mongoose.model('Batch',{
    name: String,
    type: String,
    beginDate: Date,
    teacher: {type:String,ref:'User'},
    status: String,
});
