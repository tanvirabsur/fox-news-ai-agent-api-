const {UserModel} = require('../../Models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail } = require('./email.verify');


const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.query || req.body || {};

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const profilePicture =
            req.file?.path || "";

        const user = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            profilePicture,
            verificationToken
        });

        // Send verification email here 

        // Send Verification Email 
        await sendVerificationEmail(
            user.email,
            verificationToken
        );


        res.status(201).json({
            success: true,
            message:
                "Registration successful. Please verify your email.",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }


};

module.exports = {
    registerUser
}
