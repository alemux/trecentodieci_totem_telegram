const express = require('express');
const router = express.Router();
const { validateAuth } = require('../middleware/authMiddleware');

// Route per la validazione dell'autenticazione
router.post('/validateAuth', validateAuth, (req, res) => {
    res.json({ valid: true });
});

// Route per ottenere l'elenco dei totem
router.get('/totems', validateAuth, async (req, res) => {
    try {
        // Qui implementeremo la logica per recuperare i totem associati all'utente
        // Per ora restituiamo un array vuoto
        res.json({ totems: [] });
    } catch (error) {
        console.error('Errore nel recupero dei totem:', error);
        res.status(500).json({ error: 'Errore nel recupero dei totem' });
    }
});

module.exports = router; 