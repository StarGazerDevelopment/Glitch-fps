const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files (for Render web service)
app.use(express.static(__dirname));

// Health check endpoint for Render
app.get('/healthz', (req, res) => res.send('OK'));

let players = [];

wss.on('connection', function connection(ws) {
    let username = null;
    ws.isAlive = true;

    ws.on('pong', function() {
        ws.isAlive = true;
    });

    ws.on('message', function incoming(message) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return;
        }
        if (data.type === 'join') {
            // Check if username is already taken
            const isUsernameTaken = players.some(player => player.username === data.username);
            if (isUsernameTaken) {
                ws.send(JSON.stringify({ type: 'username_taken', username: data.username }));
                return;
            }
            username = data.username;
            players.push({ ws, username });
            // Notify all others
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'player_joined', username }));
                }
            });
            // Tell this client how many players are present
            ws.send(JSON.stringify({ type: 'join_ack', count: players.length }));
        }
    });

    ws.on('close', function() {
        if (username) {
            players = players.filter(p => p.ws !== ws);
            // Notify all others
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'player_left', username }));
                }
            });
        }
    });
});

// Heartbeat to detect dead connections
setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
    // Clean up players array for dead sockets
    players = players.filter(p => p.ws.readyState === WebSocket.OPEN);
}, 30000);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
}); 
