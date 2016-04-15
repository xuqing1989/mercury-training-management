var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    password: String,
    email: String,
    name: String,
    role: String,
    batch_id: String,
    status: String,
});
