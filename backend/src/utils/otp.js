function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function includeOtpInResponse() {
  return process.env.NODE_ENV !== "production";
}

module.exports = {
  generateOtp,
  includeOtpInResponse
};
