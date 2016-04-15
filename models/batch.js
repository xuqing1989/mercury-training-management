var mongoose = require('mongoose');

module.exports = mongoose.model('Batch',{
    name: String,
    type: String,
    begin_date: Date,
    teacher_id: {type:String,ref:'User'},
    status: String,
});
