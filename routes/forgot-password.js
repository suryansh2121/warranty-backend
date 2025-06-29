const crypto = require("crypto");
const User = require("../model/user");
const { sendResetEmail } = require("../scheduler/sendResetEmail");
const { frontendURL } = require("./config/env");

const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const link = `${frontendURL}/reset-password/${token}`; 
    await sendResetEmail(user.email, link);

    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = ForgotPassword;
