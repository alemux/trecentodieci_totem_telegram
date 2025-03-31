require('dotenv').config({ path: '.env.test' });
const botConfig = require('../configs/botConfig');

// Mock di axios
jest.mock('axios');

// Mock del servizio Telegram Bot
jest.mock('../services/telegramBot', () => {
    const handlers = {
        screenCommand: null,
        updateCommand: null,
        callbackQueryHandler: null
    };

    const mockBot = {
        onText: jest.fn((regex, callback) => {
            if (regex.toString().includes('/screen')) {
                handlers.screenCommand = callback;
            } else if (regex.toString().includes('/update')) {
                handlers.updateCommand = callback;
            }
        }),
        on: jest.fn((event, callback) => {
            if (event === 'callback_query') {
                handlers.callbackQueryHandler = callback;
            }
        }),
        sendMessage: jest.fn(),
        sendPhoto: jest.fn()
    };

    // Esponi i metodi del bot e i gestori dei comandi
    return {
        ...mockBot,
        bot: mockBot,
        screenCommand: (msg) => handlers.screenCommand(msg),
        updateCommand: (msg) => handlers.updateCommand(msg),
        callbackQueryHandler: (query) => handlers.callbackQueryHandler(query),
        handleScreenCommand: jest.fn().mockImplementation(async (chatId, url, token) => {
            const response = await require('axios').get(`${url}/updates/screenshot`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'arraybuffer'
            });
            await mockBot.sendPhoto(chatId, response.data);
        })
    };
});

// Mock del middleware di autenticazione
jest.mock('../middleware/authMiddleware', () => ({
    validateAuth: jest.fn((req, res, next) => {
        if (req.body && req.body.token && req.body.url) {
            next();
        } else {
            res.status(400).json({ error: 'Token e URL sono richiesti' });
        }
    })
})); 