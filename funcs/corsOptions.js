let ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
if(process.env.DEVELOPMENT_MODE == "true") {
    ALLOWED_ORIGINS = ['*'];
}

const corsOptions = {
    origin: (origin, callback) => {
        console.log("Origin: " + origin);
        console.log("Allowed Origins: " + ALLOWED_ORIGINS);
        console.log("Allowed Origins includes origin: " + ALLOWED_ORIGINS.includes(origin));
        if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

module.exports = corsOptions;
