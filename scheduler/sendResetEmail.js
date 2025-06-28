const nodemailer = require('nodemailer');
const sendResetEmail = async(to, link) =>{
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: '"suryansh" <suryansh@gmail.com>',
        to,
        subject: 'reset your password',
        html: `<p>Click the link below to reset your password:</p><a href="${link}">${link}</a>`,
    });
};
module.exports = {sendResetEmail}