// Store users data
let users = [];
let posts = [];
let events = [];

// Notifications System
let userNotifications = {};
function saveUsers() {
    sessionStorage.setItem('balticUsers', JSON.stringify(users));
}

function loadUsers() {
    const savedUsers = sessionStorage.getItem('balticUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = [
            { id: 1, name: "Danny Broome", email: "danny@baltic.com", password: "!Password1", avatar: "https://media.giphy.com/media/84CRvhy2DJlwA/giphy.gif" },
            { id: 2, name: "Ace Cochez", email: "ace@baltic.com", password: "!Password2", avatar: "https://t3.ftcdn.net/jpg/01/18/50/58/360_F_118505846_PZCicmZZdCNIHS7HUrkUqiUpJMaoJZFZ.jpg" },
            { id: 3, name: "The Baltic Community", email: "baltic@baltic.com", password: "!Password3", avatar: "https://cdn.brandfetch.io/idf8ZReMDl/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B" },
            { id: 4, name: "Marjan Hussain", email: "marjan@baltic.com", password: "!Password4", avatar: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOG9wbjMwMHdtMHN2dWg4eXVzc2h2eWF3ZTRqc251bG5pNmxpemJpayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VBZ6EWbfnLXKoRoSDv/giphy.gif" },
            { id: 5, name: "Ruairi Orr", email: "ruairi@baltic.com", password: "!Password5", avatar: "https://t4.ftcdn.net/jpg/13/76/74/77/240_F_1376747702_xFXUDsz4hnes0pIZgxjPBLMVB6cytJQx.jpg" },
            { id: 6, name: "Bailey S", email: "bailey@baltic.com", password: "!Password6", avatar: "https://randomuser.me/api/portraits/men/1.jpg" }
        ];
        saveUsers();
    }
}

function savePosts() {
    sessionStorage.setItem('balticPosts', JSON.stringify(posts));
}

function loadPosts() {
    const savedPosts = sessionStorage.getItem('balticPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [
		{
				id: users[0].id,
				authorId: users[0].id,
				authorName: users[0].name,
                avatar: users[0].avatar,
				content: "Happy Friday! How are you? How has your week been? Up to anything this weekend? As per usual, I'll leave mine in the comments. Happy days!",
                timestamp: Date.now() - (300000) // 5 mins
		},
		{
				id: users[3].id,
				authorId: users[3].id,
				authorName: users[3].name,
                avatar: users[3].avatar,
				content: "Did you know I have a BMW??",
                timestamp: Date.now() - (600000) // 10 mins
		}
        ];
        savePosts();
    }
}

function saveEvents() {
    sessionStorage.setItem('balticEvents', JSON.stringify(events));
}

function loadEvents() {
    const savedEvents = sessionStorage.getItem('balticEvents');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    } else {
        events = [
		{
				id: 1,
				title: "Creating Replicas: How to re-imagine a website",
				month: "JUNE",
				day: "15",
				image: null
		},
		{
				id: 2,
				title: "How to upgrade the UI/UX of a community platform",
				month: "JULY",
				day: "27",
				image: null
		},
		{
				id: 3,
				title: "The Dangers of Bad UI",
				month: "AUGUST",
				day: "30",
				image: null
		}
        ];
        saveEvents();
    }
}

loadUsers();
loadPosts();
loadEvents();

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
// Dropdown elements
const profileDropdown = document.getElementById('profile-dropdown');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const dropdownUsername = document.getElementById('dropdown-username');
const logoutLink = document.getElementById('logout-link');

// Show login page by default, but only if loginPage exists
if (loginPage) {
    loginPage.classList.remove('hidden');
}

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
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Email regex validation - requires letters before and after @, followed by . and domain extension
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Password regex validation - at least 8 chars, 1 uppercase letter, and 1 number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        // Validation
        let isValid = true;
        let errorMessage = "";

        // Make sure email is a string and validate format
        if (!email || typeof email !== 'string' || !emailRegex.test(email.toString())) {
            isValid = false;
            errorMessage += "Invalid email format. Email must have format like 'name@example.com'\n";
        }

        // Make sure password is a string and validate format
        if (!password || typeof password !== 'string' || !passwordRegex.test(password.toString())) {
            isValid = false;
            errorMessage += "Password must be at least 8 characters and include at least 1 uppercase letter and 1 number";
        }

        if (isValid) {
            const foundUser = users.find(user => user.email === email.toLowerCase() && user.password === password);
            if(foundUser) {
                loginUser({
                    id: foundUser.id,
                    avatar: foundUser.avatar,
                    name: foundUser.name,
                    email: foundUser.email
                });
            }
            else {
                loginUser({
                    id: users.length + 1,
                    name: email.split('@')[0],
                    avatar: null,
                    email: email
                });
            }
        } else {
            // Display error message
            alert(errorMessage);
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const profilePictureInput = document.getElementById('profile-picture').files[0];

        // Email regex validation - requires letters before and after @, followed by . and domain extension
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Password regex validation - at least 8 chars, 1 uppercase letter and 1 number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        // Validation
        let isValid = true;
        let errorMessage = "";

        // Make sure fullName is a string and not empty
        if (!fullName || typeof fullName !== 'string' || fullName.toString().trim() === '') {
            isValid = false;
            errorMessage += "Full name is required\n";
        }

        if (!emailRegex.test(email)) {
            isValid = false;
            errorMessage += "Invalid email format. Email must have format like 'name@example.com'\n";
        }

        if (!passwordRegex.test(password)) {
            isValid = false;
            errorMessage += "Password must be at least 8 characters and include at least 1 uppercase letter and 1 number";
        }

        if (isValid) {
            let avatarUrl = null;
            if (profilePictureInput) {
                avatarUrl = await convertImageToBase64(profilePictureInput);
            }
            // Create new user
            const newUser = {
                id: users.length + 1,
                name: fullName,
                email: email,
                avatar: avatarUrl
            };

            // Add to users array
            users?.push(newUser);
            saveUsers();
            // Log in the new user
            loginUser(newUser);
        } else {
            // Display error message
            alert(errorMessage);
        }
    });
}

