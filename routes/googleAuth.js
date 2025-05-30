const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { generateToken } = require('../utils/jwt');
const { frontendUrl } = require('../config/env');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

module.exports = router;