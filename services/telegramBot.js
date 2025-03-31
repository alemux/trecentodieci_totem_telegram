const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const config = require('../configs/botConfig');
const { validateAuth } = require('../middleware/authMiddleware');
const mysql = require('mysql');
const MysqlParameters = require('../configs/definitions').mysql_connection;
const crypto = require('crypto');

class TelegramBotService {
    constructor() {
        this.bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
        this.setupCommandHandlers();
        this.totemCache = new Map(); // Cache to store totem data
        this.clientCache = new Map(); // Cache to store client data
    }

    setupCommandHandlers() {
        // Handle /screen command
        this.bot.onText(new RegExp(config.COMMANDS.SCREEN), async (msg) => {
            try {
                const clients = await this.getClients();
                if (!clients || clients.length === 0) {
                    this.bot.sendMessage(msg.chat.id, config.ERROR_MESSAGES.NO_TOTEMS);
                    return;
                }

                // Update cache with client data using client_id as key
                clients.forEach(client => {
                    this.clientCache.set(client.client_id, client);
                });

                const buttons = this.createClientButtons(clients, config.CALLBACK_ACTIONS.SCREEN);
                this.bot.sendMessage(msg.chat.id, 'Seleziona un cliente:', {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            } catch (error) {
                console.error('Errore nel comando screen:', error);
                this.bot.sendMessage(msg.chat.id, config.ERROR_MESSAGES.NETWORK_ERROR);
            }
        });

        // Handle /update command
        this.bot.onText(new RegExp(config.COMMANDS.UPDATE), async (msg) => {
            try {
                const clients = await this.getClients();
                if (!clients || clients.length === 0) {
                    this.bot.sendMessage(msg.chat.id, config.ERROR_MESSAGES.NO_TOTEMS);
                    return;
                }

                // Update cache with client data using client_id as key
                clients.forEach(client => {
                    this.clientCache.set(client.client_id, client);
                });

                const buttons = this.createClientButtons(clients, config.CALLBACK_ACTIONS.UPDATE);
                this.bot.sendMessage(msg.chat.id, 'Seleziona un cliente:', {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            } catch (error) {
                console.error('Errore nel comando update:', error);
                this.bot.sendMessage(msg.chat.id, config.ERROR_MESSAGES.NETWORK_ERROR);
            }
        });

        // Handle callback queries
        this.bot.on('callback_query', async (callbackQuery) => {
            const [action, type, id] = callbackQuery.data.split(':');
            
            try {
                switch (action) {
                    case config.CALLBACK_ACTIONS.SCREEN:
                    case config.CALLBACK_ACTIONS.UPDATE:
                        if (type === 'client') {
                            await this.handleClientSelection(callbackQuery.message.chat.id, id, action);
                        } else if (type === 'totem') {
                            const totem = this.totemCache.get(parseInt(id));
                            if (!totem) {
                                this.bot.sendMessage(callbackQuery.message.chat.id, config.ERROR_MESSAGES.NETWORK_ERROR);
                                return;
                            }
                            if (action === config.CALLBACK_ACTIONS.SCREEN) {
                                await this.handleScreenCommand(callbackQuery.message.chat.id, totem.ip, totem.SECRET_KEY);
                            } else {
                                await this.handleUpdateCommand(callbackQuery.message.chat.id, totem.ip, totem.SECRET_KEY, totem.nome);
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error('Errore nella gestione del callback:', error);
                this.bot.sendMessage(callbackQuery.message.chat.id, config.ERROR_MESSAGES.NETWORK_ERROR);
            }
        });
    }

    createClientButtons(clients, action) {
        return clients.map(client => [{
            text: client.nome,
            callback_data: `${action}:client:${client.client_id}`
        }]);
    }

    createTotemButtons(totems, action) {
        return totems.map(totem => [{
            text: totem.nome,
            callback_data: `${action}:totem:${totem.idtotem}`
        }]);
    }

    async getClients() {
        const mysql_conn = mysql.createConnection(MysqlParameters);
        try {
            const sql = "SELECT id, client_id, nome, platform FROM totemdigitale_cliente";
            const result = await new Promise((resolve, reject) => {
                mysql_conn.query(sql, [], (error, results) => {
                    if (error) {
                        console.error('Errore nel recupero dei clienti:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
            return result;
        } catch (error) {
            console.error('Errore nel recupero dei clienti:', error);
            throw error;
        } finally {
            mysql_conn.end();
        }
    }

    async getTotemsByClient(clientId) {
        const mysql_conn = mysql.createConnection(MysqlParameters);
        try {
            console.log("clientId",clientId);
            const sql = "SELECT t.idtotem, t.nome, t.ip, t.SECRET_KEY, t.CLIENT_ID FROM totemdigitale t INNER JOIN totemdigitale_cliente c ON t.CLIENT_ID = c.client_id WHERE c.client_id = ?";
            const result = await new Promise((resolve, reject) => {
                mysql_conn.query(sql, [clientId], (error, results) => {
                    if (error) {
                        console.error('Errore nel recupero dei totem:', error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
            return result;
        } catch (error) {
            console.error('Errore nel recupero dei totem:', error);
            throw error;
        } finally {
            mysql_conn.end();
        }
    }

    async handleClientSelection(chatId, clientId, action) {
        try {
            const totems = await this.getTotemsByClient(clientId);
            if (!totems || totems.length === 0) {
                this.bot.sendMessage(chatId, config.ERROR_MESSAGES.NO_TOTEMS);
                return;
            }

            // Update cache with totem data
            totems.forEach(totem => {
                this.totemCache.set(totem.idtotem, totem);
            });

            const client = this.clientCache.get(clientId);
            
            if (action === config.CALLBACK_ACTIONS.UPDATE) {
                // For update command, process all totems directly
                this.bot.sendMessage(chatId, `🔄 Aggiornamento in corso per tutti i totem di ${client.nome}...`);
                
                const results = [];
                for (const totem of totems) {
                    const result = await this.handleUpdateCommand(chatId, totem.ip, totem.SECRET_KEY, totem.nome);
                    results.push(result);
                }

                // Create a beautiful summary
                const summary = this.createUpdateSummary(results);
                this.bot.sendMessage(chatId, summary, { parse_mode: 'HTML' });
            } else {
                // For screen command, show totem selection buttons
                const buttons = this.createTotemButtons(totems, action);
                this.bot.sendMessage(chatId, `Seleziona un totem per ${client.nome}:`, {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                });
            }
        } catch (error) {
            console.error('Errore nella selezione del cliente:', error);
            this.bot.sendMessage(chatId, config.ERROR_MESSAGES.NETWORK_ERROR);
        }
    }

    async handleScreenCommand(chatId, totemUrl, totemToken) {
        try {
            const response = await axios.get(`${totemUrl}/updates/screenshot?format=image`, {
                headers: {
                    'Authorization': `Bearer ${totemToken}`
                },
                responseType: 'arraybuffer'
            });

            await this.bot.sendPhoto(chatId, response.data);
        } catch (error) {
            console.error('Errore nel recupero dello screenshot:', error);
            this.bot.sendMessage(chatId, config.ERROR_MESSAGES.SCREEN_ERROR);
        }
    }

    async handleUpdateCommand(chatId, totemUrl, totemToken, totemName) {
        try {
            // First, check for updates using the first totem
            const timestamp = Math.floor(Date.now() / 1000);
            
            // Get client platform from the totem's client
            const totem = Array.from(this.totemCache.values()).find(t => t.nome === totemName);
            if (!totem) {
                throw new Error('Totem not found in cache');
            }

            const client = this.clientCache.get(totem.CLIENT_ID);
            if (!client) {
                throw new Error('Client not found in cache');
            }

            const message = `${process.env.TOTEM_API_KEY}:${totem.CLIENT_ID}:${client.platform}:${timestamp}`;
            const signature = crypto
                .createHmac('sha256', process.env.TOTEM_SECRET_KEY)
                .update(message)
                .digest('hex');

            const headers = {
                'Authorization': `Bearer ${totemToken}`,
                'x-api-key': process.env.TOTEM_API_KEY,
                'x-timestamp': timestamp.toString(),
                'x-signature': signature,
                'x-client-platform': client.platform,
                'x-client-id': totem.CLIENT_ID
            };

            const checkResponse = await axios.get(`${totemUrl}/updates/check`, { headers });

            if (!checkResponse.data.updates || checkResponse.data.updates.length === 0) {
                return {
                    name: totemName,
                    status: 'no_updates',
                    message: 'Nessun aggiornamento disponibile'
                };
            }

            const { platform, hash } = checkResponse.data.updates[0];

            // Send update notification to all totems
            const notifyResponse = await axios.post(`${totemUrl}/updates/notify`, {
                platform,
                hash
            }, { headers });

            console.log(`Risposta del totem ${totemName} al notify:`, notifyResponse.data);

            // Handle specific notify response cases
            if (notifyResponse.data.status === true) {
                return {
                    name: totemName,
                    status: 'success',
                    message: notifyResponse.data.message || 'Aggiornamento già presente'
                };
            } else {
                return {
                    name: totemName,
                    status: 'no_updates',
                    message: 'Hash di aggiornamento non presente'
                };
            }
        } catch (error) {
            console.error('Errore nell\'aggiornamento del totem:', error);
            return {
                name: totemName,
                status: 'error',
                message: 'Errore durante l\'aggiornamento'
            };
        }
    }

    createUpdateSummary(results) {
        let summary = '<b>📊 Riepilogo Aggiornamenti</b>\n\n';
        
        results.forEach(result => {
            let icon = '';
            let color = '';
            
            switch (result.status) {
                case 'success':
                    icon = '✅';
                    color = '#00ff00';
                    break;
                case 'error':
                    icon = '❌';
                    color = '#ff0000';
                    break;
                case 'no_updates':
                    icon = '⚠️';
                    color = '#ffa500';
                    break;
            }

            summary += `${icon} <b>${result.name}</b>\n`;
            summary += `<code style="color: ${color}">${result.message}</code>\n\n`;
        });

        return summary;
    }
}

module.exports = new TelegramBotService(); 