const SUPABASE_URL = 'https://luxzttwcxkcyigpuiqod.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eHp0dHdjeGtjeWlncHVpcW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1MzE3MiwiZXhwIjoyMDY0ODI5MTcyfQ.0Z885unjGf5cHFuWU7fAbEO21IzzPxkbQb34HxwjLyo';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Store users data
let users = [];
let posts = [];
let events = [];

// Notifications System
let userNotifications = {};

async function loadUsers() {
    const { data, error } = await db
        .from('users')
        .select('*')
        .order('last_active', { ascending: false });

    if (error) {
        return console.error('DB error:', error);
    }
    if (!data || data.length === 0) {
        return console.log('No users found.');
    }

    users = data;
}

async function loadPosts() {
    const { data, error } = await db
        .from('posts')
        .select('*, users!posts_author_id_fkey(name, avatar)')
        .order('created_at', { ascending: false });

    if (error) {
        return console.error('Error fetching posts from DB:', error);
    }

    if (!data || data.length === 0) {
        return console.log('No posts found in database.');
    }

    posts = data.map(dbPost => ({
        id: dbPost.id,
        authorId: dbPost.author_id,
        authorName: dbPost.users ? dbPost.users.name : 'Unknown',
        avatar: dbPost.users ? dbPost.users.avatar : null,
        content: dbPost.content,
        timestamp: new Date(dbPost.created_at).getTime()
    }));
}

async function loadEvents() {
    const { data, error } = await db
        .from('events')
        .select('*')
        .order('month', { ascending: false }) 
        .order('day', { ascending: true });

    if (error) return console.error('Error fetching events from DB:', error);
    if (!data || data.length === 0) return;

    events = data;
}

// Initialize all data from the database
async function initializeData() {
    await loadUsers();
    await loadPosts();
    await loadEvents();
}

function initializeNotifications() {
    try {
        const savedNotifications = sessionStorage.getItem('balticNotifications');
        if (savedNotifications) {
            userNotifications = JSON.parse(savedNotifications);
            return;
        }
    } catch (e) {
        console.log('SessionStorage not available, using default notifications');
    }

    // Use default notifications if no other data
    users.forEach(user => {
        userNotifications[user.id] = [
            {
                id: 1,
                title: "New post from Danny Broome",
                time: Date.now() - 300000,
                unread: true
            },
            {
                id: 2,
                title: "New post from Marjan Hussain",
                time: Date.now() - 600000,
                unread: true
            },
            {
                id: 3,
                title: "New event added: Creating Replicas",
                time: Date.now() - 86400000,
                unread: false
            }
        ];
    });
}

// Save notifications to storage
function saveNotifications() {
    sessionStorage.setItem('balticNotifications', JSON.stringify(userNotifications));
}

// Current logged in user
let currentUser = null;

// Session Manager
// Check for existing session on page load
function checkSession() {
    const userData = localStorage.getItem('balticUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            loginUser(user, true); // true = from session
        } catch (e) {
            localStorage.removeItem('balticUser');
        }
    }
}

// Save session to localStorage
function saveSession(user) {
    localStorage.setItem('balticUser', JSON.stringify(user));
}

// Clear session from localStorage
function clearSession() {
    localStorage.removeItem('balticUser');
}

