    const BACKEND_URL = "https://baltic-community.onrender.com"; // Set your backend URL
    let socket;
    let username = '';
    const messagesDiv = document.getElementById('messages');
    const usernameInput = document.getElementById('username');
    const joinBtn = document.getElementById('join');
    const chatForm = document.getElementById('chat-form');
    const input = document.getElementById('input');
    const usernameContainer = document.getElementById('username-container');

    function appendMessage(msg, isSelf = false) {
        const div = document.createElement('div');
        div.textContent = msg.system ? msg.text : `${msg.username}: ${msg.text}`;
        if (isSelf) div.style.fontWeight = 'bold';
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    joinBtn.onclick = function() {
        const name = usernameInput.value.trim();
        if (!name) return;
        username = name;
        usernameContainer.style.display = 'none';
        chatForm.style.display = '';
        socket = io(BACKEND_URL);
        socket.on('chat history', (history) => {
            messagesDiv.innerHTML = '';
            history.forEach(msg => appendMessage(msg, msg.username === username));
        });
        socket.emit('join', username);
        socket.on('chat message', (msg) => {
            appendMessage(msg, msg.username === username);
        });
        socket.on('system message', (msg) => {
            appendMessage({text: msg, system: true});
        });
    };

    chatForm.onsubmit = function(e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        socket.emit('chat message', {username, text});
        input.value = '';
    };