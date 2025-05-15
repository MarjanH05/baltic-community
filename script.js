// Store users data
let users = [
		{ id: 1, name: "Danny Broome", avatar: null },
		{ id: 2, name: "Mia Harkins", avatar: null },
		{ id: 3, name: "The Baltic Community", avatar: null },
		{ id: 4, name: "Marjan Hussain", avatar: null },
		{ id: 5, name: "Ruairi Orr", avatar: null },
		{ id: 6, name: "Bailey S", avatar: null }
];

// Store posts data
let posts = [
		{
				id: 1,
				authorId: 1,
				authorName: "Danny Broome",
				avatar: null,
				content: "Happy Friday! How are you? How has your week been? Up to anything this weekend? As per usual, I'll leave mine in the comments. Happy days!",
				time: "3 hours ago"
		}
];

// Store events data
let events = [
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

// Current logged in user
let currentUser = null;

// DOM Elements
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

// Show login page by default
loginPage.classList.remove('hidden');

// Handle signup button click
signupBtn.addEventListener('click', () => {
		loginPage.classList.add('hidden');
		signupPage.classList.remove('hidden');
});

// Handle login form submission
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
        // Find user by email (in a real app, you'd verify credentials server-side)
        // For demo, just log in with any credentials
        loginUser({
            id: Date.now(),  // Generate a random ID
            name: email.split('@')[0],  // Use part of email as name
            email: email
        });
    } else {
        // Display error message
        alert(errorMessage);
    }
});

// Handle signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Email regex validation - requires letters before and after @, followed by . and domain extension
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Password regex validation - at least 8 chars, 1 uppercase letter, and 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    // Validation
    let isValid = true;
    let errorMessage = "";
    
    // Make sure fullname is a string and not empty
    if (!fullname || typeof fullname !== 'string' || fullname.toString().trim() === '') {
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
        // Create new user
        const newUser = {
            id: Date.now(),  // Generate a random ID
            name: fullname,
            email: email
        };
        
        // Add to users array
        users.push(newUser);
        
        // Log in the new user
        loginUser(newUser);
    } else {
        // Display error message
        alert(errorMessage);
    }
});

// Handle post input
postInput.addEventListener('click', () => {
		const content = prompt("What's on your mind?");
		if (content && content.trim() !== '') {
				// Create new post
				const newPost = {
						id: Date.now(),
						authorId: currentUser.id,
						authorName: currentUser.name,
						avatar: null,
						content: content,
						time: "Just now"
				};
				
				// Add to posts array
				posts.unshift(newPost);
				
				// Refresh posts
				renderPosts();
		}
});

// Login user function
function loginUser(user) {
		currentUser = user;
		
		// Add user to active users if not already there
		if (!users.find(u => u.id === user.id)) {
				users.push(user);
		}
		
		// Update UI
		userNameSpan.textContent = user.name;
		
		// Hide login/signup pages, show main app
		loginPage.classList.add('hidden');
		signupPage.classList.add('hidden');
		mainApp.classList.remove('hidden');
		
		// Initialize app
		initApp();
}

// Initialize app
function initApp() {
		renderPosts();
		renderActiveUsers();
		renderEvents();
}

// Render posts
function renderPosts() {
		postsContainer.innerHTML = '';

		if (posts.length === 0) {
				postsContainer.innerHTML = '<div class="post"><p>No posts yet. Be the first to post!</p></div>';
				return;
		}

		posts.forEach((post, index) => {
				const firstLetter = post.authorName.charAt(0);
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
										<div class="author-avatar">${firstLetter}</div>
										<div class="author-info">
												<h4>${post.authorName}</h4>
												<span class="post-time">${post.time}</span>
										</div>
								</div>
								<div class="post-options">⋮</div>
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

// Render active users
function renderActiveUsers() {
		activeUsers.innerHTML = '';
		
		users.forEach(user => {
				// Get first letter of user's name for avatar
				const firstLetter = user.name.charAt(0);
				
				const userElement = document.createElement('div');
				userElement.className = 'user-item';
				userElement.innerHTML = `
						<div class="user-avatar-small" style="display: flex; align-items: center; justify-content: center; background-color: #673ab7; color: white;">${firstLetter}</div>
						<div class="user-name">${user.name}</div>
				`;
				
				activeUsers.appendChild(userElement);
		});
}

// Render events
function renderEvents() {
		eventList.innerHTML = '';
		
		if (events.length === 0) {
				eventList.innerHTML = '<p>No upcoming events</p>';
				return;
		}
		
		events.forEach(event => {
				const eventElement = document.createElement('div');
				eventElement.className = 'event-item';
				eventElement.innerHTML = `
						<div class="event-date">
								<div class="event-month">${event.month}</div>
								<div class="event-day">${event.day}</div>
						</div>
						<div class="event-info">
								<div class="event-title">${event.title}</div>
								<a href="#" class="event-link">Find out more</a>
						</div>
				`;
				
				eventList.appendChild(eventElement);
		});
}

// Initialize app
window.onload = function() {
		// For demo purposes, show the login page
		loginPage.classList.remove('hidden');
};
