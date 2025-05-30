require("dotenv").config();

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "FRONTEND_URL",
  "SESSION_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

requiredEnvVars.forEach((varName)=>{
    if(!process.env[varName]){
        throw new Error(`Environment varaible ${varName} is missing `);
    }
});

module.exports = {
    port: process.env.PORT,
    frontendURL: process.env.FRONTEND_URL,
};