const jwt = require('jsonwebtoken');
const { UserModel } = require('../../Models/user.model');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {

try {

    const payload = req.body || req.query || {};
    const { email, password } = payload;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'email and password are required'
        });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    // Check if account is locked due to failed attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(429).json({
            success: false,
            message: "Account temporarily locked. Try again later"
        });
    }

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Please verify your email before logging in"
        });
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        // Track failed login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts for 15 minutes
        if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        
        await user.save();
        
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15d"
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        token
    });

} catch (error) {

    res.status(500).json({
        success: false,
        message: error.message
    });

}

};

module.exports = {
    loginUser
};