var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ms772254@gmail.com',
        pass: 'supkkmdxietlnawm'
    }
});

exports.mail = async (mailOptions) => {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
