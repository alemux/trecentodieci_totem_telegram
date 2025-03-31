let url_absolute = process.env.APP_URL || 'http://localhost:3043';

var whitelist = [
       
];

var mysql_database_connection, session_database;
let db_mode = 'digitalocean';

if(db_mode === 'digitalocean'){
    mysql_database_connection = {
        host: process.env.MYSQL_DIGITALOCEAN_URL,
        user: process.env.MYSQL_DIGITALOCEAN_USER,
        password: process.env.MYSQL_DIGITALOCEAN_PASSWORD,
        database: process.env.MYSQL_DIGITALOCEAN_DATABASE,
        port: process.env.MYSQL_DIGITALOCEAN_PORT
    }    
}

const mysql_logs = {
    host: process.env.MYSQL_DIGITALOCEAN_URL,
    user: process.env.MYSQL_DIGITALOCEAN_USER,
    password: process.env.MYSQL_DIGITALOCEAN_PASSWORD,
    database: process.env.MYSQL_DIGITALOCEAN_LOGS_DATABASE,
    port: process.env.MYSQL_DIGITALOCEAN_PORT
}    

session_database = mysql_database_connection;
session_database.schema = {
    tableName: '__sessions',
    columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
    }
}

var cookie_key = 'trecentodieci_23';
var cookie_secret = process.env.COOKIE_SECRET;

const GOOGLE_RECAPTCHA_SECRET=process.env.GOOGLE_RECAPTCHA_SECRET;
const GOOGLE_RECAPTCHA_KEY=process.env.GOOGLE_RECAPTCHA_KEY;

var email_defs = {
    send: true,
    email_mittente: 'info@trecentodieci.it',
    email_cc: '',
    email_bcc: '',
    smtp: {
        host: process.env.SMTP_SERVER,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_LOGIN, // generated ethereal user
            pass: process.env.SMTP_PASSWORD   // generated ethereal password
        },
        tls: { secureProtocol: "TLSv1_method" }
    }
}

// GiardinoBioDinamico, Via Mazzini 33, Biella BI
var COORDINATES_BASE = [8.0505923, 45.5634247];
var MAX_DISTANCE_DELIVERY = 30000;  // espresso in metri

module.exports = {
    url_absolute: url_absolute,
    whitelist : whitelist,
    mysql_connection: mysql_database_connection,
    mysql_logs: mysql_logs,
    cookie: {
        cookie_key: cookie_key,
        cookie_secret: cookie_secret
    },
    session_database: session_database,
    email_defs: email_defs,
    COORDINATES_BASE: COORDINATES_BASE,
    MAX_DISTANCE_DELIVERY: MAX_DISTANCE_DELIVERY,
    GOOGLE_RECAPTCHA_SECRET: GOOGLE_RECAPTCHA_SECRET,
    GOOGLE_RECAPTCHA_KEY: GOOGLE_RECAPTCHA_KEY,
    pics_folder_sizes : [60, 120, 240, 480, 800, 1600],
    pics_resolutions:   ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    pics_ext_whitelist: ['jpg', 'jpeg', 'png', 'gif', 'svg'],
}