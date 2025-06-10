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

const initializeProfileDropdown = () => {
	const profileIcon = document.getElementById('profile-icon');
	const profileDropdown = document.getElementById('profile-dropdown');
	const logoutLink = document.getElementById('logout-link');

	if (profileIcon && profileDropdown) {
		// Toggle dropdown on profile icon click
		profileIcon.addEventListener('click', (e) => {
			e.stopPropagation();
			profileDropdown.classList.toggle('hidden');
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			if (!profileDropdown.contains(e.target) && !profileIcon.contains(e.target)) {
				profileDropdown.classList.add('hidden');
			}
		});
	}

	// Handle logout
	if (logoutLink) {
		logoutLink.addEventListener('click', (e) => {
			e.preventDefault();
			localStorage.removeItem('balticUser');
			window.location.href = 'index.html'; // or login page
		});
	}
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	initializeHomeProfile();
	initializeProfileDropdown();
});

// Export functions if needed by other scripts
window.homeProfileManager = {
	updateNavbarProfile,
	updateHomeProfileAvatar,
	getCurrentUser,
	initializeHomeProfile
};