const dotenv = require("dotenv");

dotenv.config();

/*
Required environment variables
The server will stop if any of these are missing
*/

const requiredEnv = [
    "DB_HOST",
    "DB_USER",
    "DB_PASS",
    "DB_NAME",
    "PORT",
    "JWT_SECRET"
];

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

const config = {
    port: parseInt(process.env.PORT, 10) || 5000,

    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES || "1d"
    },

    nodeEnv: process.env.NODE_ENV || "development"
};

module.exports = config;