// DOM Elements , these are global so every function should check if they exist otherwise might break the HTML scripts
const loginPage = document.getElementById('login-page');
const signupPage = document.getElementById('signup-page');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const signupBtn = document.getElementById('signup-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const userNameSpan = document.getElementById('user-name');
const postInput = document.getElementById('post-input');
const postsContainer = document.getElementById('posts-container');
const activeUsers = document.getElementById('active-users');
const eventList = document.getElementById('event-list');
const profileIcon = document.getElementById('profile-icon');
const postUserAvatar = document.getElementById('post-user-avatar');
const submitPostBtn = document.getElementById('submit-post-btn');
const profileAvatar = document.getElementById('profile-avatar');
const notificationsIcon = document.getElementById('notifications-icon');
const notificationsDropdown = document.getElementById('notifications-dropdown');
// Dropdown elements
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const dropdownUsername = document.getElementById('dropdown-username');
const logoutLink = document.getElementById('logout-link');
const settingsTrigger = document.getElementById('settings-trigger');

// Handle signup button click
if (signupBtn) {
    signupBtn.addEventListener('click', () => {
            loginPage.classList.add('hidden');
            signupPage.classList.remove('hidden');
    });
}

// Handle back to log in button
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        let errorMessage = "";
        if (!emailRegex.test(email)) {
            errorMessage += "Invalid email format. Email must have format like 'name@example.com'\n";
        }
        if (!passwordRegex.test(password)) {
            errorMessage += "Password must be at least 8 characters and include at least 1 uppercase letter and 1 number";
        }

        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        try {
            const { data, error } = await db
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            // PGRST116 is basically the error code for not found in Supabase
            if (error?.code === 'PGRST116' || !data) {
                alert('Invalid email or password.');
                return;
            }

            loginUser({
                id: data.id,
                avatar: data.avatar,
                name: data.name,
                email: data.email
            });
        } catch (error) {
            console.error('Login failed:', error);
            alert('An error occurred during login. Please try again.');
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const profilePicture = document.getElementById('profile-picture').files[0];

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        let errorMessage = "";
        if (!fullName) errorMessage += "Full name is required\n";
        if (!emailRegex.test(email)) errorMessage += "Invalid email format\n";
        if (!passwordRegex.test(password)) errorMessage += "Password must be at least 8 characters and include at least 1 uppercase letter and 1 number";

        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        try {
            const { data: authData, error: authError } = await db.auth.signUp({
                email: email,
                password: password
            });

            let avatar = null;
            if (profilePicture) {
                avatar = await convertImageToBase64(profilePicture);
            }

            const newUser = {
                name: fullName,
                avatar
            };

            const { data, error } = await db
                .from('profiles')
                .insert([newUser])
                .select();

            if (error) {
                console.error('Supabase signup error:', error);
                alert('Signup failed: ' + error.message);
                return;
            }

            const createdUser = data[0];
            console.log('User created successfully:', createdUser);

            await loadUsers(); // Refresh users array
            loginUser(createdUser);
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Signup failed. Please try again.');
        }
    });
}

// Initialize notifications after first login
let notificationsInitialized = false;

function initNotifications() {
    // Check if notifications are already initialized
    if (notificationsInitialized || !notificationsIcon || !notificationsDropdown)
        return;

    notificationsInitialized = true;
    initializeNotifications();

    notificationsIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (notificationsDropdown.classList.contains('hidden')) {
            renderNotifications();
            notificationsDropdown.classList.remove('hidden');
        } else {
            notificationsDropdown.classList.add('hidden');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationsDropdown.contains(e.target) && e.target !== notificationsIcon) {
            notificationsDropdown.classList.add('hidden');
        }
    });
}

function renderNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    const clearBtn = document.getElementById('clear-notifications');
    if (!notificationsList || !currentUser) return;

    notificationsList.innerHTML = '';

    const currentNotifications = userNotifications[currentUser.id] || [];

    if (currentNotifications.length === 0) {
        notificationsList.innerHTML = '<div class="notification-item">No notifications</div>';
    }
    else {
        currentNotifications.forEach((notification, index) => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item${notification.unread ? ' notification-unread' : ''}`;
            notificationElement.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${formatTimeAgo(notification.time)}</div>
                </div>
                ${notification.unread ? '<div class="notification-dot"></div>' : ''}
            `;

            // Mark as read on click
            notificationElement.addEventListener('click', () => {
                currentNotifications[index].unread = false;
                notificationElement.classList.remove('notification-unread');
                const dot = notificationElement.querySelector('.notification-dot');
                if (dot) dot.remove();
                saveNotifications();
            });

            notificationsList.appendChild(notificationElement);
        });
    }

    if (clearBtn) {
        clearBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            userNotifications[currentUser.id] = [];
            renderNotifications();
            saveNotifications();
        };
    }
}

// Post when button is clicked
if (submitPostBtn) {
    submitPostBtn.addEventListener('click', handlePostSubmit);
}

// Text box behavior - only if postInput exists
if (postInput) {
    // Auto-resizing text area functionality
    function autoResizeTextarea() {
        postInput.style.height = '36px';
        postInput.style.height = Math.max(36, postInput.scrollHeight) + 'px';

        if (postInput.scrollHeight > 300) {
            postInput.style.overflowY = 'auto';
        } else {
            postInput.style.overflowY = 'hidden';
        }
    }

    // Initialize once DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        if (postInput) {
            postInput.style.resize = 'none';
            postInput.style.overflow = 'hidden';
            postInput.style.boxSizing = 'border-box';
            postInput.style.minHeight = '36px';
            postInput.style.maxHeight = '300px';
            postInput.style.width = '100%';

            postInput.addEventListener('input', autoResizeTextarea);
            postInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostSubmit();
                }
            });

            // Handle post input focus
            postInput.addEventListener('click', () => {
                // Focus on the input field when clicked
                postInput.focus();
            });

            // Initialize
            autoResizeTextarea();
        }
    });
}

