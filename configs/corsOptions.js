// Configurazione CORS semplificata
const corsOptions = {
    origin: function (origin, callback) {
        // Permettiamo richieste senza origine specificata (come API calls, mobile apps, etc)
        if (!origin) return callback(null, true);
        
        // Elenco di domini autorizzati
        const allowedOrigins = [
            'http://localhost',
            'http://localhost:3000',
            'https://trecentodieci.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Non consentito da CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Impostazioni CSP (Content Security Policy)
const cspOptions = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "'unsafe-eval'", 
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
        ],
        styleSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
        ],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'"]
    }
};

module.exports = {
    corsOptions,
    cspOptions
};
