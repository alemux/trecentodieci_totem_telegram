const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurazione dello storage per Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads/clienti');
        
        // Crea la directory se non esiste
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Ottieni l'estensione del file
        const ext = path.extname(file.originalname);
        
        // Genera un nome file unico con timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + ext);
    }
});

// Funzione per filtrare i tipi di file
const fileFilter = (req, file, cb) => {
    // Accetta solo file immagine
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo file immagine sono supportati!'), false);
    }
};

// Inizializza multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite a 5MB
    }
});

module.exports = upload; 