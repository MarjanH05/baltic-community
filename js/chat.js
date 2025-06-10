// Configuration
const BACKEND_URL = "https://baltic-community-xm74.onrender.com";

// State Variables
let socket;
let username = '';

// DOM Elements
const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const input = document.getElementById('input');

// Message Handling
const appendMessage = (msg, isSelf = false) => {
    const div = document.createElement('div');
    div.classList.add('message-item'); 

    if (msg.system) {
        div.textContent = msg.text;
        div.className = 'system-message';

        if (msg.text === 'Connecting to server...') {
            div.className += ' connecting-message';

            div.textContent = '';
            const container = document.createElement('div');
            container.className = 'container';

            const textSpan = document.createElement('span');
            textSpan.textContent = msg.text;
            container.appendChild(textSpan);

            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            container.appendChild(spinner);

            div.appendChild(container);
            messagesDiv.style.position = 'relative';
        }
    } else {
        const user = users.find(u => u.name === msg.username);
        if (user && user.avatar) {
            const avatarImg = document.createElement('img');
            avatarImg.src = user.avatar;
            avatarImg.alt = msg.username;
            avatarImg.classList.add('chat-avatar');
            div.appendChild(avatarImg);
        } else {
            const avatarInitial = document.createElement('span');
            avatarInitial.textContent = msg.username.charAt(0);
            avatarInitial.classList.add('chat-avatar-initial');
            div.appendChild(avatarInitial);
        }

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = isSelf ? "You" : msg.username; 
        usernameSpan.className = 'username';
        messageContentDiv.appendChild(usernameSpan);

        const messageSpan = document.createElement('span');
        messageSpan.textContent = msg.text;
        messageSpan.className = 'message-text';
        messageContentDiv.appendChild(messageSpan);

        div.appendChild(messageContentDiv);

        if (isSelf) {
            div.classList.add('self-message');
        }
    }

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Chat Connection

const joinChat = (name) => {
    username = name;
    chatForm.style.display = '';
    
    appendMessage({text: 'Connecting to server...', system: true});
    socket = io(BACKEND_URL);
    
    socket.on('chat history', (history) => {
        messagesDiv.innerHTML = '';
        appendMessage({text: 'You have joined the chat!', system: true});
        history.forEach(msg => appendMessage(msg, msg.username === username));
    });
    
    socket.emit('join', username);
    
    socket.on('chat message', (msg) => {
        appendMessage(msg, msg.username === username);
    });
    
    socket.on('system message', (msg) => {
        appendMessage({text: msg, system: true});
    });

    const chatRoomTitle = document.getElementById('chat-room-title');
    if (chatRoomTitle && !document.getElementById('chat-status-dot')) {
        const dot = document.createElement('span');
        dot.id = 'chat-status-dot';
        dot.className = 'chat-status-dot';
        chatRoomTitle.appendChild(dot);
    }
};

// Event Listeners

chatForm.onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    socket.emit('chat message', {username, text});
    input.value = '';
};

// Initialization

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (currentUser) {
            joinChat(currentUser.name);
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
});