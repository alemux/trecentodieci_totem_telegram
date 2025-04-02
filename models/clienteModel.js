const mysql = require('mysql');
const { mysql_connection } = require('../configs/definitions');

class ClienteModel {
    constructor() {
        this.pool = mysql.createPool(mysql_connection);
    }
    
    /**
     * Ottiene tutti i clienti dal database
     * @param {Function} callback - Funzione di callback (err, results)
     */
    getAllClienti(callback) {
        this.pool.query(
            'SELECT * FROM totemdigitale_cliente ORDER BY nome ASC',
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, results);
            }
        );
    }
    
    /**
     * Ottiene un cliente specifico dal database
     * @param {number} id - ID del cliente
     * @param {Function} callback - Funzione di callback (err, result)
     */
    getClienteById(id, callback) {
        this.pool.query(
            'SELECT * FROM totemdigitale_cliente WHERE id = ?',
            [id],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, results.length > 0 ? results[0] : null);
            }
        );
    }
    
    /**
     * Crea un nuovo cliente nel database
     * @param {Object} clienteData - Dati del cliente
     * @param {Function} callback - Funzione di callback (err, result)
     */
    createCliente(clienteData, callback) {
        this.pool.query(
            'INSERT INTO totemdigitale_cliente (client_id, nome, logo, platform, platform_url) VALUES (?, ?, ?, ?, ?)',
            [
                clienteData.client_id,
                clienteData.nome,
                clienteData.logo || null,
                clienteData.platform,
                clienteData.platform_url
            ],
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, result);
            }
        );
    }
    
    /**
     * Aggiorna un cliente esistente
     * @param {number} id - ID del cliente
     * @param {Object} clienteData - Dati aggiornati del cliente
     * @param {Function} callback - Funzione di callback (err, result)
     */
    updateCliente(id, clienteData, callback) {
        // Costruisci la query in modo dinamico in base ai campi forniti
        let updateFields = [];
        let queryParams = [];
        
        if (clienteData.client_id !== undefined) {
            updateFields.push('client_id = ?');
            queryParams.push(clienteData.client_id);
        }
        
        if (clienteData.nome !== undefined) {
            updateFields.push('nome = ?');
            queryParams.push(clienteData.nome);
        }
        
        if (clienteData.logo !== undefined) {
            updateFields.push('logo = ?');
            queryParams.push(clienteData.logo);
        }
        
        if (clienteData.platform !== undefined) {
            updateFields.push('platform = ?');
            queryParams.push(clienteData.platform);
        }
        
        if (clienteData.platform_url !== undefined) {
            updateFields.push('platform_url = ?');
            queryParams.push(clienteData.platform_url);
        }
        
        // Aggiungi l'ID alla fine dei parametri
        queryParams.push(id);
        
        if (updateFields.length === 0) {
            return callback(new Error('Nessun campo da aggiornare fornito'), null);
        }
        
        this.pool.query(
            `UPDATE totemdigitale_cliente SET ${updateFields.join(', ')} WHERE id = ?`,
            queryParams,
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, result);
            }
        );
    }
    
    /**
     * Elimina un cliente
     * @param {number} id - ID del cliente da eliminare
     * @param {Function} callback - Funzione di callback (err, result)
     */
    deleteCliente(id, callback) {
        this.pool.query(
            'DELETE FROM totemdigitale_cliente WHERE id = ?',
            [id],
            (error, result) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, result);
            }
        );
    }
    
    /**
     * Ottiene tutti i totem associati a un cliente
     * @param {string} platform - Piattaforma del cliente
     * @param {Function} callback - Funzione di callback (err, results)
     */
    getTotemsByClientePlatform(platform, callback) {
        this.pool.query(
            'SELECT * FROM totemdigitale WHERE platform = ?',
            [platform],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, results);
            }
        );
    }
    
    /**
     * Ottiene tutti i feed RSS associati a un cliente
     * @param {string} platform - Piattaforma del cliente
     * @param {Function} callback - Funzione di callback (err, results)
     */
    getRSSByClientePlatform(platform, callback) {
        this.pool.query(
            'SELECT * FROM totemdigitale_rss WHERE platform = ?',
            [platform],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                return callback(null, results);
            }
        );
    }
}

module.exports = new ClienteModel(); 