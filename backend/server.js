// Simple Node.js + Express + Socket.IO chat backend for Render
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for GitHub Pages
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.get('/', (req, res) => {
    res.send('Chat backend is running.');
});

let messages = [];

io.on('connection', (socket) => {
    let username = '';
    // Send all previous messages to the new user
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
