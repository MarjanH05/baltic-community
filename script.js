
// Store users data
let users = [
    { id: 1, name: "Danny Broome", avatar: "https://d102smnvqbot52.cloudfront.net/shrine_store/uploads/networks/2202/users/7767355/medium-6d715d13bd181a8cf360bde79c52f467.webp?Expires=1747322069&Signature=m2e47aebXQJzFyIMLGwaKwKCqkRuZitz9rIutf5TiCNMDV21zG6nJJwb7SHQ7Wcy-OVD~ftNbRRqNEW2qw8UakS7-2Wf1uoeMy0MoQdz362kqIaAzf-gVhDh-6GMJz2voFpReJ8b9mddgA0TJ-sNwJt~nGCacbZ4nscA2CrNXigTiPIXBpaTUMQVegcbs-CEKRhahIEOcKDOkoqRrw2ez-cXNTUFw5Nw7KLxUyQYvl81Cmw2-sNeM1kATgePuEDtvh7G9vO9Cke6vOiksQvG~~66f7T9zf3eJJIWRqQrq~2Oi9XmE~9NFBEtMTvRBrubvnF338b468An7Jj6glj9wg__&Key-Pair-Id=K2FGAUSZJ303Q5" },
    { id: 2, name: "Mia Harkins", avatar: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWpwOTk3am4xcDdnZTJteWxtcmZpcHhxZGhkYWszdmFpenVzY3l1MyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Kcu1uvmPfxAuabisnw/giphy.gif" },
    { id: 3, name: "The Baltic Community", avatar: "https://media.licdn.com/dms/image/v2/C4D0BAQFERN9z7JBnFA/company-logo_200_200/company-logo_200_200/0/1646302752002/baltic_apprenticeships_logo?e=2147483647&v=beta&t=9rTRI1w7C7Kkjmyv55s3KLmLqM43Rsyp7SJDtClfelQ" },
    { id: 4, name: "Marjan Hussain", avatar: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmN0cWViZWZzODdyYmp2d2xxdzl1cmZocWRhc2hnZGVhamtwdTR2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RTffR1LO6tWCWN8wtr/giphy.gif" },
    { id: 5, name: "Ruairi Orr", avatar: "https://d102smnvqbot52.cloudfront.net/shrine_store/uploads/networks/2202/users/7646496/medium-12c2878fd977f1549d420180de3612e5.webp?Expires=1747321935&Signature=SliVtWCazkuy4eSbVXRtW9GfBOjQPFCPNthGht00azBaUV63DIkrT5kmgBBpePUG-A4ZkGKY4ZfbJGRDzfaAoGAmHZKPwJvoG90Jbb0bMqMUbo~snwW~MtHGnA7PiFdTsyBz~IZ7ollYUikC4SCaiZyEfCVbL0555YR2RqGfBEonB1ipdcyxlohK7bpqoma~K3GjbAz7zvxR01t1yu-y5dyeSZH8tc~P7PIy1r39w5oKTAAJ9GPlqgnEThpzXS80rMbjEs2dJXCG2MuVwzBGxlmO9qz5em9hMR-M6bJXmS~Wm4TKoV~rdVk3OYI4hMz8GJQrmu~OtMhgBkB16bzeAw__&Key-Pair-Id=K2FGAUSZJ303Q5" },
    { id: 6, name: "Ellie Kenny", avatar: "https://randomuser.me/api/portraits/women/23.jpg" },
    { id: 7, name: "Bailey S", avatar: "https://d102smnvqbot52.cloudfront.net/shrine_store/uploads/networks/2202/users/7969556/medium-7dfe69508ddb3c1924a338287f3d2657.webp?Expires=1747322092&Signature=OgCBAB0T5rojqzOgrZQLpWooPbkEVfDS7brqyyYBN~RrdiazmOask~uUObGrn3F1gxjp945kGT-E~eBNdoBPkBX2uhIBQLaUic0HxNhkJAEZS6V1-YAbXqdiE1~8rKW7RC8x7nBn3P7kI6JSsbasyBM~PhNXvn4MkErooK4MIMn~QObPMAUMHMhBcXmnHnpyCFgSeg0-dSY3sDNq25lExUSgHKYmPTwAphYk1aaFVQ9JrxKwIVM5YGbaMESxczSQAXMmrGcm7p4yn3GDwFI4r7K0FvGYTbZ-UjvkaERcwqe9FnPXgM11gnOA98wfn5zKBDKFKSoYGLxWiEl33uqGTw__&Key-Pair-Id=K2FGAUSZJ303Q5" }
];

// Store posts data
let posts = [
    {
        id: 1,
        authorId: 7,
        authorName: "Grace Wharton",
        avatar: null,
        content: "Hello, I am going to be running Race4Life Pretty Muddy 5k next month with my 14-year-old Sister and my boyfriend. We've each suffered the loss of someone to cancer, making this even more motivating for each of us. I myself am a keen runner and recently ran the London Landmarks Half Marathon in April 2025 for the charity Tommy's, where I alone raised £550, and the Great Eastern Half in 2023, which I ran to help my mental wellbeing. I am again raising money, but for Cancer Research UK this time. If anyone can support, we would be more than grateful. I have attached our team page, but it shows our pages. My sister's for some reason, shows her as John, but that is hers. Once again, we would be grateful for any support for any of our pages or even words of encouragement.",
        time: "3 hours ago"
    }
];

// Store events data
let events = [
    {
        id: 1,
        title: "All Things EPA: Level 3 Multi-Channel Retailer",
        month: "MAY",
        day: "15",
        image: null
    },
    {
        id: 2,
        title: "Supporting Your Community Through Local Charity",
        month: "MAY",
        day: "27",
        image: null
    },
    {
        id: 3,
        title: "The Dangers of Radicalisation",
        month: "MAY",
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
const submitPostBtn = document.getElementById('submit-post-btn');
const profilePictureInput = document.getElementById('profile-picture');

// Show login page by default
loginPage.classList.remove('hidden');

// Handle signup button click
signupBtn.addEventListener('click', () => {
    loginPage.classList.add('hidden');
    signupPage.classList.remove('hidden');
});

// Handle back to login button click
backToLoginBtn.addEventListener('click', () => {
    signupPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

// Handle login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        // Find user by email (in a real app, you'd verify credentials server-side))
        const user = users.find(u => u.email === email) || {
            id: Date.now(), // Generate a random ID
            name: email.split('@')[0], // Use part of email as name
            email: email,
            avatar: null
        };

        loginUser(user);
    }
});

// Handle signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const profilePicture = profilePictureInput.files[0];

    if (fullname && email && password) {
        let avatarData = null;

        if (profilePicture) {
            avatarData = await convertImageToBase64(profilePicture);
        }

        const newUser = {
            id: Date.now(),  // Generate a random ID
            name: fullname,
            email: email,
            avatar: avatarData
        };

        users.push(newUser);
        loginUser(newUser);
    }
});

// Post when button is clicked
submitPostBtn.addEventListener('click', handlePostSubmit);


postInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handlePostSubmit();
    }
});

