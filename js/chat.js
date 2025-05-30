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
            // Add special styling for system messages
            div.className = 'system-message';
            
            // Special styling for connecting message
            if (msg.text === 'Connecting to server...') {
                div.className += ' connecting-message';
                
                div.textContent = '';
                const container = document.createElement('div');
                container.className = 'container';
                
                // Connecting text
                const textSpan = document.createElement('span');
                textSpan.textContent = msg.text;
                container.appendChild(textSpan);
                
                // Connecting spinner
                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                container.appendChild(spinner);
                
                div.appendChild(container);
                
                // Ensure the messages div has position relative for proper absolute positioning
                messagesDiv.style.position = 'relative';
            }
        } else {
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = `${msg.username}: `;
            usernameSpan.className = 'username';

            // Create a span for the message text
            const messageSpan = document.createElement('span');
            messageSpan.textContent = msg.text;
            messageSpan.className = 'message-text';

            // Append both spans to the div
            div.appendChild(usernameSpan);
            div.appendChild(messageSpan);
        }

        if (isSelf) div.style.fontWeight = 'bold';
        if (isSelf) div.style.fontStyle = 'italic';

        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function joinChat(name) {
        username = name;
        chatForm.style.display = '';
        // Show connecting message
        appendMessage({text: 'Connecting to server...', system: true});
        socket = io(BACKEND_URL);
        socket.on('chat history', (history) => {
            messagesDiv.innerHTML = '';
            history.forEach(msg => appendMessage(msg, msg.username === username));
            // Show a join message for the user themselves after chat history loads
            appendMessage({text: 'You have joined the chat!', system: true});
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

    chatForm.onsubmit = function(e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        socket.emit('chat message', {username, text});
        input.value = '';
    };

    // I added a small delay to ensure script.js has loaded and `currentUser` is defined.
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (currentUser) {
                joinChat(currentUser.name);
            } else {
                window.location.href = 'index.html';
            }
        }, 100);
    });