async function handlePostSubmit() {
    if (!postInput) return;

    const content = postInput.value;
    const submitBtn = document.getElementById('submit-post-btn');
    const spinner = submitBtn.querySelector('.spinner');

    // Holding 'enter' doesn't allow mutiple posts to be submitted
    if (submitBtn.disabled || !content) {
        return;
    }

    if (spinner) spinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    const postToInsert = {
        author_id: currentUser.id,
        content: content,
    };

    const { data, error } = await db
        .from('posts')
        .insert([postToInsert])
        .select('*, users!posts_author_id_fkey(name, avatar)');

    if (error) throw error;

    const insertedPost = data[0];
    const newPost = {
        id: insertedPost.id,
        authorId: insertedPost.author_id,
        authorName: insertedPost.users.name,
        avatar: insertedPost.users ? insertedPost.users.avatar : null,
        content: insertedPost.content,
        timestamp: new Date(insertedPost.created_at).getTime()
    };

    posts.unshift(newPost);
    renderPosts();
    notifyUsersAboutNewPost(currentUser.id, currentUser.name);

    postInput.value = '';
    if (typeof autoResizeTextarea === 'function') {
        autoResizeTextarea();
    }
    spinner.classList.add('hidden');
    submitBtn.disabled = false;
}

function notifyUsersAboutNewPost(postAuthorId, postAuthorName) {
    users.forEach(user => {
        if (user.id !== postAuthorId) {
            // Creates a notification array for this user if it doesn't exist
            if (!userNotifications[user.id]) userNotifications[user.id] = [];

            // Add new notification at the beginning of the array
            userNotifications[user.id].unshift({
                id: Date.now(),
                title: `New post from ${postAuthorName}`,
                time: Date.now(),
                unread: true
            });
        }
    });
    saveNotifications();
}

// Convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Navbar profile management dropdown
if (profileIcon) {
    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (profileDropdown && profileDropdown.classList.contains('hidden')) {
                updateDropdownProfile();
                profileDropdown.classList.remove('hidden');
        } else if (profileDropdown) {
                profileDropdown.classList.add('hidden');
            }
    });
}

document.addEventListener('click', function(e) {
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        if (!profileDropdown.contains(e.target) && e.target !== profileIcon) {
            profileDropdown.classList.add('hidden');
        }
    }
});

function updateDropdownProfile() {
    if (!currentUser || !dropdownUsername || !dropdownAvatar) return;
    dropdownUsername.textContent = currentUser.name;
    if (currentUser.avatar) {
        dropdownAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
    } else {
        dropdownAvatar.innerHTML = `<span class="avatar-initial">${currentUser.name.charAt(0)}</span>`;
    }
}

if (logoutLink) {
    logoutLink.addEventListener('click', function() {
        clearSession(); // Remove session from localStorage
        currentUser = null;
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
        if (loginPage) {
            loginPage.classList.remove('hidden');
        }
        if (profileDropdown) {
            profileDropdown.classList.add('hidden');
        }
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (loginPage) loginPage.classList.remove('hidden');
       } else {
           // If on chat.html or other pages, redirect to index or login page
           window.location.href = 'index.html';
       }
    });
}

// Login user function
async function loginUser(user, fromSession = false) {
    currentUser = user;
    const { error } = await db
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.id);
    // Update UI only if elements exist
    if (userNameSpan) {
        userNameSpan.textContent = user.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    updateCurrentUserAvatar();

    // Hide login/signup pages, show main app (only on index page) 
    if (loginPage) loginPage.classList.add('hidden');
    if (signupPage) signupPage.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');

    if (!fromSession) {
        saveSession(user);
    }

    initNotifications();
    initApp();
}

// Update user avatar in UI
function updateCurrentUserAvatar() {
    if (!currentUser) return;

    const avatarHtml = (user) => user.avatar
        ? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
        : `<span class="avatar-initial">${user.name.charAt(0)}</span>`;

    // Profile icon in navbar
    if (profileIcon) {
        profileIcon.innerHTML = avatarHtml(currentUser);
    }

    // Post input avatar
    if (postUserAvatar) {
        postUserAvatar.innerHTML = avatarHtml(currentUser);
    }

    // Profile avatar (assuming this is for a profile page)
    if (profileAvatar) {
        profileAvatar.innerHTML = avatarHtml(currentUser);
    }
}