// Initialize notifications after first login
let notificationsInitialized = false;

function initNotifications() {
	const notificationsIcon = document.getElementById('notifications-icon');
    const notificationsDropdown = document.getElementById('notifications-dropdown');

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
        return;
    }

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

function handlePostSubmit() {
    if (!postInput) return;

    const content = postInput.value;
    const submitBtn = document.getElementById('submit-post-btn');
    const spinner = submitBtn.querySelector('.spinner');

    // Holding 'enter' doesn't allow mutiple posts to be submitted
    if (submitBtn.disabled) {
        return;
    }

    if (content && content.trim() !== '') {

        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        const newPost = {
            id: Date.now(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            avatar: currentUser.avatar,
            content: content,
            timestamp: Date.now()
        };

        // Simulate wait so spinner appears
        setTimeout(() => {
            posts.unshift(newPost);
            renderPosts();
            savePosts();
            notifyUsersAboutNewPost(currentUser.id, currentUser.name);

            postInput.value = '';
            if (typeof autoResizeTextarea === 'function') {
                autoResizeTextarea();
            }
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }, 500);
    }
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
        dropdownAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
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
function loginUser(user, fromSession = false) {
		currentUser = user;

		// Add user to active users if not already there
		if (!users.find(u => u.id === user.id)) {
				users.push(user);
		}

		// Update UI only if elements exist
		if (userNameSpan) {
            userNameSpan.textContent = user.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
		}

	    // Hide login/signup pages, show main app (only on index page)
		    if (loginPage) loginPage.classList.add('hidden');
		    if (signupPage) signupPage.classList.add('hidden');
		    if (mainApp) mainApp.classList.remove('hidden');

		 // Save session if not from session
        if (!fromSession) {
            saveSession(user);
        }

		// Initialize app
        updateCurrentUserAvatar();
	    initNotifications();
	    initApp();
}

// Update user avatar in UI
function updateCurrentUserAvatar() {
    if (!currentUser) return;

    // Profile icon in navbar
    if (profileIcon) {
        if (currentUser.avatar) {
            profileIcon.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
        } else {
            profileIcon.textContent = currentUser.name.charAt(0);
        }
    }

    // Post input avatar
    if (postUserAvatar) {
        if (currentUser.avatar) {
            postUserAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
        } else {
            postUserAvatar.textContent = currentUser.name.charAt(0);
        }
    }

    // Profile avatar
    if (profileAvatar) {
        if (currentUser.avatar) {
            profileAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
        } else {
            profileAvatar.textContent = currentUser.name.charAt(0);
        }
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
                : post.authorName.charAt(0)}
                        </div>
                        <div class="author-info">
                            <h4 class="subtitle" style="padding-bottom: 0; margin-bottom: 0;">${post.authorName}</h4>
                            <span class="post-time">${formatTimeAgo(post.timestamp || Date.now())}</span>
                        </div>
                    </div>
                    <div class="post-options"><i class="fa-solid fa-ellipsis-vertical"></i></div>
                </div>
                <div class="post-content">
                    <p>
                        <span class="post-text">${truncatedContent}</span>
                        ${showReadMore ? '<a href="#" class="read-more" data-index="' + index + '">Read more</a>' : ''}
                    </p>
                </div>
            `;

				postsContainer.appendChild(postElement);
                setupPostOptionsMenu();
		});

		// Add event listeners for "Read more" links
		const readMoreLinks = postsContainer.querySelectorAll('.read-more');
		readMoreLinks.forEach(link => {
				link.addEventListener('click', function(e) {
						e.preventDefault();
						const idx = this.getAttribute('data-index');
						const postText = this.parentElement.querySelector('.post-text');
						postText.textContent = posts[idx].content;
						this.style.display = 'none';
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

                deleteOption.addEventListener('click', function() {
                    const postIndex = this.getAttribute('data-index');
                    deletePost(postIndex).then(x => {x = null});
                    optionsMenu.remove();
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
    if (!postsContainer) return;

    const post = posts[index];
    const postContent = document.querySelectorAll('.post-content')[index];
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
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });

    // Add event listeners for save and cancel
    const saveButton = postContent.querySelector('.save-edit');
    const cancelButton = postContent.querySelector('.cancel-edit');

    saveButton.addEventListener('click', function() {
        const newContent = textarea.value.trim();
        if (newContent) {
            post.content = newContent;
            savePosts();
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
	const confirmed = await customConfirm('Are you sure you want to delete this post?');
	if (confirmed) {
        posts.splice(index, 1);
        savePosts();
		renderPosts();
	}
}

// Render active users
function renderActiveUsers() {
        if (!activeUsers) return;

		activeUsers.innerHTML = '';
		users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
                <div class="user-avatar-small">
                    ${user.avatar
                ? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
                : user.name.charAt(0)}
                </div>
                <div class="user-name">${user.name
                    .split('.')
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

const settingsTrigger = document.getElementById('settings-trigger'); 
	settingsTrigger.addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();
		const nestedMenu = this.nextElementSibling;
		if (nestedMenu) { 
		    nestedMenu.style.display = nestedMenu.style.display === 'none' || nestedMenu.style.display === '' ? 'block' : 'none';
        }
	});

window.onload = function() {
		checkSession(); // Try to restore session
		// If no session, show login page
		if (!currentUser) {
				loginPage.classList.remove('hidden');
				}
};