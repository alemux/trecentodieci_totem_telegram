const telegramBot = require('../../services/telegramBot');
const axios = require('axios');

jest.mock('axios');

describe('TelegramBot Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Command Handlers', () => {
        it('should handle /screen command', async () => {
            const mockMsg = {
                from: { id: 123 },
                chat: { id: 456 }
            };

            // Mock getUserTotems
            axios.get.mockResolvedValueOnce({
                data: {
                    totems: [
                        { id: 1, name: 'Totem 1', url: 'http://totem1.com', token: 'token1' }
                    ]
                }
            });

            // Registra il comando screen
            telegramBot.onText(/\/screen/, async (msg) => {
                await telegramBot.sendMessage(msg.chat.id, 'Seleziona un totem', {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: 'Totem 1', callback_data: 'screen|1|http://totem1.com|token1' }
                        ]]
                    }
                });
            });

            // Esegui il comando screen
            await telegramBot.onText.mock.calls[0][1](mockMsg);

            expect(telegramBot.sendMessage).toHaveBeenCalledWith(
                456,
                expect.stringContaining('Seleziona un totem'),
                expect.any(Object)
            );
        });

        it('should handle /update command', async () => {
            const mockMsg = {
                from: { id: 123 },
                chat: { id: 456 }
            };

            // Mock getUserTotems
            axios.get.mockResolvedValueOnce({
                data: {
                    totems: [
                        { id: 1, name: 'Totem 1', url: 'http://totem1.com', token: 'token1' }
                    ]
                }
            });

            // Registra il comando update
            telegramBot.onText(/\/update/, async (msg) => {
                await telegramBot.sendMessage(msg.chat.id, 'Seleziona un totem', {
                    reply_markup: {
                        inline_keyboard: [[
                            { text: 'Totem 1', callback_data: 'update|1|http://totem1.com|token1' }
                        ]]
                    }
                });
            });

            // Esegui il comando update
            await telegramBot.onText.mock.calls[0][1](mockMsg);

            expect(telegramBot.sendMessage).toHaveBeenCalledWith(
                456,
                expect.stringContaining('Seleziona un totem'),
                expect.any(Object)
            );
        });
    });

    describe('Callback Query Handler', () => {
        it('should handle screen callback query', async () => {
            const mockCallbackQuery = {
                data: 'screen|1|http://totem1.com|token1',
                message: { chat: { id: 456 } }
            };

            // Mock screenshot request
            const mockImageData = Buffer.from('fake-image-data');
            axios.get.mockImplementation((url, config) => {
                if (url === 'http://totem1.com/updates/screenshot') {
                    return Promise.resolve({
                        data: mockImageData,
                        headers: { 'content-type': 'image/jpeg' }
                    });
                }
                return Promise.reject(new Error('Unexpected URL'));
            });

            // Registra il callback query handler
            telegramBot.on('callback_query', async (query) => {
                const [action, id, url, token] = query.data.split('|');
                if (action === 'screen') {
                    await telegramBot.handleScreenCommand(query.message.chat.id, url, token);
                }
            });

            // Esegui il callback query handler
            await telegramBot.on.mock.calls[0][1](mockCallbackQuery);

            expect(axios.get).toHaveBeenCalledWith(
                'http://totem1.com/updates/screenshot',
                {
                    headers: { 'Authorization': 'Bearer token1' },
                    responseType: 'arraybuffer'
                }
            );
            expect(telegramBot.sendPhoto).toHaveBeenCalledWith(
                456,
                expect.any(Buffer)
            );
        });

        it('should handle update callback query', async () => {
            const mockCallbackQuery = {
                data: 'update|1|http://totem1.com|token1',
                message: { chat: { id: 456 } }
            };

            // Mock update request
            axios.post.mockResolvedValueOnce({ data: { success: true } });

            // Registra il callback query handler
            telegramBot.on('callback_query', async (query) => {
                const [action, id, url, token] = query.data.split('|');
                if (action === 'update') {
                    await axios.post(`${url}/api/update`, {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    await telegramBot.sendMessage(query.message.chat.id, 'Totem aggiornato con successo');
                }
            });

            // Esegui il callback query handler
            await telegramBot.on.mock.calls[0][1](mockCallbackQuery);

            expect(telegramBot.sendMessage).toHaveBeenCalledWith(
                456,
                expect.stringContaining('Totem aggiornato')
            );
        });
    });
}); 