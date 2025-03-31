require('dotenv').config(); 
const express = require("express");
const session = require('express-session');
const cors = require('cors');
const app = express();
var helmet = require('helmet');
var MySQLStore = require('express-mysql-session')(session); 

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const { expressCspHeader, INLINE, NONE, SELF, EVAL } = require('express-csp-header');

// Import Telegram Bot Service
const telegramBot = require('./services/telegramBot');
// Import routes
const routes = require('./routes');
   
app.use(express.static("public"));   
app.use(bodyParser.json({ limit: '50mb' }));   
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));  
   
// protect this app        
app.use(helmet({  
    crossOriginEmbedderPolicy: false,    
}));     
    
app.disable('x-powered-by');   
 
app.use(expressCspHeader({  
    directives: {
        'default-src': [SELF, 'https://www.gstatic.com https://www.google.com https://cdn.ckeditor.com http://www.w3.org/2000/svg https://cdnjs.cloudflare.com'],
        'script-src': [SELF, INLINE, EVAL, 'data:','https://www.gstatic.com https://www.google.com https://cdn.ckeditor.com https://momentjs.com https://cdnjs.cloudflare.com https://s10.histats.com https://s4.histats.com'],
        'style-src': [SELF, INLINE, 'data:','https://fonts.googleapis.com https://stackpath.bootstrapcdn.com https://cdn.ckeditor.com https://rsms.me'],
        'font-src': [SELF, INLINE, 'data:','https://fonts.gstatic.com https://rsms.me https://fonts.googleapis.com'],
        'img-src': [SELF, INLINE, 'data:', 'images.com https://cdn.ckeditor.com'],        
        'worker-src': [SELF],
        'block-all-mixed-content': false
    }
}));     
                   
// Define allowed domains in your .env file
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf('*') !== -1 || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept', 
        'Origin',
        'x-api-key',
        'x-timestamp',
        'x-signature',
        'x-client-id',
        'x-client-secret'
    ]
}));

app.use(function (req, res, next) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-site')
    next()
}) 
  
app.set('view engine', 'ejs');        

// Monta le route
app.use('/', routes);

if(process.env.DEVELOPMENT_MODE === "true"){ 
   
}
 
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status = 404;
    next(err);
});
 
app.use(function(err, req, res, next) {
    res.status = 500;
    res.render('errors/500.ejs', {
        message: err.message,
        error: {
            status: res.status 
        }
    });
    return;
});  

// Solo se non siamo in ambiente di test, avviamo il server
if (process.env.NODE_ENV !== 'test') {
    var serverPort;
    if(process.env.PORT){
        serverPort = process.env.PORT;  
    }else{
        serverPort = process.env.PORT_DEV;
    }
    app.listen(serverPort, function () {
        console.log('API Server Active - '+ serverPort);     
    });
}

module.exports = app;
