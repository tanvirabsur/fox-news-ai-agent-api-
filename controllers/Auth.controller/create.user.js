const {UserModel} = require('../../Models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail } = require('./email.verify');
const { v4: uuidv4 } = require("uuid");

// Password validation helper
const validatePassword = (password) => {
    const errors = [];
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    return errors;
};

const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.query || req.body || {};

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password is weak',
                errors: passwordErrors
            });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");
        
        // Hash the token before storing
        const tokenHash = await bcrypt.hash(verificationToken, 10);

        const profilePicture =
            req.file?.path || "";

        // Set token expiry to 24 hours
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await UserModel.create({
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            profilePicture,
            verificationToken: tokenHash,
            verificationTokenExpiry: tokenExpiry
        });

        // Send verification email here 

        // Send Verification Email (pass unhashed token for URL)
        await sendVerificationEmail(
            user.email,
            verificationToken,
            tokenExpiry
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
