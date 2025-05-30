const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {params} = require('express/lib/request');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

let messages = [];
let profileData = {}; // Store profile data

app.use(cors());
app.use(express.json()); // Add JSON middleware

app.get('/', (req, res) => {
    res.send('Chat backend is running.');
});

// Profile endpoints
params.userId = undefined;
app.get('/api/profile/:userId', (req, res) => {
    const userId = req.params.userId;
    const profile = profileData[userId] || {};
    res.json(profile);
});

app.post('/api/profile/:userId', (req, res) => {
    const userId = req.params.userId;
    const data = req.body;
    profileData[userId] = { ...profileData[userId], ...data };
    res.json({ success: true, data: profileData[userId] });
});

io.on('connection', (socket) => {
    let username = '';
    socket.emit('chat history', messages);
    socket.on('join', (name) => {
        username = name;
        socket.broadcast.emit('system message', `${username} joined the chat.`);
    });
    socket.on('chat message', (msg) => {
        messages.push(msg);
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        if (username) {
            socket.broadcast.emit('system message', `${username} left the chat.`);
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
});