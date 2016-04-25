var mongoose = require('mongoose');

module.exports = mongoose.model('Status',{
    checkInTime: Date,
    checkOutTime: Date,
    student: {type:String,ref:'User'},
    report:String,
    reportTime: Date,
});
