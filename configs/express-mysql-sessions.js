const Definitions = require("./definitions");

const db_options = Definitions.session_database;
db_options.clearExpired = true;                         // Whether or not to automatically check for and clear expired sessions
db_options.checkExpirationInterval = 900000;            // How frequently expired sessions will be cleared; milliseconds:
db_options.expiration = 86400000;                       // The maximum age of a valid session; milliseconds:
db_options.endConnectionOnClose = true;

module.exports = {
    db: db_options,
    cookie_key: Definitions.cookie.cookie_key,
    cookie_secret: Definitions.cookie.cookie_secret
}