function handlePostSubmit() {
    const content = postInput.value;

// Convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Handle post input
postInput.addEventListener('click', () => {
    const content = prompt("What's on your mind?");
  
    if (content && content.trim() !== '') {
        const newPost = {
            id: Date.now(),
            authorId: currentUser.id,
            authorName: currentUser.name,
            avatar: currentUser.avatar,
            content: content,
            time: "Just now"
        };

        // Add to posts array
        posts.unshift(newPost);

        // Refresh posts
        posts.unshift(newPost);
        renderPosts();

        // Clear input
        postInput.value = '';
    }
}

// Login user function
function loginUser(user) {
    currentUser = user;

    if (!users.find(u => u.id === user.id)) {
        users.push(user);
    }

    userNameSpan.textContent = user.name;

    loginPage.classList.add('hidden');
    signupPage.classList.add('hidden');
    mainApp.classList.remove('hidden');

    updateCurrentUserAvatar();
    initApp();
}

// Update user avatar in UI
function updateCurrentUserAvatar() {
    if (currentUser) {
        // Profile icon in navbar
        if (currentUser.avatar) {
            profileIcon.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
        } else {
            profileIcon.textContent = currentUser.name.charAt(0);
        }

        // Post input avatar
        if (currentUser.avatar) {
            postUserAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar-image">`;
        } else {
            postUserAvatar.textContent = currentUser.name.charAt(0);
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
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="post"><p>No posts yet. Be the first to post!</p></div>';
        return;
    }

    posts.forEach((post, index) => {
        const maxLength = 350;
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
        link.addEventListener('click', function (e) {
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
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
                <div class="user-avatar-small">
                    ${user.avatar
                ? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
                : user.name.charAt(0)}
                </div>
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
window.onload = function () {
    // For demo purposes, show the login page
    loginPage.classList.remove('hidden');
};
