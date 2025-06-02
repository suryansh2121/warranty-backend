require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
const { port, frontendUrl } = require('./config/env');
const authRoutes = require('./routes/authRoute');
const googleAuthRoutes = require('./routes/googleAuth');
const warrantyRoutes = require('./routes/productRoute');
const { scheduleReminders } = require('./scheduler/mailScheduler');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/warranty', warrantyRoutes);

app.use(errorHandler);

scheduleReminders();

app.listen(port, () =>
    console.log(`Server running on port ${port}`)
);