const ClienteModel = require('../models/clienteModel');
const fs = require('fs');
const path = require('path');

class ClienteController {
    /**
     * Visualizza tutti i clienti
     */
    getAllClienti(req, res) {
        ClienteModel.getAllClienti((err, clienti) => {
            if (err) {
                console.error('Errore nel recupero dei clienti:', err);
                return res.render('admin/clienti/index', {
                    title: 'Gestione Clienti',
                    activeMenu: 'clienti',
                    clienti: [],
                    error: 'Errore nel recupero dei clienti. Riprova più tardi.',
                    adminEmail: req.session.adminEmail
                });
            }
            
            res.render('admin/clienti/index', {
                title: 'Gestione Clienti',
                activeMenu: 'clienti',
                clienti: clienti,
                actionButton: {
                    url: '/admin/clienti/nuovo',
                    text: 'Nuovo Cliente'
                },
                adminEmail: req.session.adminEmail
            });
        });
    }
    
    /**
     * Visualizza form per nuovo cliente
     */
    getNewClienteForm(req, res) {
        res.render('admin/clienti/nuovo', {
            title: 'Nuovo Cliente',
            activeMenu: 'clienti',
            adminEmail: req.session.adminEmail
        });
    }
    
    /**
     * Crea un nuovo cliente
     */
    createCliente(req, res) {
        // Raccogli i dati dal form
        const { client_id, nome, platform, platform_url } = req.body;
        
        // Validazione base
        if (!client_id || !nome || !platform) {
            return res.render('admin/clienti/nuovo', {
                title: 'Nuovo Cliente',
                activeMenu: 'clienti',
                error: 'I campi ID Cliente, Nome e Piattaforma sono obbligatori',
                formData: req.body,
                adminEmail: req.session.adminEmail
            });
        }
        
        // Prepara l'oggetto cliente
        const clienteData = {
            client_id,
            nome,
            platform,
            platform_url: platform_url || null,
            logo: req.file ? req.file.filename : null
        };
        
        // Salva nel database
        ClienteModel.createCliente(clienteData, (err, result) => {
            if (err) {
                console.error('Errore nella creazione del cliente:', err);
                return res.render('admin/clienti/nuovo', {
                    title: 'Nuovo Cliente',
                    activeMenu: 'clienti',
                    error: 'Errore nella creazione del cliente. Riprova più tardi.',
                    formData: req.body,
                    adminEmail: req.session.adminEmail
                });
            }
            
            // Redirect all'elenco clienti con messaggio di successo
            req.session.successMessage = 'Cliente creato con successo!';
            res.redirect('/admin/clienti');
        });
    }
    
    /**
     * Visualizza dettagli di un cliente
     */
    getClienteDetails(req, res) {
        const id = req.params.id;
        
        ClienteModel.getClienteById(id, (err, cliente) => {
            if (err || !cliente) {
                console.error('Errore nel recupero dei dettagli del cliente:', err);
                req.session.errorMessage = 'Cliente non trovato';
                return res.redirect('/admin/clienti');
            }
            
            // Una volta ottenuto il cliente, recupera i suoi totem e RSS associati
            ClienteModel.getTotemsByClientePlatform(cliente.platform, (err, totems) => {
                if (err) {
                    console.error('Errore nel recupero dei totem:', err);
                    totems = [];
                }
                
                ClienteModel.getRSSByClientePlatform(cliente.platform, (err, feeds) => {
                    if (err) {
                        console.error('Errore nel recupero dei feed RSS:', err);
                        feeds = [];
                    }
                    
                    res.render('admin/clienti/dettagli', {
                        title: `Cliente: ${cliente.nome}`,
                        activeMenu: 'clienti',
                        cliente: cliente,
                        totems: totems,
                        feeds: feeds,
                        adminEmail: req.session.adminEmail
                    });
                });
            });
        });
    }
    