// Initialize app
function initApp() {
    renderPosts();
    renderActiveUsers();
    renderEvents();
}

// Render posts
function renderPosts() {
    if (!postsContainer) return;
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="post"><p>No posts yet. Be the first to post!</p></div>';
        return;
    }

    posts.forEach((post, index) => {
        const maxLength = 350; // Maximum length for truncation
        const showReadMore = post.content.length > maxLength;
        const truncatedContent = showReadMore
            ? post.content.slice(0, maxLength) + '...'
            : post.content;

        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">
                            ${post.avatar
                ? `<img src="${post.avatar}" alt="${post.authorName}" class="avatar-image">`
                : `<span class="avatar-initial">${post.authorName.charAt(0)}</span>`}
                        </div>
                        <div class="author-info">
                            <h4 class="subtitle" style="padding-bottom: 0; margin-bottom: 0;">${post.authorName}</h4>
                            <span class="post-time">${formatTimeAgo(post.timestamp || Date.now())}</span>
                        </div>
                    </div>
                    <div class="post-options" data-post-index="${index}"><i class="fa-solid fa-ellipsis-vertical"></i></div>
                </div>
                <div class="post-content">
                    <p>
                        <span class="post-text">${truncatedContent}</span>
                        ${showReadMore ? '<a href="#" class="read-more" data-index="' + index + '">Read more</a>' : ''}
                    </p>
                </div>
            `;

        postsContainer.appendChild(postElement);
    });
    setupPostOptionsMenu();

    // Add event listeners for "Read more" links
    const readMoreLinks = postsContainer.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const idx = parseInt(this.getAttribute('data-index'));
            if (posts[idx]) {
                const postText = this.parentElement.querySelector('.post-text');
                postText.textContent = posts[idx].content;
                this.style.display = 'none';
            }
        });
    });
}

function formatTimeAgo(timestamp) {
    const sec = Math.floor((Date.now() - timestamp) / 1000);
    const mins = sec / 60;
    const hrs = mins / 60;
    const days = hrs / 24;

    if (days >= 1) return `${Math.floor(days)} day${days >= 2 ? 's' : ''} ago`;
    if (hrs >= 1) return `${Math.floor(hrs)} hour${hrs >= 2 ? 's' : ''} ago`;
    if (mins >= 1) return `${Math.floor(mins)} minute${mins >= 2 ? 's' : ''} ago`;
    return 'Just now';
}

// Handle post options menu
function setupPostOptionsMenu() {
    const postOptions = document.querySelectorAll('.post-options');

    postOptions.forEach((optionsButton, index) => {
        optionsButton.addEventListener('click', function(e) {
            e.stopPropagation();

            // Remove any existing options menus
            const existingMenus = document.querySelectorAll('.post-options-menu');
            existingMenus.forEach(menu => menu.remove());

            const post = posts[index];

            // Only show edit/delete for the current user's posts
            if (currentUser && post.authorId === currentUser.id) {
                const optionsMenu = document.createElement('div');
                optionsMenu.className = 'post-options-menu';
                optionsMenu.innerHTML = `
                    <div class="option-item edit-post" data-index="${index}"><i class="fa-solid fa-wand-magic-sparkles"></i> Edit post</div>
                    <div class="option-item delete-post" data-index="${index}"><i class="fa-solid fa-trash"></i> Delete post</div>
                `;

                // Position the menu
                optionsButton.appendChild(optionsMenu);

                // Add event listeners
                const editOption = optionsMenu.querySelector('.edit-post');
                const deleteOption = optionsMenu.querySelector('.delete-post');

                editOption.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const postIndex = this.getAttribute('data-index');
                    optionsMenu.remove();
                    editPost(postIndex);
                });

                deleteOption.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    const postIndex = this.getAttribute('data-index');
                    optionsMenu.remove();
                    await deletePost(postIndex);
                });
            }
        });
    });

    // Close menu if user clicks elsewhere
    document.addEventListener('click', function() {
        const existingMenus = document.querySelectorAll('.post-options-menu');
        existingMenus.forEach(menu => menu.remove());
    });
}

function editPost(index) {
    if (!postsContainer || !posts[index]) return;

    const post = posts[index];
    const postContentElements = document.querySelectorAll('.post-content');
    const postContent = postContentElements[index];

    if (!postContent) return;

    const originalText = post.content;

    postContent.innerHTML = `
        <div class="edit-container">
            <textarea class="edit-textarea">${originalText}</textarea>
            <div class="edit-actions">
                <button class="btn btn-primary save-edit">Save</button>
                <button class="btn btn-secondary cancel-edit">Cancel</button>
            </div>
        </div>
    `;

    const textarea = postContent.querySelector('.edit-textarea');

    textarea.focus();

    // Set initial height based on content
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';

    // Add event listener for textarea resizing as user types
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });

    // Add event listeners for save and cancel
    const saveButton = postContent.querySelector('.save-edit');
    const cancelButton = postContent.querySelector('.cancel-edit');

    saveButton.addEventListener('click', async function() {
        const newContent = textarea.value.trim();
        if (newContent && newContent !== originalText) {
            try {
                const { error } = await db
                    .from('posts')
                    .update({ content: newContent })
                    .eq('id', post.id);

                if (error) throw error;

                post.content = newContent; 
                renderPosts();
            } catch (error) {
                console.error('Error updating post:', error);
                alert('Failed to update post. Please try again.');
            }
        } else {
            renderPosts();
        }
    });

    cancelButton.addEventListener('click', function() {
        renderPosts();
    });

}

function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-popup-overlay';

		// Create popup content
        const popup = document.createElement('div');
        popup.className = 'custom-popup';

		// Add message
        const title = document.createElement('h3');
        title.textContent = message;
        popup.appendChild(title);

		// Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'custom-popup-buttons';

		// Add cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'custom-popup-button custom-popup-cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };

		// Add confirm button
        const confirmButton = document.createElement('button');
        confirmButton.className = 'custom-popup-button custom-popup-confirm';
        confirmButton.textContent = 'Confirm';
        confirmButton.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };

		// Assemble the popup
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(confirmButton);
        popup.appendChild(buttonsContainer);
        overlay.appendChild(popup);

        document.body.appendChild(overlay);
    });
}

async function deletePost(index) {
    if (!posts[index]) return;

    const confirmed = await customConfirm('Are you sure you want to delete this post?');
    if (confirmed) {
        const postIdToDelete = posts[index].id;
        try {
            // Delete from database
            const { error } = await db
                .from('posts')
                .delete()
                .eq('id', postIdToDelete);

            if (error) throw error;

            // Remove from local array
            posts.splice(index, 1);
            renderPosts(); 
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    }
}

// Render active users
async function renderActiveUsers() {
    if (!activeUsers) return;
    await loadUsers();

    activeUsers.innerHTML = '';
    users.slice(0, 9).forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
                <div class="user-avatar-small">
                    ${user.avatar
                ? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
                : `<span class="avatar-initial">${user.name.charAt(0)}</span>`}
                </div>
                <div class="user-name">${user.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}</div>
            `;

        activeUsers.appendChild(userElement);
    });
}

