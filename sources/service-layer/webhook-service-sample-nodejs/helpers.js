const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const https =require('https');
const { StatusCodes } = require('http-status-codes');

// Load environment variables from .env file
dotenv.config();
const SLD_ROOT_URL = process.env.sld_root_url;
const IGNORE_SSL_ERRORS = process.env.ignore_ssl_errors === 'true';
const HMAC_SECRET_KEY = process.env.hmac_secret_key;
const BASIC_AUTH_USER = process.env.basic_auth_user;
const BASIC_AUTH_PASS = process.env.basic_auth_pass;

// Validate if string is UUID v4
function validateUUID(str) {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89abAB][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(str);
}

/**
 * Decodes a JWT token and checks if it is expired.
 * @param {object} req - Express request object
 * @returns {{ valid: boolean, expired: boolean, payload?: object, error?: string }}
 */
function validateOAuth(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Invalid Authorization header' };
    }
    const token = authHeader.substring(7);
    if (!token) {
        return { valid: false, expired: false, error: 'No token provided' };
    }
    try {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) {
            return { valid: false, expired: false, error: 'Invalid token' };
        }
        const exp = decoded.payload.exp;
        if (exp && Date.now() >= exp * 1000) {
            return { valid: false, expired: true, payload: decoded.payload, error: 'Token expired' };
        }
        return { valid: true, expired: false, payload: decoded.payload };
    } catch (err) {
        return { valid: false, expired: false, error: err.message };
    }
}

/**
 * Validates Basic Auth credentials.
 * @param {object} req - Express request object
 * @returns {{ valid: boolean, username?: string, error?: string }}
 */
function validateBasicAuth(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return { valid: false, error: 'Invalid Authorization header' };
    }
    const base64Credentials = authHeader.substring(6);
    if (!base64Credentials) {
        return { valid: false, error: 'No credentials provided' };
    }
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    if (!username || !password) {
        return { valid: false, error: 'Invalid Basic Authorization credentials' };
    }
    // Optionally, check against expected values:
    if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASS) {
        return { valid: false, error: 'Incorrect username or password' };
    }
    return { valid: true, username };
}

// Validate HMAC signature
function validateHMACSignature(req) {
    const signature = req.get('X-B1-Webhook-Signature');
    if (!signature){
        return { valid: false, error: 'No signature provided' };
    }

    let message = '';
    if (req.method === 'POST') {
        if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
            return { valid: false, error: 'Invalid webhook payload' };
        }
        message = JSON.stringify(req.body);
    } else if(req.method === 'GET') {
        message = req.get('X-B1-Webhook-Token');
    }
    const hmac = crypto.createHmac('sha256', HMAC_SECRET_KEY);
    hmac.update(message);
    const expectedSignature = hmac.digest('base64');
    if(signature !== expectedSignature) {
        return { valid: false, error: 'Invalid HMAC signature' };
    }
    return { valid: true,  signature};
}

// Determine the authentication mode from the request
function getAuthenticationMode(req) {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            return 'OAuth';
        } else if (authHeader.startsWith('Basic ')) {
            return 'Basic';
        }
    }
    const signature = req.get('X-B1-Webhook-Signature');
    if (signature) {
        return 'HMAC';
    }
    return 'None';
}

// Authenticate the request based on the determined authentication mode
function authenticateRequest(req, auth = null) {
    const authMode = auth ? auth: getAuthenticationMode(req);
    switch (authMode) {
        case 'OAuth':
            return validateOAuth(req);
        case 'Basic':
            return validateBasicAuth(req);
        case 'HMAC':
            return validateHMACSignature(req);
        case 'None':
            console.warn('No authentication provided');
            break;
    }
    return {valid: true, error: null};
}

// Perform handshake for webhook endpoint
function performHandshake(req, res) {
    /// Get the X-B1-Webhook-Token and check if the token is a valid UUID v4 string
    const b1WebhookToken = req.get('X-B1-Webhook-Token');
    if (!b1WebhookToken || !validateUUID(b1WebhookToken)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid or missing X-B1-Webhook-Token' });
    }
    /// Echo back the token in the Challenge field to indicate a successful handshake.
    return res.status(StatusCodes.OK).json({ Challenge: b1WebhookToken });
}

// Create HTTPS agent with optional SSL error ignoring
const httpsAgent = new https.Agent({ rejectUnauthorized: !IGNORE_SSL_ERRORS });

// Get the discovery URL of the OpenID Connect Provider
async function getDiscoveryUrl() {
    const url = `${SLD_ROOT_URL}/sld/sld0100.svc/GetOpenIDConnectProvider`;
    try {
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json'
            },
            httpsAgent: httpsAgent
        });
        return response.data?.d?.GetOpenIDConnectProvider?.DiscoveryUri || null;
    } catch (error) {
        console.error('Error fetching discovery URL:', error);
    }
    return null;
}

// Get the token endpoint URL from the discovery document
async function getTokenURL() {
    const discoveryUrl = await getDiscoveryUrl();
    if (!discoveryUrl) {
        console.error('Discovery URL not found');
        return null;
    }
    try {
        const response = await axios.get(discoveryUrl, {
            headers: {
                Accept: 'application/json'
            },
            httpsAgent: httpsAgent
        });
        return response.data?.token_endpoint || null;
    } catch (error) {
        console.error('Error fetching token URL:', error);
    }
    return null;
}

// Cached token and expiry
let cachedToken = null;
let cachedTokenExp = 0;

// Get access token from OIDC server Keycloak, cache and reuse if not expired
async function getAccessToken() {
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    // If we have a token and it's not about to expire (within 60 seconds), reuse it
    if (cachedToken && cachedTokenExp - now > 60) {
        return cachedToken;
    }
    const tokenURL = await getTokenURL();
    if (tokenURL){
        try {
            const clientId = process.env.client_id;
            const clientSecret = process.env.client_secret;
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await axios.post(tokenURL,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    scope: 'openid'
                }),
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${basicAuth}`
                    },
                    httpsAgent: httpsAgent
                }
            );
            const token = response.data?.access_token || null;
            if (token) {
                // Decode token to get expiry
                const decoded = jwt.decode(token);
                cachedToken = token;
                cachedTokenExp = decoded.exp;
            }
            return token;
        } catch (error) {
            console.error('Error fetching access token:', error);
        }
    }
    return null;
}

// Get company ID from SLD based on the current user and company schema name
async function getCompanyID(token, companySchemaName) {
    const url = `${SLD_ROOT_URL}/sld/sld0100.svc/CurrentUserInfo?IncludeB1UserBinding=true`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            },
            httpsAgent: httpsAgent
        });
        const results = response?.data?.d?.CurrentUserInfo?.B1UserBindings?.results;
        if (Array.isArray(results) && results.length > 0) {
            const match = results.find(item => item.CompanySchemaName === companySchemaName);
            if (match) {
                return match.CompanyID;
            }
            console.warn(`No company ID found for schema name: ${companySchemaName}`);
        } else {
            console.warn('No company ID found for the user');
        }
    } catch (error) {
        console.error('Error fetching company ID:', error);
    }
    return null;
}

module.exports = {
    authenticateRequest,
    performHandshake,
    getAccessToken,
    getCompanyID
};