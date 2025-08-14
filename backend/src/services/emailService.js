import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Generate reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email, code, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"YegnaChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your YegnaChat Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">YegnaChat</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Welcome to the community!</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${fullName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up for YegnaChat! To complete your registration and start chatting with friends, please verify your email address.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Enter this code in the YegnaChat app to verify your account. This code will expire in <strong>5 minutes</strong>.
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security tip:</strong> Never share this code with anyone. YegnaChat will never ask for your verification code via phone or email.
              </p>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; text-align: center;">
              If you didn't create a YegnaChat account, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 YegnaChat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, fullName) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"YegnaChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your YegnaChat Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">YegnaChat</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Password Reset Request</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${fullName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your YegnaChat password. If you made this request, click the button below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 14px; color: #333;">
              ${resetUrl}
            </div>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; text-align: center;">
              If you're having trouble, contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 YegnaChat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Send password reset code email
export const sendPasswordResetCodeEmail = async (email, resetCode, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"YegnaChat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your YegnaChat Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">YegnaChat</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Password Reset Request</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${fullName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your YegnaChat password. Use the verification code below to reset your password:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Your password reset code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; font-family: monospace;">
                ${resetCode}
              </div>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Enter this code on the password reset page to create your new password.
            </p>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security tip:</strong> Never share this code with anyone. YegnaChat will never ask for your verification code via phone or email.
              </p>
            </div>
            
            <p style="color: #888; font-size: 14px; margin-top: 30px; text-align: center;">
              If you're having trouble, contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 YegnaChat. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error('Error sending password reset code email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send password reset code email: ${error.message}`);
  }
};