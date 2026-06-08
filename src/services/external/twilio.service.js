const twilio = require('twilio');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

const sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });

    return {
      success: true,
      status: verification.status,
      message: 'OTP đã được gửi thành công'
    };
  } catch (error) {
    console.error('Twilio Send OTP Error:', error.message);
    return {
      success: false,
      message: error.message || 'Gửi OTP thất bại'
    };
  }
};

const verifyOTP = async (phoneNumber, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code
      });

    return {
      success: true,
      status: verificationCheck.status,
      valid: verificationCheck.valid
    };
  } catch (error) {
    console.error('Twilio Verify OTP Error:', error.message);
    return {
      success: false,
      message: error.message || 'Xác thực OTP thất bại'
    };
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};