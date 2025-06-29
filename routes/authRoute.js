const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const authController = require('../controller/authcontroller');
const user = require('../model/user');
const ForgotPassword = require("./forgot-password");
const ResetPassword = require('./reset-password');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', auth , (req, res) =>{
    res.json({user: req.user});
});
router.post('/forgot-password', ForgotPassword);
router.post("/reset-password/:token", ResetPassword);

module.exports = router;