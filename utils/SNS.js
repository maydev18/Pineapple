const axios = require('axios');
const urlencode = require('urlencode');

exports.sendSMS = async (phoneNumber, otp) => {
    try {
        const apikey = process.env.SMS_KEY; // Replace this with your actual Textlocal API key
        const sender = 'PNAPLE';
        const msg = encodeURIComponent(`${otp} is your OTP for signing into thepineapple.in%n %n-thepineapple.in`);
        const data = `apikey=${apikey}&sender=${sender}&numbers=91${phoneNumber}&message=${msg}`;
        const response = await axios.get(`https://api.textlocal.in/send?${data}`);
        console.log(response);
    } catch (error) {
        console.error("Error sending the sms");
    }
};
