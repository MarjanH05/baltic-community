// Baltic Community Chat Frontend
// Set your Render backend URL here:
const BACKEND_URL = "https://baltic-community.onrender.com"; // <-- Set your Render backend URL

let socket;
let username = '';

const chatUsernameContainer = document.getElementById('chat-username-container');
const chatUsernameInput = document.getElementById('chat-username');
const joinChatBtn = document.getElementById('join-chat-btn');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function appendMessage(msg, isSelf = false) {
    if (msg.system) {
        const sysDiv = document.createElement('div');
        sysDiv.className = 'system-message';
        sysDiv.textContent = msg.text;
        chatMessages.appendChild(sysDiv);
    } else {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message' + (isSelf ? ' self' : '');
        msgDiv.innerHTML = `<span class="author">${msg.username}</span><div class="bubble">${msg.text}</div>`;
        chatMessages.appendChild(msgDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

joinChatBtn.addEventListener('click', () => {
    const name = chatUsernameInput.value.trim();
    if (!name) {
        chatUsernameInput.classList.add('is-danger');
        return;
    }
    username = name;
    chatUsernameContainer.style.display = 'none';
    chatForm.style.display = '';
    // Always connect to the backend URL
    socket = io(BACKEND_URL);
    socket.emit('join', username);
    socket.on('chat message', (msg) => {
        appendMessage(msg, msg.username === username);
    });
    socket.on('system message', (msg) => {
        appendMessage({text: msg, system: true});
    });
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    socket.emit('chat message', {username, text});
    chatInput.value = '';
});
