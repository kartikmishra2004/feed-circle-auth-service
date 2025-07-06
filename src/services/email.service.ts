import * as nodemailer from "nodemailer";
import { API_BASE } from "../config/constants";

export interface EmailTemplate {
  to_email: string;
  to_name: string;
  subject: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  data: EmailTemplate,
  token: string
): Promise<void> {
  const verificationLink = `${process.env.BASE_URL}${API_BASE}/auth/verify-email?token=${token}`;
  const mailOptions = {
    from: "Bird App",
    to: data.to_email,
    subject: data.subject,
    html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; padding-top: 50px; padding-bottom: 50px; padding-left: 10px; padding-right: 10px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600"
                    style="background-color: #ffffff; border-radius: 20px; padding: 30px; font-family: Arial, sans-serif; box-shadow: 0px 0px 10px #d6d6d6">
                    <tr>
                        <td align="center">
                            <img alt="logo"
                                src="https://res.cloudinary.com/dlwudcsu1/image/upload/v1751710616/Logo_1_bvog3n.png"
                                style="width: 100px;"
                                ></img>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="color: #222222;">
                            <h2>Email verification for Bird</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #A8A8A9; font-size: 14px; padding-bottom: 10px; text-align: center;">
                            Hello ${data.to_name}, click on the link below to verify your email address and activate
                            your Bird account.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 20px;">
                            <a href="${verificationLink}"
                                style="background-color: #222222; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                Verify Email
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
      `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  data: EmailTemplate,
  token: string
): Promise<void> {
  const resetLink = `${process.env.BASE_URL}${API_BASE}/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: "Bird App",
    to: data.to_email,
    subject: data.subject,
    html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; padding-top: 50px; padding-bottom: 50px; padding-left: 10px; padding-right: 10px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600"
                    style="background-color: #ffffff; border-radius: 20px; padding: 30px; font-family: Arial, sans-serif; box-shadow: 0px 0px 10px #d6d6d6">
                    <tr>
                        <td align="center">
                            <img alt="logo"
                                src="https://res.cloudinary.com/dlwudcsu1/image/upload/v1751710616/Logo_1_bvog3n.png"
                                style="width: 100px;"
                                ></img>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="color: #222222;">
                            <h2>Password Reset Request</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #A8A8A9; font-size: 14px; padding-bottom: 10px; text-align: center;">
                            Hello ${data.to_name}, click on the link below to reset your password.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 20px;">
                            <a href="${resetLink}"
                                style="background-color: #222222; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                Reset Password
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
      `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: ", info.response);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
  }
}

export async function sendPasswordResetSuccessEmail(
  data: EmailTemplate
): Promise<void> {
  const mailOptions = {
    from: "Bird App",
    to: data.to_email,
    subject: data.subject,
    html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; padding-top: 50px; padding-bottom: 50px; padding-left: 10px; padding-right: 10px;">
            <tr>
                <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600"
                    style="background-color: #ffffff; border-radius: 20px; padding: 30px; font-family: Arial, sans-serif; box-shadow: 0px 0px 10px #d6d6d6;">
                    <tr>
                    <td align="center">
                        <img alt="logo"
                        src="https://res.cloudinary.com/dlwudcsu1/image/upload/v1751710616/Logo_1_bvog3n.png"
                        style="width: 100px;" />
                    </td>
                    </tr>
                    <tr>
                    <td align="center" style="color: #222222;">
                        <h2>Password Reset Successful</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="color: #A8A8A9; font-size: 14px; padding-bottom: 10px; text-align: center;">
                        Hello ${data.to_name}, your password has been successfully reset. If you did not initiate this action, please secure your account immediately.
                    </td>
                    </tr>
                    <tr>
                    <td style="color: #A8A8A9; font-size: 12px; padding-top: 10px; text-align: center;">
                        If this was you, you can safely ignore this message.
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
        </table>
        `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent: ", info.response);
  } catch (error) {
    console.error("Error sending password reset success email: ", error);
  }
}
