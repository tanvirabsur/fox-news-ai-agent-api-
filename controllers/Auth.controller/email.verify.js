const nodemailer = require('nodemailer');


const verifyEmail = async (req, res) => {

    const { token } = req.params;

    const user = await User.findOne({
        verificationToken: token
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Invalid verification token"
        });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully"
    });


};


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (
    email,
    token
) => {


    const verificationUrl =
        `${process.env.CLIENT_URL} /verify-email/${token} `;

    await transporter.sendMail({
        from: `"My App" < ${process.env.EMAIL_USER}> `,
        to: email,
        subject: "Verify Your Email",

        html: `
        < div style = "font-family: Arial; padding:20px;" >
            <h2>Email Verification</h2>

            <p>
                Thank you for registering.
                Please verify your email address.
            </p>

            <a
                href="${verificationUrl}"
                style="
                    background:#000;
                    color:#fff;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:6px;
                    display:inline-block;
                "
            >
                Verify Email
            </a>

            <p style="margin-top:20px;">
                If you didn't create an account,
                please ignore this email.
            </p>
        </div >
    `,
    });


};


module.exports = {
    verifyEmail,
    sendVerificationEmail
};