    /**
     * Visualizza form per modifica cliente
     */
    getEditClienteForm(req, res) {
        const id = req.params.id;
        
        ClienteModel.getClienteById(id, (err, cliente) => {
            if (err || !cliente) {
                console.error('Errore nel recupero dei dettagli del cliente:', err);
                req.session.errorMessage = 'Cliente non trovato';
                return res.redirect('/admin/clienti');
            }
            
            res.render('admin/clienti/modifica', {
                title: `Modifica Cliente: ${cliente.nome}`,
                activeMenu: 'clienti',
                cliente: cliente,
                adminEmail: req.session.adminEmail
            });
        });
    }
    
    /**
     * Aggiorna un cliente esistente
     */
    updateCliente(req, res) {
        const id = req.params.id;
        const { client_id, nome, platform, platform_url } = req.body;
        
        // Validazione base
        if (!client_id || !nome || !platform) {
            return res.render('admin/clienti/modifica', {
                title: 'Modifica Cliente',
                activeMenu: 'clienti',
                error: 'I campi ID Cliente, Nome e Piattaforma sono obbligatori',
                cliente: { id, ...req.body },
                adminEmail: req.session.adminEmail
            });
        }
        
        // Prima ottieni il cliente per verificare se esiste e ottenere il logo corrente
        ClienteModel.getClienteById(id, (err, esistenteCliente) => {
            if (err || !esistenteCliente) {
                console.error('Errore nel recupero del cliente da modificare:', err);
                req.session.errorMessage = 'Cliente non trovato';
                return res.redirect('/admin/clienti');
            }
            
            // Prepara l'oggetto cliente aggiornato
            const clienteData = {
                client_id,
                nome,
                platform,
                platform_url: platform_url || null
            };
            
            // Gestisci upload del logo se presente
            if (req.file) {
                clienteData.logo = req.file.filename;
                
                // Se c'era un logo precedente, eliminalo
                if (esistenteCliente.logo) {
                    const oldLogoPath = path.join(__dirname, '../public/uploads/clienti', esistenteCliente.logo);
                    
                    // Elimina il vecchio logo (in modo asincrono)
                    fs.unlink(oldLogoPath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error('Errore nell\'eliminazione del vecchio logo:', err);
                        }
                    });
                }
            }
            
            // Salva nel database
            ClienteModel.updateCliente(id, clienteData, (err, result) => {
                if (err) {
                    console.error('Errore nell\'aggiornamento del cliente:', err);
                    return res.render('admin/clienti/modifica', {
                        title: 'Modifica Cliente',
                        activeMenu: 'clienti',
                        error: 'Errore nell\'aggiornamento del cliente. Riprova più tardi.',
                        cliente: { id, ...req.body, logo: esistenteCliente.logo },
                        adminEmail: req.session.adminEmail
                    });
                }
                
                // Redirect all'elenco clienti con messaggio di successo
                req.session.successMessage = 'Cliente aggiornato con successo!';
                res.redirect('/admin/clienti');
            });
        });
    }
    
    /**
     * Elimina un cliente
     */
    deleteCliente(req, res) {
        const id = req.params.id;
        
        // Prima ottieni il cliente per verificare se esiste e ottenere il logo da eliminare
        ClienteModel.getClienteById(id, (err, cliente) => {
            if (err || !cliente) {
                console.error('Errore nel recupero del cliente da eliminare:', err);
                req.session.errorMessage = 'Cliente non trovato';
                return res.redirect('/admin/clienti');
            }
            
            // Elimina il cliente dal database
            ClienteModel.deleteCliente(id, (err, result) => {
                if (err) {
                    console.error('Errore nell\'eliminazione del cliente:', err);
                    req.session.errorMessage = 'Errore nell\'eliminazione del cliente. Riprova più tardi.';
                    return res.redirect('/admin/clienti');
                }
                
                // Se c'era un logo, eliminalo
                if (cliente.logo) {
                    const logoPath = path.join(__dirname, '../public/uploads/clienti', cliente.logo);
                    
                    // Elimina il logo (in modo asincrono)
                    fs.unlink(logoPath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error('Errore nell\'eliminazione del logo:', err);
                        }
                    });
                }
                
                // Redirect all'elenco clienti con messaggio di successo
                req.session.successMessage = 'Cliente eliminato con successo!';
                res.redirect('/admin/clienti');
            });
        });
    }
}

module.exports = new ClienteController(); 