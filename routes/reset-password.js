const User = require("../model/user");

const ResetPassword = async (req, res) => {
  try {
    const { password } = req.body;           
    const { token } = req.params;            

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password has been reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = ResetPassword;
