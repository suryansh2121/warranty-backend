require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { port, frontendURL } = require("./config/env");
const authRoutes = require("./routes/authRoute");
const googleAuthRoutes = require("./routes/googleAuth");
const warrantyRoutes = require("./routes/productRoute");
const { scheduleReminders } = require("./scheduler/mailScheduler");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const forgotpassword = require("./routes/forgot-password")
const resetpassword = require("./routes/reset-password")

const app = express();

app.use(helmet());
app.use(morgan("combined"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/warranty", warrantyRoutes);
app.use("api/auth/forgot-password", forgotpassword)
app.use("api/auth/reset-password", resetpassword)

app.use(errorHandler);

scheduleReminders();

app.listen(port, () => console.log(`Server running on port ${port}`));
