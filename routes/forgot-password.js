const crypto =  require("crypto");
const User = require('../model/user');
const {sendResetEmail} = require("../scheduler/sendResetEmail")



const router = require("./authRoute");

router.post('/forgot-password', async(req , res)=>{
    const {email} = req.body;
    const user  = await User.findOne({email});
    if(!user) return res.status(404).json({message: 'user not found'});

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    const link = `http://localhost:5173/reset-password/${token}`;
    await sendResetEmail(user.email, link);
    res.json({message: "Reset link sent to your email."});

});
module.exports = router