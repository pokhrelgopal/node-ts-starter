/**
 * Sends an OTP (One-Time Password) email to a recipient using Gmail's SMTP service.
 *
 * @module otpEmailSender
 */

import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { googleEmail, googlePassword } from "../config";

/**
 * Creates a transporter object using Gmail's SMTP service.
 * It uses the credentials stored in environment variables:
 * GOOGLE_EMAIL and GOOGLE_PASSWORD.
 *
 * @constant
 * @type {Transporter}
 */
const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: googleEmail,
    pass: googlePassword,
  },
});

/**
 * Sends an OTP email to the specified recipient.
 *
 * This function sends an HTML email containing the OTP code to the recipient.
 * It uses a pre-configured transporter with Gmail's SMTP settings.
 *
 * @function sendOtpEmail
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} otpCode - The OTP code to send to the recipient.
 * @returns {void} - Returns nothing, but logs success or failure to the console.
 *
 * @example
 * sendOtpEmail("recipient@example.com", "123456");
 */
export const sendOtpEmail = (recipientEmail: string, otpCode: string): void => {
  const mailOptions: SendMailOptions = {
    from: googleEmail,
    to: recipientEmail,
    subject: "Your OTP Code",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Your OTP Code</h2>
          <p>Hello,</p>
          <p>Here is your OTP code to complete the process:</p>
          <h3 style="color: #4CAF50; font-size: 24px;">${otpCode}</h3>
          <p>Use the code above to verify your identity.</p>
          <p>If you did not request this, please ignore this message.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>NodeJS App</strong></p>
        </body>
      </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("OTP sent: " + info.response);
    }
  });
};

export const sendResetPasswordLink = (
  recipientEmail: string,
  resetLink: string
): void => {
  const mailOptions: SendMailOptions = {
    from: googleEmail,
    to: recipientEmail,
    subject: "Password Reset Request",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your account. You can reset your password by clicking the link below:</p>
          <p>
            <a 
              href="${resetLink}" 
              style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>If the button above does not work, you can also copy and paste the following link into your browser:</p>
          <p style="word-wrap: break-word;">${resetLink}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>Your Application Team</strong></p>
          <p style="font-size: 12px; color: #999;">If you have any questions, please contact our support team.</p>
        </body>
      </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Password reset email sent:", info.response);
    }
  });
};
