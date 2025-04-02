require('dotenv').config(); 
const express = require("express");
const session = require('express-session');
const cors = require('cors');
const app = express();
var helmet = require('helmet');
// Importo mysql normale (non promise) per la gestione delle sessioni
const mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session); 
const ejsMate = require('ejs-mate');

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const { expressCspHeader, INLINE, NONE, SELF, EVAL } = require('express-csp-header');

// Import Telegram Bot Service
const telegramBot = require('./services/telegramBot');
// Import routes
const routes = require('./routes');
const { corsOptions } = require('./configs/corsOptions');

// Basic middleware
app.use(express.static("public"));   
app.use(bodyParser.json({ limit: '50mb' }));   
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));  

// Session configuration
const options = {
    host: process.env.DB_HOST || process.env.MYSQL_DIGITALOCEAN_URL,
    port: process.env.DB_PORT || process.env.MYSQL_DIGITALOCEAN_PORT,
    user: process.env.DB_USER || process.env.MYSQL_DIGITALOCEAN_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_DIGITALOCEAN_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DIGITALOCEAN_DATABASE
};

// Creo una connessione MySQL standard (non promise-based)
const connection = mysql.createPool(options);

// Configurazione separata per lo store utilizzando la connessione creata
const sessionStore = new MySQLStore({
    clearExpired: true,
    createDatabaseTable: true,
    checkExpirationInterval: 900000, // Controlla le sessioni scadute ogni 15 minuti
    expiration: 86400000, // Le sessioni scadono dopo 24 ore
    tableName: 'sessions',
    connectionLimit: 10,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, connection);

app.use(session({
    key: 'admin_session',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax', // Protegge da CSRF ma permette alcune operazioni cross-origin
        path: '/'
    }
}));

// Security middleware
app.use(helmet({  
    crossOriginEmbedderPolicy: false,    
}));     
app.disable('x-powered-by');   

// CSP configuration
app.use(expressCspHeader({  
    directives: {
        'default-src': [SELF, 'https://www.gstatic.com', 'https://www.google.com', 'https://cdn.ckeditor.com', 'http://www.w3.org/2000/svg', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
        'script-src': [SELF, INLINE, EVAL, 'data:', 'https://www.gstatic.com', 'https://www.google.com', 'https://cdn.ckeditor.com', 'https://momentjs.com', 'https://cdnjs.cloudflare.com', 'https://s10.histats.com', 'https://s4.histats.com', 'https://cdn.jsdelivr.net'],
        'style-src': [SELF, INLINE, 'data:', 'https://fonts.googleapis.com', 'https://stackpath.bootstrapcdn.com', 'https://cdn.ckeditor.com', 'https://rsms.me', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        'font-src': [SELF, INLINE, 'data:', 'https://fonts.gstatic.com', 'https://rsms.me', 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        'img-src': [SELF, INLINE, 'data:', 'images.com', 'https://cdn.ckeditor.com', 'https://cdn.jsdelivr.net', 'blob:'],
        'worker-src': [SELF],
        'block-all-mixed-content': false
    }
}));     

// CORS configuration
app.use(cors(corsOptions));

app.use(function (req, res, next) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-site')
    next()
}) 
  
// Set view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);

if(process.env.DEVELOPMENT_MODE === "true"){ 
   
}
 
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
    const serverPort = process.env.PORT || 3043;
    app.listen(serverPort, () => {
        console.log(`Server is running on port ${serverPort}`);
    });
}

module.exports = app;