// Render events
function renderEvents() {
    if (!eventList) return;
    eventList.innerHTML = '';

    if (events.length === 0) {
        eventList.innerHTML = '<p>No upcoming events</p>';
        return;
    }

    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
						<div class="event-date" style="
						    display: flex;
						    flex-direction: column;
						    background-color: #f0f2f5;
						    border-radius: 4px;
						    text-align: center;
						    min-width: 50px;
						    padding: 0;
						    overflow: hidden;
						    height: 60px;
						    color: grey;">

								<div id="top" style="margin: -1px -1px 0 -1px;
								    padding: 5px;
								    background-color: var(--baltic-blue);
								    color: white;"></div>

								<div class="event-month">${event.month.substring(0, 3)}</div>

								<div class="event-day">${event.day}</div>

						</div>

						<div class="event-info">

								<div class="event-title">${event.title}</div>

								<a href="#" class="event-link" style="color: cornflowerblue;">Find out more</a>

            </div>
        `;
        eventList.appendChild(eventElement);
    });
}

if (settingsTrigger) {
    settingsTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const nestedMenu = this.nextElementSibling;
        if (nestedMenu) {
            nestedMenu.style.display = nestedMenu.style.display === 'none' || nestedMenu.style.display === '' ? 'block' : 'none';
        }
    });
}

window.onload = async function() {
    await initializeData();

    checkSession();

    if (!currentUser) {
        if (loginPage) {
            loginPage.classList.remove('hidden');
        }
    }
};