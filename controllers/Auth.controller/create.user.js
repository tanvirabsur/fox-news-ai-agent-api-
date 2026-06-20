const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    try {
        const payload = req.body || req.query || {};
        const { name, email, password } = payload;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'name, email, and password are required'
            });
        }


    // const existingUser = await User.findOne({ email });

    // if (existingUser) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "User already exists"
    //     });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const user = await User.create({
    //     name,
    //     email,
    //     password: hashedPassword
    // });

    res.status(201).json({
        success: true,
        message: "Registration successful",
        data: payload,
        password: hashedPassword
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
};