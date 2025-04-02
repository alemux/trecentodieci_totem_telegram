const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const { mysql_connection } = require('../configs/definitions');
const mysql = require('mysql');
const md5 = require('md5');

// Controller
const ClienteController = require('../controllers/clienteController');

// Middleware per upload
const upload = require('../middleware/upload');
const flashMiddleware = require('../middleware/flash');

const cors = require('cors');
const corsOptions = require('../configs/corsOptions');

// Middleware globale per tutte le route admin
router.use((req, res, next) => {
    // Impostazioni CORS manuali
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Gestione preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Middleware per i flash message
router.use(flashMiddleware);

// Login page
router.get('/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { 
        title: 'Admin Login',
        error: null 
    });
});

// Login form submission
router.post('/login', async (req, res) => {
    console.log("Richiesta login ricevuta:", req.body);
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.render('admin/login', {
            title: 'Admin Login',
            error: 'Email e password sono obbligatori'
        });
    }

    try {
        // Create MySQL connection pool (non-promise version)
        const pool = mysql.createPool(mysql_connection);
        
        // Query to check admin credentials
        pool.query(
            'SELECT * FROM tbladmaccess WHERE email = ? AND password = MD5(?) AND attivo = 1 AND livello = 1',
            [email, password],
            function(error, results) {
                if (error) {
                    console.error('Login error:', error);
                    return res.render('admin/login', {
                        title: 'Admin Login',
                        error: 'Errore database durante il login. Riprova più tardi.'
                    });
                }
                
                if (results && results.length > 0) {
                    // Login successful
                    req.session.isAdmin = true;
                    req.session.adminId = results[0].id;
                    req.session.adminEmail = results[0].email;
                    
                    // Salva esplicitamente la sessione prima del redirect
                    req.session.save((err) => {
                        if (err) {
                            console.error('Errore nel salvare la sessione:', err);
                            return res.render('admin/login', {
                                title: 'Admin Login',
                                error: 'Errore durante il login. Riprova più tardi.'
                            });
                        }
                        console.log('Sessione salvata con successo:', req.session);
                        pool.end(); // chiudi il pool prima del redirect
                        return res.redirect('/admin/dashboard');
                    });
                } else {
                    // Login failed
                    pool.end(); // chiudi il pool prima del render
                    return res.render('admin/login', {
                        title: 'Admin Login',
                        error: 'Credenziali non valide'
                    });
                }
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        return res.render('admin/login', {
            title: 'Admin Login',
            error: 'Errore durante il login. Riprova più tardi.'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
});

// Protected routes
router.get('/dashboard', isAdmin, (req, res) => {
    console.log('Sessione nella dashboard:', req.session);
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        activeMenu: 'dashboard',
        adminEmail: req.session.adminEmail
    });
});

// CLIENTI
// Elenco clienti
router.get('/clienti', isAdmin, ClienteController.getAllClienti);

// Form nuovo cliente
router.get('/clienti/nuovo', isAdmin, ClienteController.getNewClienteForm);

// Salvataggio nuovo cliente
router.post('/clienti/nuovo', isAdmin, upload.single('logo'), ClienteController.createCliente);

// Dettagli cliente
router.get('/clienti/dettagli/:id', isAdmin, ClienteController.getClienteDetails);

// Form modifica cliente
router.get('/clienti/modifica/:id', isAdmin, ClienteController.getEditClienteForm);

// Salvataggio modifiche cliente
router.post('/clienti/modifica/:id', isAdmin, upload.single('logo'), ClienteController.updateCliente);

// Eliminazione cliente
router.get('/clienti/elimina/:id', isAdmin, ClienteController.deleteCliente);

// TOTEMS
// Elenco totems
router.get('/totems', isAdmin, (req, res) => {
    // Mock data per i totem
    const totems = [
        { idtotem: 1, nome: 'Totem Demo 1', platform: 'wordpress', CLIENT_ID: 'client_123', SECRET_KEY: 'secret_123', ip: '192.168.1.1', public_project_url: 'https://project1.com', client_nome: 'Cliente Demo 1' },
        { idtotem: 2, nome: 'Totem Demo 2', platform: 'shopify', CLIENT_ID: 'client_456', SECRET_KEY: 'secret_456', ip: '192.168.1.2', public_project_url: 'https://project2.com', client_nome: 'Cliente Demo 1' },
        { idtotem: 3, nome: 'Totem Demo 3', platform: 'prestashop', CLIENT_ID: 'client_789', SECRET_KEY: 'secret_789', ip: '192.168.1.3', public_project_url: 'https://project3.com', client_nome: 'Cliente Demo 2' },
        { idtotem: 4, nome: 'Totem Demo 4', platform: 'magento', CLIENT_ID: 'client_101', SECRET_KEY: 'secret_101', ip: '192.168.1.4', public_project_url: 'https://project4.com', client_nome: 'Cliente Demo 3' },
        { idtotem: 5, nome: 'Totem Demo 5', platform: 'woocommerce', CLIENT_ID: 'client_202', SECRET_KEY: 'secret_202', ip: '192.168.1.5', public_project_url: 'https://project5.com', client_nome: 'Cliente Demo 4' }
    ];
    
    // Mock data per i clienti (per il filtro)
    const clienti = [
        { client_id: 1, nome: 'Cliente Demo 1' },
        { client_id: 2, nome: 'Cliente Demo 2' },
        { client_id: 3, nome: 'Cliente Demo 3' },
        { client_id: 4, nome: 'Cliente Demo 4' },
        { client_id: 5, nome: 'Cliente Demo 5' }
    ];
    
    // Filtro per cliente (se specificato)
    const clienteId = req.query.cliente_id;
    let totemsFiltered = totems;
    
    if (clienteId) {
        const clienteNome = clienti.find(c => c.client_id == clienteId)?.nome;
        totemsFiltered = totems.filter(t => t.client_nome === clienteNome);
    }
    
    res.render('admin/totems/index', {
        title: 'Gestione Totems',
        activeMenu: 'totems',
        totems: totemsFiltered,
        clienti: clienti,
        filtroClienteId: clienteId || '',
        adminEmail: req.session.adminEmail
    });
});

// Form nuovo totem
router.get('/totems/nuovo', isAdmin, (req, res) => {
    // Mock data per i clienti (per la selezione)
    const clienti = [
        { client_id: 1, nome: 'Cliente Demo 1' },
        { client_id: 2, nome: 'Cliente Demo 2' },
        { client_id: 3, nome: 'Cliente Demo 3' },
        { client_id: 4, nome: 'Cliente Demo 4' },
        { client_id: 5, nome: 'Cliente Demo 5' }
    ];
    
    res.render('admin/totems/nuovo', {
        title: 'Nuovo Totem',
        activeMenu: 'totems',
        clienti: clienti,
        adminEmail: req.session.adminEmail
    });
});

// Salvataggio nuovo totem
router.post('/totems/nuovo', isAdmin, (req, res) => {
    const { nome, platform, CLIENT_ID, SECRET_KEY, ip, public_project_url, client_id } = req.body;
    // Qui in futuro salveremo i dati nel DB
    console.log('Nuovo totem:', { nome, platform, CLIENT_ID, SECRET_KEY, ip, public_project_url, client_id });
    
    // Per ora facciamo solo un redirect all'elenco
    res.redirect('/admin/totems');
});

// RSS
// Elenco RSS
router.get('/rss', isAdmin, (req, res) => {
    // Mock data per gli RSS
    const feeds = [
        { id: 1, platform: 'wordpress', url: 'https://example1.com/feed', attivo: 1, client_nome: 'Cliente Demo 1' },
        { id: 2, platform: 'shopify', url: 'https://example2.com/feed', attivo: 1, client_nome: 'Cliente Demo 2' },
        { id: 3, platform: 'prestashop', url: 'https://example3.com/feed', attivo: 0, client_nome: 'Cliente Demo 1' },
        { id: 4, platform: 'magento', url: 'https://example4.com/feed', attivo: 1, client_nome: 'Cliente Demo 3' },
        { id: 5, platform: 'woocommerce', url: 'https://example5.com/feed', attivo: 1, client_nome: 'Cliente Demo 4' }
    ];
    
    // Mock data per i clienti (per il filtro)
    const clienti = [
        { client_id: 1, nome: 'Cliente Demo 1' },
        { client_id: 2, nome: 'Cliente Demo 2' },
        { client_id: 3, nome: 'Cliente Demo 3' },
        { client_id: 4, nome: 'Cliente Demo 4' },
        { client_id: 5, nome: 'Cliente Demo 5' }
    ];
    
    // Filtro per cliente (se specificato)
    const clienteId = req.query.cliente_id;
    let feedsFiltered = feeds;
    
    if (clienteId) {
        const clienteNome = clienti.find(c => c.client_id == clienteId)?.nome;
        feedsFiltered = feeds.filter(f => f.client_nome === clienteNome);
    }
    
    res.render('admin/rss/index', {
        title: 'Gestione RSS',
        activeMenu: 'rss',
        feeds: feedsFiltered,
        clienti: clienti,
        filtroClienteId: clienteId || '',
        adminEmail: req.session.adminEmail
    });
});

// Form nuovo RSS
router.get('/rss/nuovo', isAdmin, (req, res) => {
    // Mock data per i clienti (per la selezione)
    const clienti = [
        { client_id: 1, nome: 'Cliente Demo 1', platform: 'wordpress' },
        { client_id: 2, nome: 'Cliente Demo 2', platform: 'shopify' },
        { client_id: 3, nome: 'Cliente Demo 3', platform: 'prestashop' },
        { client_id: 4, nome: 'Cliente Demo 4', platform: 'magento' },
        { client_id: 5, nome: 'Cliente Demo 5', platform: 'woocommerce' }
    ];
    
    res.render('admin/rss/nuovo', {
        title: 'Nuovo Feed RSS',
        activeMenu: 'rss',
        clienti: clienti,
        adminEmail: req.session.adminEmail
    });
});

// Salvataggio nuovo RSS
router.post('/rss/nuovo', isAdmin, (req, res) => {
    const { url, client_id, attivo } = req.body;
    // Qui in futuro salveremo i dati nel DB
    console.log('Nuovo RSS:', { url, client_id, attivo: attivo ? 1 : 0 });
    
    // Per ora facciamo solo un redirect all'elenco
    res.redirect('/admin/rss');
});

// AGGIORNAMENTI
// Elenco aggiornamenti
router.get('/aggiornamenti', isAdmin, (req, res) => {
    // Mock data per gli aggiornamenti
    const aggiornamenti = [
        { id: 1, platform: 'wordpress', hash: 'abc123', date: '2023-06-01 14:30:00', client_nome: 'Cliente Demo 1' },
        { id: 2, platform: 'shopify', hash: 'def456', date: '2023-06-02 15:45:00', client_nome: 'Cliente Demo 2' },
        { id: 3, platform: 'prestashop', hash: 'ghi789', date: '2023-06-03 10:15:00', client_nome: 'Cliente Demo 1' },
        { id: 4, platform: 'magento', hash: 'jkl101', date: '2023-06-04 09:30:00', client_nome: 'Cliente Demo 3' },
        { id: 5, platform: 'woocommerce', hash: 'mno202', date: '2023-06-05 16:20:00', client_nome: 'Cliente Demo 4' }
    ];
    
    // Mock data per i clienti (per il filtro)
    const clienti = [
        { client_id: 1, nome: 'Cliente Demo 1' },
        { client_id: 2, nome: 'Cliente Demo 2' },
        { client_id: 3, nome: 'Cliente Demo 3' },
        { client_id: 4, nome: 'Cliente Demo 4' },
        { client_id: 5, nome: 'Cliente Demo 5' }
    ];
    
    // Filtro per cliente (se specificato)
    const clienteId = req.query.cliente_id;
    let updatesFiltered = aggiornamenti;
    
    if (clienteId) {
        const clienteNome = clienti.find(c => c.client_id == clienteId)?.nome;
        updatesFiltered = aggiornamenti.filter(u => u.client_nome === clienteNome);
    }
    
    res.render('admin/aggiornamenti/index', {
        title: 'Aggiornamenti',
        activeMenu: 'aggiornamenti',
        aggiornamenti: updatesFiltered,
        clienti: clienti,
        filtroClienteId: clienteId || '',
        adminEmail: req.session.adminEmail
    });
});

module.exports = router; 