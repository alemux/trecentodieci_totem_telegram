require('dotenv').config();

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3300',
    COMMANDS: {
        SCREEN: '/screen',
        UPDATE: '/update'
    },
    CALLBACK_ACTIONS: {
        SELECT_TOTEM: 'select_totem',
        SCREEN: 'screen',
        UPDATE: 'update'
    },
    ERROR_MESSAGES: {
        NO_TOTEMS: 'Nessun totem disponibile per il tuo account.',
        NETWORK_ERROR: 'Errore di connessione. Riprova più tardi.',
        AUTH_ERROR: 'Errore di autenticazione. Controlla le tue credenziali.',
        UPDATE_ERROR: 'Errore durante l\'aggiornamento del totem.',
        SCREEN_ERROR: 'Errore durante il recupero dello screenshot.'
    },
    SUCCESS_MESSAGES: {
        UPDATE_SUCCESS: '✅ Totem aggiornato correttamente'
    }
}; 