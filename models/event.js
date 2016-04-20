var mongoose = require('mongoose');

module.exports = mongoose.model('Event',{
    title: String,
    type: String,
    startDate: Date,
    endDate: Date,
    content:String,
    batch: {type:String,ref:'Batch'},
    status: String,
});
