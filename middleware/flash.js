/**
 * Middleware per gestire i messaggi flash
 * Prende i messaggi dalla sessione e li passa alle view
 */
const flashMiddleware = (req, res, next) => {
    // Verifica se esiste un messaggio di successo nella sessione
    if (req.session.successMessage) {
        // Passa il messaggio alla view
        res.locals.successMessage = req.session.successMessage;
        // Rimuovi il messaggio dalla sessione
        delete req.session.successMessage;
    }
    
    // Verifica se esiste un messaggio di errore nella sessione
    if (req.session.errorMessage) {
        // Passa il messaggio alla view
        res.locals.errorMessage = req.session.errorMessage;
        // Rimuovi il messaggio dalla sessione
        delete req.session.errorMessage;
    }
    
    // Passa alla prossima funzione middleware
    next();
};

module.exports = flashMiddleware; 