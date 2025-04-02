const crypto = require('crypto');

const verifyToken = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const timestamp = req.headers['x-timestamp'];
    const signature = req.headers['x-signature'];
    
    // Check if all required headers are present
    if (!apiKey || !timestamp || !signature) {
        return res.status(401).json({
            status: 401,
            message: "Missing security headers"
        });
    }

    // Verify API key matches
    if (apiKey !== process.env.PUBLIC_API_KEY) {
        return res.status(401).json({
            status: 401,
            message: "Invalid API key"
        });
    }

    // Verify timestamp is not older than 5 minutes
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - parseInt(timestamp) > 300) {
        return res.status(401).json({
            status: 401,
            message: "Request expired"
        });
    }

    // Verify signature
    const message = `${apiKey}:${timestamp}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.PUBLIC_API_SECRET)
        .update(message)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(401).json({
            status: 401,
            message: "Invalid signature"
        });
    }

    next();
};

const isAdmin = (req, res, next) => {
    console.log('Controllo sessione admin:', req.session);
    if (!req.session) {
        console.error('Errore: Sessione non disponibile');
        return res.redirect('/admin/login?error=no_session');
    }
    
    if (req.session.isAdmin) {
        console.log('Utente autenticato come admin');
        next();
    } else {
        console.log('Accesso non autorizzato: utente non admin');
        res.redirect('/admin/login?error=unauthorized');
    }
};

module.exports = {
    verifyToken,
    isAdmin
}; 