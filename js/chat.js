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
        if (msg.system) {
            div.textContent = msg.text;
        } else {
            // Create a span for the username
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = `${msg.username}: `;
            usernameSpan.className = 'username'; // Add a class for styling username

            // Create a span for the message text
            const messageSpan = document.createElement('span');
            messageSpan.textContent = msg.text;
            messageSpan.className = 'message-text'; // Add a class for styling message text

            // Append both spans to the div
            div.appendChild(usernameSpan);
            div.appendChild(messageSpan);
        }

        if (isSelf) div.style.fontWeight = 'bold';
        if (isSelf) div.style.fontStyle = 'italic';

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