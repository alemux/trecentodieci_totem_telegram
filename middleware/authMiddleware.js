/**
 * Authorization System Documentation
 * 
 * This middleware implements a secure authentication system for API routes using the following approach:
 * 
 * 1. Required Security Headers:
 *    - x-api-key: A static API key that must match the TOTEM_API_KEY environment variable
 *    - x-timestamp: Current Unix timestamp in seconds
 *    - x-signature: HMAC signature of the request
 *    - x-client-platform: Identifier for the client platform
 *    - x-client-id: Unique client identifier
 * 
 * 2. Security Checks:
 *    a) Validates all required headers are present
 *    b) Verifies API key matches environment configuration
 *    c) Ensures request timestamp is within 5 minutes of current time to prevent replay attacks
 *    d) Validates client platform and ID headers exist
 *    e) Verifies totem credentials by checking against database
 *    f) Validates request signature using client's secret key
 * 
 * 3. Authentication Flow:
 *    1. Client generates current timestamp
 *    2. Client creates request with required headers
 *    3. Client signs request using their secret key
 *    4. Server validates all security parameters
 *    5. If valid, request proceeds to route handler
 *    6. If invalid, returns 401 Unauthorized
 * 
 * This provides multiple layers of security:
 * - API key prevents unauthorized access
 * - Timestamp prevents replay attacks
 * - Client credentials ensure valid client
 * - HMAC signature ensures request integrity
 */

const axios = require('axios');
const config = require('../configs/botConfig');

const validateAuth = async (req, res, next) => {
    try {
        const { token, url } = req.body;
        
        if (!token || !url) {
            return res.status(400).json({ error: 'Token e URL sono richiesti' });
        }

        const response = await axios.post(`${config.API_BASE_URL}/validateAuth`, {
            token,
            url
        });

        if (response.data && response.data.valid) {
            next();
        } else {
            res.status(401).json({ error: 'Token non valido' });
        }
    } catch (error) {
        console.error('Errore di autenticazione:', error);
        res.status(500).json({ error: 'Errore durante la validazione' });
    }
};

module.exports = {
    validateAuth
}; 