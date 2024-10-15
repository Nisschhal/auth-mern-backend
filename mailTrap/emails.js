import { User } from "../models/user.models.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailTrapClient, sender } from "./mailTrap.config.js";

// SEND THE VERIFICATION MAIL
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error sending verification", error);
    throw new Error(`Error sending verification ${error}`);
  }
};

// SEND THE WELCOME MAIL
export const sendWelcomEmail = async (email, name) => {
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: [{ email }],
      template_uuid: "e50bf34b-a82d-419e-a5e9-be1a46cb4f05",
      template_variables: {
        company_info_name: "MERN Auth",
        name,
        company_info_address: "Kathmandu/Butwal",
      },
    });
    console.log(`Welcome Email send Successfully!, ${response}`);
  } catch (error) {
    console.log(`Error while sending welcome mail: ${error.message}`);
  }
};

// SEND RESET PASSWORD EMAIL
export const sendResetPasswordEmail = async (email, resetUrl) => {
  const template = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    "{resetURL}",
    resetUrl
  );
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset",
      html: template,
      category: "password reset",
    });
  } catch (error) {
    console.log(`Error while sending reset email: ${error.message}`);
    throw new Error(`Error while sending reset email: ${error.message}`);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password reset",
    });
  } catch (error) {
    console.log(`Error while sending reset success email: ${error}`);
    throw new Error(`Error while sending reset success email: ${error}`);
  }
};
