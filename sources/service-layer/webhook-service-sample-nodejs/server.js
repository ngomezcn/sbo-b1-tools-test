// Load required modules
const express = require('express');
const WebSocket = require('ws');
const https =require('https');
const axios = require('axios');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');

// Import helper functions for handling authentication and handshake
const { performHandshake, authenticateRequest } = require('./helpers');

// Import helper functions for technical user authentication with Service Layer.
const { getAccessToken, getCompanyID } = require('./helpers');

// Load environment variables from .env file
dotenv.config();
const HTTP_PORT = process.env.http_port || 3000;
const SERVICE_LAYER_ROOT_URL = process.env.service_layer_root_url;
const IGNORE_SSL_ERRORS = process.env.ignore_ssl_errors === 'true';

// Create an Express application
const app = express();
app.use(express.json()); /// Parse JSON request bodies
app.use(morgan('combined')); /// Log HTTP requests to the console
app.use(express.static(__dirname + '/ui/webapp')); /// Serve static files from the UI webapp directory

// Store WebSocket clients
let wsClients = [];

// In-memory storage for notifications
let allNotifications = [];

// Create HTTPS agent with optional SSL error ignoring
const httpsAgent = new https.Agent({ rejectUnauthorized: !IGNORE_SSL_ERRORS });

// Returns the handled notifications
function handleNotifications(req, res) {
    const newNotifications = req.body;
    if(!newNotifications || !Array.isArray(newNotifications) || newNotifications.length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid webhook payload' });
        return [];
    } else {
         for(const notification of newNotifications) {
            notification.notificationNo = allNotifications.length + 1,
            allNotifications.push(notification);
        }
        res.status(StatusCodes.OK).json({ status: 'success', no: allNotifications.length });
        return newNotifications;
    }
}

// Broadcast notifications to connected browser clients
function broadcastNotifications(newNotifications) {
    if(!newNotifications || newNotifications.length === 0) {
        return;
    }
    wsClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN && ws.isBrowser) {
            ws.send(JSON.stringify({
                type: 'NEW_NOTIFICATION',
                data: newNotifications
            }));
        }
    });
}

// Process notification requests for webhook endpoints
function processNotificationRequests(req, res, authMode) {
    const result = authenticateRequest(req, authMode);
    if (!result.valid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: result.error });
    }

    // The client may initiates a handshake request by sending a GET request to the webhook endpoint.
    if (req.method === 'GET') {
        return performHandshake(req, res);
    }

    // Process notifications
    if (req.method === 'POST') {
        const newNotifications = handleNotifications(req, res);
        broadcastNotifications(newNotifications);
    }
}

// Handle HEAD requests globally, because clients may use HEAD request to check if the webhook server is reachable
app.use((req, res, next) => {
        if (req.method === 'HEAD') {
            res.sendStatus(StatusCodes.OK);
        } else {
            next();
        }
});

// Webhook endpoints with OAuth authentication mode
app.use('/webhook/oauth', async (req, res) => {
    processNotificationRequests(req, res, authMode ='OAuth');
});

// Webhook endpoints with HMAC authentication mode
app.use('/webhook/hmac', async (req, res) => {
    processNotificationRequests(req, res, authMode ='HMAC');
});

// Webhook endpoints with Basic authentication mode
app.use('/webhook/basic', async (req, res) => {
    processNotificationRequests(req, res, authMode ='Basic');
});

// Webhook endpoints with None authentication mode
app.use('/webhook/none', async (req, res) => {
    processNotificationRequests(req, res, authMode ='None');
});

// General webhook endpoint that supports all authentication modes
app.use('/webhook', async (req, res) => {
    processNotificationRequests(req, res);
});

// Get all notifications
app.get('/api/notifications', (req, res) => {
    const notifications = allNotifications.map(n => ({
        id: n.id,
        notificationNo: n.notificationNo,
        type: n.type,
        time: n.time
    }));
    res.json(notifications);
});

// Get a notification details
app.get('/api/notifications/:id', (req, res) => {
    const notification = allNotifications.find(n => n.id === req.params.id);
    if (notification) {
        res.json(notification);
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Notification not found' });
    }
});

/**
 * Proxy a request to Service Layer to get more details.
 * 
 * This endpoint is used to proxy requests to the SAP Business One Service Layer.
 * It captures the request path and forwards it to the service layer with the appropriate access token.
 * The path should be in the format: /api/b1s/*r where *r is the relative path to the service layer endpoint.
 * For example, to get a specific business partner, the request would be: /api/b1s/v2/BusinessPartners('C20000')
 * The *r part will be captured and used to construct the full URL for the service layer request.
 */
app.get("/api/b1s/*r", async (req, res) => {
    console.log("r =", req.params.r);
    const companySchemaName = req.get('companySchemaName');
    if (!companySchemaName) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'companySchemaName is required' });
    }
   
    const token = await getAccessToken();
    if (!token) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get access token' });
    }

    const companyID = await getCompanyID(token, companySchemaName);
    if (!companyID) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get company ID' });
    }

    const relativeURI = req.originalUrl.replace("/api", "");
    const serviceLayerURL = SERVICE_LAYER_ROOT_URL + relativeURI;
    
    axios.get(serviceLayerURL, {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-B1-COMPANYID": companyID
        },
        httpsAgent: httpsAgent
    }).then(response => {
        res.json(response.data);
    }).catch(err => {
        console.error('Error calling Service Layer:', err);
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
        }
    });
});

// Start HTTPS server
const options = {
    key: fs.readFileSync('cert/server.key'),
    cert: fs.readFileSync('cert/server.crt')
};
const httpsServer = https.createServer(options, app);
httpsServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on port ${HTTP_PORT}`);
    console.log(`Access the UI at https://localhost:${HTTP_PORT}/`);
});

// Create a separate HTTPS server for WebSocket
const wsHttpsServer = https.createServer(options);
const WS_PORT = Number(HTTP_PORT) + 1;
wsHttpsServer.listen(WS_PORT, () => {
    console.log(`WebSocket HTTPS server listening on port ${WS_PORT}`);
});

// Attach WebSocket server to the HTTPS server
const wsServer = new WebSocket.Server({ server: wsHttpsServer });
wsServer.on('connection', (ws) => {
    wsClients.push(ws);
    ws.isBrowser = false;
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Mark this client as a browser client
            if (data && data.type === 'register' && data.client === 'browser') {
                ws.isBrowser = true;
            }
        } catch (e) {
            // ignore non-JSON or irrelevant messages
        }
    });
    ws.on('close', () => {
        wsClients = wsClients.filter(client => client !== ws);
    });
});
