var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MMS');

module.exports = mongoose.model('User',{
        password: String,
        email: String,
        name: String,
        role: String,
});
