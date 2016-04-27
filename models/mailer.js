var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport(
    'smtps://testbyelu%40gmail.com:ilovelittled@smtp.gmail.com'
));
module.exports = {
    send: function(mailOptions) {
        return transporter.sendMail(mailOptions);
    }
}
