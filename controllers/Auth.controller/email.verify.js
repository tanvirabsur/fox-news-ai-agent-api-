const nodemailer = require('nodemailer');
const { UserModel } = require('../../Models/user.model');
const bcrypt = require('bcrypt');


const verifyEmail = async (req, res) => {

    const { token } = req.params;

    try {
        // Find all users with verification token
        const users = await UserModel.find({ verificationToken: { $ne: null } });
        
        let user = null;
        
        // Compare token hash with provided token
        for (let u of users) {
            const isTokenValid = await bcrypt.compare(token, u.verificationToken);
            if (isTokenValid) {
                user = u;
                break;
            }
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token"
            });
        }

        // Check if token has expired
        if (user.verificationTokenExpiry < new Date()) {
            user.verificationToken = null;
            user.verificationTokenExpiry = null;
            await user.save();
            
            return res.status(400).json({
                success: false,
                message: "Verification token has expired. Please register again."
            });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiry = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now login."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error verifying email: " + error.message
        });
    }

};


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SENDER_EMAIL || process.env.VERIFY_EMAIL_SECRET,
        pass: process.env.APP_PASSWORD,
    },
});

const sendVerificationEmail = async (
    email,
    token,
    expiryTime
) => {

    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;
    const expiryHours = Math.round((expiryTime - new Date()) / (60 * 60 * 1000));

    try {
        await transporter.sendMail({
            from: `"Fox News AI" <${process.env.SENDER_EMAIL || process.env.VERIFY_EMAIL_SECRET}>`,
            to: email,
            subject: "Verify Your Email - Fox News AI Agent",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Email Verification Required</h2>
        
        <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Fox News AI Agent.
            Please verify your email address to complete your registration.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
                style="
                    background-color: #1a1a1a;
                    color: #fff;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                    font-weight: bold;
                "
            >
                Verify Email
            </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            This link expires in ${expiryHours} hours.
        </p>
        
        <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            If you didn't create this account, please ignore this email.
            For security, never share this email with anyone.
        </p>
    </div>
</body>
</html>
            `,
        });
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }


};


module.exports = {
    verifyEmail,
    sendVerificationEmail
};
