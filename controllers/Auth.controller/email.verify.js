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

module.exports = {
    verifyEmail
};
