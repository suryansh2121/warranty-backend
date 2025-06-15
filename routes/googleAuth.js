const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const passport = require('../config/passport');
const { generateToken } = require('../utils/jwt');
const { frontendURL } = require('../config/env');
const User  = require('../model/user')

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔁 Old OAuth redirect flow
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${frontendURL}/?token=${token}`);
  }
);

// ✅ New: Google One Tap / React Token Flow
router.post('/', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        googleId: sub,
        avatar: picture,
      });
    }

    const jwt = generateToken(user._id);
    res.status(200).json({ token: jwt });
  } catch (err) {
    console.error("Google login error:", err.message);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
