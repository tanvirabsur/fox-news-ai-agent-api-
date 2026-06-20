const jwt = require('jsonwebtoken');


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

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
        });
    }

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