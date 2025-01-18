/**
 * Generates a 6-digit OTP
 * @returns {number} A 6-digit OTP
 */
function otpGenerator(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

export { otpGenerator };
