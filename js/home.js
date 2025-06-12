const viewAllUsersLink = document.getElementById('view-all-users');
const viewAllEventsLink = document.getElementById('view-all-events');

// Get current user from localStorage
const getCurrentUser = () => {
	try {
		const userData = localStorage.getItem('balticUser');
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error('Error parsing user data:', error);
		return null;
	}
};

const updateNavbarProfile = (user) => {
	if (!user) return;

	// Update navbar profile icon
	const profileIcon = document.getElementById('profile-icon');
	if (profileIcon) {
		if (user.avatar) {
			profileIcon.style.backgroundImage = `url('${user.avatar}')`;
			profileIcon.style.backgroundSize = 'cover';
			profileIcon.style.backgroundPosition = 'center';
			profileIcon.style.backgroundRepeat = 'no-repeat';
			profileIcon.textContent = ''; // Clear any initials
		} else {
			// Fallback to user initials
			profileIcon.style.backgroundImage = 'none';
			profileIcon.style.backgroundColor = '#673ab7';
			profileIcon.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
		}
	}

	// Update dropdown avatar
	const dropdownAvatar = document.getElementById('dropdown-avatar');
	if (dropdownAvatar) {
		if (user.avatar) {
			dropdownAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`;
		} else {
			// Fallback to user initials
			dropdownAvatar.innerHTML = '';
			dropdownAvatar.style.backgroundColor = '#673ab7';
			dropdownAvatar.style.color = 'white';
			dropdownAvatar.style.display = 'flex';
			dropdownAvatar.style.alignItems = 'center';
			dropdownAvatar.style.justifyContent = 'center';
			dropdownAvatar.style.fontWeight = 'bold';
			dropdownAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
		}
	}

	// Update dropdown username
	const dropdownUsername = document.getElementById('dropdown-username');
	if (dropdownUsername) {
		dropdownUsername.textContent = user.name || 'User';
	}
};

const updateHomeProfileAvatar = (user) => {
	if (!user) return;

	const profileAvatar = document.getElementById('profile-avatar');
	if (profileAvatar) {
		if (user.avatar) {
			profileAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`;
		} else {
			// Fallback to user initials with proper styling
			profileAvatar.innerHTML = '';
			profileAvatar.style.backgroundColor = '#673ab7';
			profileAvatar.style.color = 'white';
			profileAvatar.style.display = 'flex';
			profileAvatar.style.alignItems = 'center';
			profileAvatar.style.justifyContent = 'center';
			profileAvatar.style.fontWeight = 'bold';
			profileAvatar.style.fontSize = '32px'; // Larger font for home avatar
			profileAvatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
		}
	}
};

// Initialize profile pictures on page load
const initializeHomeProfile = () => {
	const currentUser = getCurrentUser();

	if (currentUser) {
		updateNavbarProfile(currentUser);
		updateHomeProfileAvatar(currentUser);

		const userNameElement = document.getElementById('user-name');
		if (userNameElement) {
			userNameElement.textContent = currentUser.name || 'User';
		}

		console.log('Home profile initialized for user:', currentUser.name);
	} else {
		console.log('No user found in localStorage');
	}
};

window.addEventListener('storage', (e) => {
	if (e.key === 'balticUser') {
		const updatedUser = e.newValue ? JSON.parse(e.newValue) : null;
		if (updatedUser) {
			updateNavbarProfile(updatedUser);
			updateHomeProfileAvatar(updatedUser);
		}
	}
});

const renderRecentUsers = async () => {
	const recentUsersList = document.getElementById('recent-users-list');
	await loadUsers();

	recentUsersList.innerHTML = '';

	// Populate the list with user data
	users.slice(0, 8).forEach(user => {
		const userElement = document.createElement('div');
		userElement.className = 'user-item';

		userElement.innerHTML = `
            <div class="user-avatar-small">
                ${user.avatar
				? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
				: `<span class="avatar-initial">${user.name.charAt(0).toUpperCase()}</span>`}
            </div>
            <div class="user-name">${user.name}</div>
        `;

		recentUsersList.appendChild(userElement);
	});
};

const renderAllUsers = async () => {
	const recentUsersList = document.getElementById('recent-users-list');
	await loadUsers();

	recentUsersList.innerHTML = '';

	// Populate the list with user data
	users.forEach(user => {
		const userElement = document.createElement('div');
		userElement.className = 'user-item';

		userElement.innerHTML = `
            <div class="user-avatar-small">
                ${user.avatar
				? `<img src="${user.avatar}" alt="${user.name}" class="avatar-image">`
				: `<span class="avatar-initial">${user.name.charAt(0).toUpperCase()}</span>`}
            </div>
            <div class="user-name">${user.name}</div>
        `;

		recentUsersList.appendChild(userElement);
	});
};

if (viewAllUsersLink) {
    viewAllUsersLink.addEventListener('click', async (event) => {
        event.preventDefault();
        await renderAllUsers();
    });
};

const renderUpcomingEvents = async () => {
	const eventsList = document.getElementById('upcoming-events-list');
	await loadEvents();

	eventsList.innerHTML = '';

	// Populate the list with all event data
	events.slice(0, 4).forEach(event => {
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

		eventsList.appendChild(eventElement);
	});
};

const renderAllEvents = async () => {
	const eventsList = document.getElementById('upcoming-events-list');
	await loadEvents();

    eventsList.innerHTML = '';

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
		eventsList.appendChild(eventElement);
	});
};

if (viewAllEventsLink) {
	viewAllEventsLink.addEventListener('click', async (event) => {
		event.preventDefault();
		await renderAllEvents();
	});
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	initializeHomeProfile();
	renderRecentUsers();
	renderUpcomingEvents();
});

// Export functions if needed by other scripts
window.homeProfileManager = {
	updateNavbarProfile,
	updateHomeProfileAvatar,
	getCurrentUser,
	initializeHomeProfile
};