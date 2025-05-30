const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

let messages = [];
let profileData = {};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Chat backend is running.');
});

app.get('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(`GET request for profile ${userId}`);
    const profile = profileData[userId] || {};
    res.status(200).json(profile);
});

app.post('/api/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const data = req.body;
    console.log(`POST request for profile ${userId}:`, data);
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