const router = require("./authRoute");
const User = require('../model/user');

router.post('/reset-password/:token', async(req , res)=>{
    const user = await User.findOne({
        resetToken: req.param.token,
        resetTokenExpiry: {$gt:Date.now()},
    });
    if(!user) return res.status(400).json ({message: "Invalid or expired token"});
    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({message: "Password has been reset."})
})
module.exports  = router