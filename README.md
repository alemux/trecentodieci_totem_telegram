# TotemDigitaleBot - Bot Telegram per Gestione Totem Digitali

Bot Telegram per la gestione di totem multimediali attraverso comandi semplici e interattivi.

## 🚀 Funzionalità

- Visualizzazione screenshot dei totem in tempo reale
- Aggiornamento remoto dei contenuti dei totem
- Interfaccia utente intuitiva con pulsanti inline
- Gestione multi-totem
- Autenticazione sicura

## 📋 Prerequisiti

- Node.js >= 14.x
- MySQL >= 5.7
- Token Bot Telegram valido
- Accesso all'API dei totem

## 🔧 Installazione

1. Clona il repository:
```bash
git clone https://github.com/yourusername/totemdigitale-bot.git
cd totemdigitale-bot
```

2. Installa le dipendenze:
```bash
npm install
```

3. Crea il file `.env` basato su `.env.example`:
```bash
cp .env.example .env
```

4. Configura le variabili d'ambiente nel file `.env`:
```env
# Configurazione Server
PORT=3000
PORT_DEV=3299
DEVELOPMENT_MODE=true
APP_URL=http://localhost:3043

# Configurazione Database
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Configurazione Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Configurazione API
API_BASE_URL=http://localhost:3300
API_BASE_URL_DEV=http://localhost:3300

# Configurazione Sicurezza
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Configurazione CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🎮 Utilizzo

### Comandi Disponibili

1. `/screen` - Visualizza lo screenshot di un totem
   - Il bot mostrerà una lista di totem disponibili
   - Seleziona il totem desiderato cliccando sul pulsante corrispondente
   - Il bot invierà lo screenshot nella chat

2. `/update` - Aggiorna i contenuti di un totem
   - Il bot mostrerà una lista di totem disponibili
   - Seleziona il totem da aggiornare
   - Il bot confermerà l'avvenuto aggiornamento

### Esempio di Utilizzo

```
Utente: /screen
Bot: Seleziona un totem per visualizzare lo screenshot:
[Totem 1] [Totem 2] [Totem 3]

Utente: [Clicca su Totem 1]
Bot: [Invia screenshot]
```

## 🧪 Test

Esegui i test con i seguenti comandi:

```bash
# Esegui tutti i test
npm test

# Esegui i test in modalità watch
npm run test:watch

# Genera report di copertura
npm run test:coverage
```

## 📚 Documentazione API

### Endpoint Disponibili

#### POST /api/validateAuth
Valida l'autenticazione per le operazioni sui totem.

**Request:**
```json
{
    "token": "string",
    "url": "string"
}
```

**Response:**
```json
{
    "valid": true
}
```

#### GET /api/totems
Recupera l'elenco dei totem associati all'utente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
    "totems": [
        {
            "id": "string",
            "name": "string",
            "url": "string",
            "token": "string"
        }
    ]
}
```

## 🔒 Sicurezza e Configurazione

### Variabili d'Ambiente
L'applicazione richiede diverse variabili d'ambiente per funzionare correttamente. Crea un file `.env` basato su `.env.example` e configura le seguenti variabili:

```env
# Configurazione Server
PORT=3000
PORT_DEV=3299
DEVELOPMENT_MODE=true
APP_URL=http://localhost:3043

# Configurazione Database
MYSQL_HOST=localhost
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Configurazione Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Configurazione API
API_BASE_URL=http://localhost:3300
API_BASE_URL_DEV=http://localhost:3300

# Configurazione Sicurezza
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Configurazione CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Best Practices per la Sicurezza
1. Non committare mai il file `.env` nel repository
2. Usa password forti e uniche per ogni ambiente
3. Mantieni aggiornate tutte le dipendenze
4. Configura correttamente CORS per il tuo dominio
5. Usa HTTPS in produzione
6. Mantieni aggiornato il token del bot Telegram

### Gestione delle Dipendenze
Per aggiornare le dipendenze in modo sicuro:
```bash
# Verifica le dipendenze obsolete
npm outdated

# Aggiorna le dipendenze
npm update

# Verifica le vulnerabilità
npm audit
```

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è sotto licenza ISC - vedi il file [LICENSE](LICENSE) per i dettagli.

## 👥 Autori

- Alessandro Mussini - *Lavoro iniziale*

## 🙏 Ringraziamenti

- Telegram Bot API
- Express.js
- Tutti i contributori 