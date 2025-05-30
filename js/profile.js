const BACKEND_URL = "https://baltic-community.onrender.com";

document.addEventListener('DOMContentLoaded', function() {
    const aboutConfigIcon = document.getElementById('about-config');
    const headerConfigIcon = document.getElementById('header-config');
    const detailsConfigIcon = document.getElementById('details-config');
    const contactConfigIcon = document.getElementById('contact-config');
    
    // Initialize skeleton loading
    initializeSkeletonLoading();
    
    // Load profile data on page load
    loadProfileData().then(_r => {});
    
    if (aboutConfigIcon) {
        const aboutCard = aboutConfigIcon.closest('.card');
        aboutConfigIcon.addEventListener('click', function() {
            enterEditMode(aboutCard);
        });
    }
    
    if (headerConfigIcon) {
        headerConfigIcon.addEventListener('click', function() {
            enterProfileInfoEditMode();
        });
    }
    
    if (detailsConfigIcon) {
        const detailsCard = detailsConfigIcon.closest('.card');
        detailsConfigIcon.addEventListener('click', function() {
            enterApprenticeshipEditMode(detailsCard);
        });
    }
    
    if (contactConfigIcon) {
        const contactCard = contactConfigIcon.closest('.card');
        contactConfigIcon.addEventListener('click', function() {
            enterEditMode(contactCard);
        });
    }
    
    // Remove any hover styling from summary
    const summaryElement = document.querySelector('.user-summary');
    if (summaryElement) {
        summaryElement.style.cursor = 'default';
        summaryElement.classList.remove('hover-effect');
    }
});

function initializeSkeletonLoading() {
    // Add skeleton loading to summary
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement) {
        summaryElement.classList.add('loading');
        summaryElement.textContent = ''; // Clear any existing text during loading
    }
    
    // Add skeleton loading to all card-content-value elements
    const contentValues = document.querySelectorAll('.card-content-value');
    contentValues.forEach(element => {
        element.classList.add('loading');
        element.textContent = ''; // Clear any existing text during loading
    });
}

function removeSkeletonLoading() {
    // Remove skeleton loading from summary
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement) {
        summaryElement.classList.remove('loading');
    }
    
    // Remove skeleton loading from all card-content-value elements
    const contentValues = document.querySelectorAll('.card-content-value');
    contentValues.forEach(element => {
        element.classList.remove('loading');
    });
}

async function loadProfileData() {
    try {
        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('balticUser'));
        if (!currentUser) {
            setTimeout(() => {
                removeSkeletonLoading();
                const summaryElement = document.querySelector('.user-summary p');
                if (summaryElement) {
                    summaryElement.textContent = 'Summary';
                }
            }, 1000);
            return;
        }
        
        // Try backend first, fall back to localStorage
        let profileData = {};
        try {
            const response = await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`);
            if (response.ok) {
                profileData = await response.json();
            }
        } catch (error) {
            // Silently fall back to localStorage
        }
        
        // If no backend data, try localStorage
        if (!profileData || Object.keys(profileData).length === 0) {
            const localData = localStorage.getItem(`profileData_${currentUser.id}`);
            if (localData) {
                profileData = JSON.parse(localData);
            }
        }
        
        // Wait at least 1 second for skeleton animation, then update
        setTimeout(() => {
            removeSkeletonLoading();
            if (profileData && Object.keys(profileData).length > 0) {
                updateProfileDisplay(profileData);
                updateProfileInfoDisplay(profileData);
                updateApprenticeshipDetailsDisplay(profileData);
            } else {
                // Set default text if no data
                const summaryElement = document.querySelector('.user-summary p');
                if (summaryElement) {
                    summaryElement.textContent = 'Summary';
                }
            }
            // Always update contact details with current user's email
            updateContactDetailsDisplay();
        }, 1000);
        
    } catch (error) {
        console.log('Could not load profile data:', error);
        setTimeout(() => {
            removeSkeletonLoading();
            const summaryElement = document.querySelector('.user-summary p');
            if (summaryElement) {
                summaryElement.textContent = 'Summary';
            }
            updateContactDetailsDisplay();
        }, 1000);
    }
}

function updateContactDetailsDisplay() {
    const contactCard = document.querySelector('#contact-config')?.closest('.card');
    if (!contactCard) return;
    
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) return;
    
    const emailValueElement = contactCard.querySelector('.card-content-value');
    if (emailValueElement) {
        emailValueElement.textContent = currentUser.email;
        emailValueElement.classList.remove('loading');
    }
}

function updateProfileDisplay(profileData) {
    const aboutCard = document.querySelector('#about-config')?.closest('.card');
    if (!aboutCard) return;
    
    const contentTitles = aboutCard.querySelectorAll('.card-content-title');
    
    let updatedHTML = `
        <a id="about-config"><i class="fas fa-wrench"></i></a>
        <p class="card-title">About Me</p>
        <div class="divider"></div>
    `;
    
    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        const value = profileData[fieldName] || '';
        updatedHTML += `
            <p class="card-content-title">${fieldName}:</p>
            <p class="card-content-value">${value}</p>
            <div class="divider"></div>
        `;
    });
    
    aboutCard.innerHTML = updatedHTML;
    
    // Re-attach event listener
    const aboutConfigIcon = aboutCard.querySelector('#about-config');
    if (aboutConfigIcon) {
        aboutConfigIcon.addEventListener('click', function() {
            enterEditMode(aboutCard);
        });
    }
}

function updateApprenticeshipDetailsDisplay(profileData) {
    const detailsCard = document.querySelector('#details-config')?.closest('.card');
    if (!detailsCard) return;
    
    // Get all content values in the card
    const contentValues = detailsCard.querySelectorAll('.card-content-value');
    const titles = detailsCard.querySelectorAll('.card-content-title');
    
    // Create a mapping of titles to their corresponding value elements
    titles.forEach((title, index) => {
        const fieldName = title.textContent.replace(':', '');
        const value = profileData[fieldName] || '';
        const valueElement = contentValues[index];
        if (valueElement) {
            valueElement.textContent = value;
            valueElement.classList.remove('loading');
        }
    });
}

function updateProfileInfoDisplay(profileData) {
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement && profileData.summary) {
        summaryElement.textContent = profileData.summary;
    }
}

function enterEditMode(card) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    // Make card higher z-index
    card.style.position = 'relative';
    card.style.zIndex = '1000';
    
    // Store original content
    const originalContent = card.innerHTML;
    
    // Get current values
    const contentTitles = card.querySelectorAll('.card-content-title');
    const currentValues = {};
    
    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        const valueElement = title.nextElementSibling;
        currentValues[fieldName] = valueElement && valueElement.classList.contains('card-content-value') && !valueElement.classList.contains('loading')
            ? valueElement.textContent
            : '';
    });
    
    // Get card title
    const cardTitle = card.querySelector('.card-title').textContent;
    
    // Create edit form
    let editHTML = `
        <a id="${card.querySelector('a').id}"><i class="fas fa-wrench"></i></a>
        <p class="card-title">${cardTitle}</p>
        <div class="divider"></div>
    `;
    
    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        editHTML += `
            <div class="edit-field">
                <p class="card-content-title">${fieldName}:</p>
                <input type="text" class="edit-input" data-field="${fieldName}" value="${currentValues[fieldName]}" placeholder="Enter ${fieldName.toLowerCase()}">
            </div>
            <div class="divider"></div>
        `;
    });
    
    editHTML += `
        <div class="edit-buttons">
            <button class="btn btn-secondary cancel-edit">Cancel</button>
            <button class="btn btn-primary save-edit">Save</button>
        </div>
    `;
    
    card.innerHTML = editHTML;
    
    // Add event listeners for buttons
    const cancelBtn = card.querySelector('.cancel-edit');
    const saveBtn = card.querySelector('.save-edit');
    
    cancelBtn.addEventListener('click', function() {
        exitEditMode(card, originalContent, overlay);
    });
    
    saveBtn.addEventListener('click', function() {
        saveChanges(card, overlay).then(_r => {});
    });
    
    // Prevent clicks on card from bubbling to overlay
    card.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Click overlay to cancel
    overlay.addEventListener('click', function() {
        exitEditMode(card, originalContent, overlay);
    });
}

function exitEditMode(card, originalContent, overlay) {
    card.innerHTML = originalContent;
    card.style.position = '';
    card.style.zIndex = '';
    document.body.removeChild(overlay);
    
    // Re-attach event listener to config icon
    const configIcon = card.querySelector('a[id$="-config"]');
    if (configIcon) {
        configIcon.addEventListener('click', function() {
            enterEditMode(card);
        });
    }
}

async function saveChanges(card, overlay) {
    // Get input values
    const inputs = card.querySelectorAll('.edit-input');
    const updatedData = {};
    
    inputs.forEach(input => {
        const fieldName = input.getAttribute('data-field');
        updatedData[fieldName] = input.value;
    });
    
    try {
        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('balticUser'));
        if (!currentUser) {
            alert('Please log in to save profile data');
            return;
        }
        
        // Get existing profile data to merge with new data
        let existingData = {};
        const localData = localStorage.getItem(`profileData_${currentUser.id}`);
        if (localData) {
            existingData = JSON.parse(localData);
        }
        
        // Merge existing data with new data
        const mergedData = { ...existingData, ...updatedData };
        
        // Always save to localStorage as backup
        localStorage.setItem(`profileData_${currentUser.id}`, JSON.stringify(mergedData));
        
        // Try to save to backend
        try {
            await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mergedData)
            });
        } catch (error) {
            // Silently fall back to localStorage only
        }
        
        // Get card title and config icon id
        const cardTitle = card.querySelector('.card-title').textContent;
        const configIconId = card.querySelector('a[id$="-config"]').id;
        
        // Create updated HTML with saved values
        let updatedHTML = `
            <a id="${configIconId}"><i class="fas fa-wrench"></i></a>
            <p class="card-title">${cardTitle}</p>
            <div class="divider"></div>
        `;
        
        Object.keys(updatedData).forEach(fieldName => {
            updatedHTML += `
                <p class="card-content-title">${fieldName}:</p>
                <p class="card-content-value">${updatedData[fieldName]}</p>
                <div class="divider"></div>
            `;
        });
        
        card.innerHTML = updatedHTML;
        card.style.position = '';
        card.style.zIndex = '';
        document.body.removeChild(overlay);
        
        // Re-attach event listener to config icon
        const configIcon = card.querySelector(`#${configIconId}`);
        if (configIcon) {
            configIcon.addEventListener('click', function() {
                enterEditMode(card);
            });
        }
        
    } catch (error) {
        alert('Failed to save profile data. Please try again.');
        console.error('Error saving profile data:', error);
    }
}

function enterProfileInfoEditMode() {
    const summaryElement = document.querySelector('.user-summary');
    if (!summaryElement) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    // Make profile info card higher z-index
    const profileInfoCard = document.querySelector('.profile-info-card');
    profileInfoCard.style.position = 'relative';
    profileInfoCard.style.zIndex = '1000';
    
    // Hide profile elements during edit
    const profileAvatar = profileInfoCard.querySelector('.user-avatar');
    const profileName = profileInfoCard.querySelector('.user-name');
    const linkedinButton = profileInfoCard.querySelector('#linkedin-update');
    const headerConfigIcon = profileInfoCard.querySelector('#header-config');
    
    if (profileAvatar) profileAvatar.style.display = 'none';
    if (profileName) profileName.style.display = 'none';
    if (linkedinButton) linkedinButton.style.display = 'none';
    if (headerConfigIcon) headerConfigIcon.style.display = 'none';
    
    // Store original content and elements for restoration
    const summaryParagraph = summaryElement.querySelector('p');
    const originalText = summaryParagraph.textContent;
    const originalElements = {
        avatar: profileAvatar,
        name: profileName,
        linkedin: linkedinButton,
        configIcon: headerConfigIcon
    };
    
    // Create edit form for summary without the "Summary:" label
    summaryElement.innerHTML = `
        <div class="edit-field">
            <input type="text" class="edit-input" data-field="summary" maxlength="40" value="${originalText === 'Summary' ? '' : originalText}" placeholder="Enter a brief summary (40 chars max)">
            <div class="character-count">
                <span id="char-count">${originalText === 'Summary' ? 0 : originalText.length}</span>/40
            </div>
        </div>
        <div class="edit-buttons">
            <button class="btn btn-secondary cancel-summary-edit">Cancel</button>
            <button class="btn btn-primary save-summary-edit">Save</button>
        </div>
    `;
    
    // Add character counter functionality
    const input = summaryElement.querySelector('input[data-field="summary"]');
    const charCount = summaryElement.querySelector('#char-count');
    
    input.addEventListener('input', function() {
        charCount.textContent = input.value.length;
        
        // Visual feedback when approaching limit
        if (input.value.length >= 35) {
            charCount.style.color = '#ff6b6b';
        } else {
            charCount.style.color = '#666';
        }
    });
    
    // Add event listeners for buttons
    const cancelBtn = summaryElement.querySelector('.cancel-summary-edit');
    const saveBtn = summaryElement.querySelector('.save-summary-edit');
    
    cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        exitSummaryEditMode(summaryElement, originalText, overlay, profileInfoCard, originalElements);
    });
    
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        saveSummaryChanges(summaryElement, overlay, profileInfoCard, originalElements).then(_r => {});
    });
    
    // Prevent clicks on summary from bubbling to overlay
    summaryElement.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Click overlay to cancel
    overlay.addEventListener('click', function() {
        exitSummaryEditMode(summaryElement, originalText, overlay, profileInfoCard, originalElements);
    });
    
    // Focus on input
    if (input) {
        input.focus();
        // Place cursor at end of text
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

function exitSummaryEditMode(summaryElement, originalText, overlay, profileInfoCard, originalElements) {
    // Restore original summary content
    summaryElement.innerHTML = `<p>${originalText}</p>`;
    
    // Show hidden profile elements
    if (originalElements.avatar) originalElements.avatar.style.display = '';
    if (originalElements.name) originalElements.name.style.display = '';
    if (originalElements.linkedin) originalElements.linkedin.style.display = '';
    if (originalElements.configIcon) originalElements.configIcon.style.display = '';
    
    // Reset styling
    profileInfoCard.style.position = '';
    profileInfoCard.style.zIndex = '';
    document.body.removeChild(overlay);
    
    // Remove cursor pointer and ensure no click events
    summaryElement.style.cursor = 'default';
}

async function saveSummaryChanges(summaryElement, overlay, profileInfoCard, originalElements) {
    // Show loading state on save button
    const saveBtn = summaryElement.querySelector('.save-summary-edit');
    const originalButtonText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Get input value
    const input = summaryElement.querySelector('input[data-field="summary"]');
    const summaryText = input.value.trim();
    
    try {
        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('balticUser'));
        if (!currentUser) {
            alert('Please log in to save profile data');
            return;
        }
        
        // Get existing profile data to merge with new data
        let existingData = {};
        const localData = localStorage.getItem(`profileData_${currentUser.id}`);
        if (localData) {
            existingData = JSON.parse(localData);
        }
        
        // Merge existing data with new summary
        const mergedData = { ...existingData, summary: summaryText };
        
        // Always save to localStorage as backup
        localStorage.setItem(`profileData_${currentUser.id}`, JSON.stringify(mergedData));
        
        // Try to save to backend
        try {
            await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mergedData)
            });
        } catch (error) {
            // Silently fall back to localStorage only
            console.log('Backend save failed, using localStorage only');
        }
        
        // Update the summary display
        const displayText = summaryText || 'Summary';
        summaryElement.innerHTML = `<p>${displayText}</p>`;
        
        // Show hidden profile elements
        if (originalElements.avatar) originalElements.avatar.style.display = '';
        if (originalElements.name) originalElements.name.style.display = '';
        if (originalElements.linkedin) originalElements.linkedin.style.display = '';
        if (originalElements.configIcon) originalElements.configIcon.style.display = '';
        
        // Reset styling
        profileInfoCard.style.position = '';
        profileInfoCard.style.zIndex = '';
        document.body.removeChild(overlay);
        
        // Remove cursor pointer and ensure no click events
        summaryElement.style.cursor = 'default';
        
        console.log('Summary saved successfully');
        
    } catch (error) {
        // Reset button state on error
        saveBtn.textContent = originalButtonText;
        saveBtn.disabled = false;
        
        alert('Failed to save summary. Please try again.');
        console.error('Error saving summary:', error);
    }
}

function enterApprenticeshipEditMode(card) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);

    // Make card higher z-index
    card.style.position = 'relative';
    card.style.zIndex = '1000';

    // Store original content
    const originalContent = card.innerHTML;

    // Get current values
    const contentTitles = card.querySelectorAll('.card-content-title');
    const currentValues = {};

    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        const valueElement = title.nextElementSibling;
        currentValues[fieldName] = valueElement && valueElement.classList.contains('card-content-value') && !valueElement.classList.contains('loading')
            ? valueElement.textContent
            : '';
    });

    // Create edit form
    card.innerHTML = `
        <a id="details-config"><i class="fas fa-wrench"></i></a>
        <p class="card-title">Apprenticeship Details</p>
        <div class="divider"></div>
        
        <div class="edit-field">
            <p class="card-content-title">Programme:</p>
            <select class="edit-input" data-field="Programme">
                <option value="">Select Programme</option>
                <option value="Software Developer" ${currentValues['Programme'] === 'Software Developer' ? 'selected' : ''}>Software Developer</option>
                <option value="IT Support Technician" ${currentValues['Programme'] === 'IT Support Technician' ? 'selected' : ''}>IT Support Technician</option>
                <option value="Content Creator" ${currentValues['Programme'] === 'Content Creator' ? 'selected' : ''}>Content Creator</option>
            </select>
        </div>
        <div class="divider"></div>
        
        <div class="edit-field">
            <p class="card-content-title">Referral:</p>
            <select class="edit-input" data-field="Referral">
                <option value="">Select Referral Source</option>
                <option value="Through Employer" ${currentValues['Referral'] === 'Through Employer' ? 'selected' : ''}>Through Employer</option>
                <option value="Through website" ${currentValues['Referral'] === 'Through website' ? 'selected' : ''}>Through website</option>
            </select>
        </div>
        <div class="divider"></div>
        
        <div class="edit-field">
            <p class="card-content-title">Start Date:</p>
            <input type="date" class="edit-input" data-field="Start Date" value="${formatDateForInput(currentValues['Start Date'])}" placeholder="Select start date">
        </div>
        <div class="divider"></div>
        
        <div class="edit-buttons">
            <button class="btn btn-secondary cancel-edit">Cancel</button>
            <button class="btn btn-primary save-edit">Save</button>
        </div>
    `;

    // Add event listeners for buttons
    const cancelBtn = card.querySelector('.cancel-edit');
    const saveBtn = card.querySelector('.save-edit');

    cancelBtn.addEventListener('click', function() {
        exitApprenticeshipEditMode(card, originalContent, overlay);
    });

    saveBtn.addEventListener('click', function() {
        saveApprenticeshipChanges(card, overlay).then(_r => {});
    });

    // Prevent clicks on card from bubbling to overlay
    card.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Click overlay to cancel
    overlay.addEventListener('click', function() {
        exitApprenticeshipEditMode(card, originalContent, overlay);
    });
}

function exitApprenticeshipEditMode(card, originalContent, overlay) {
    card.innerHTML = originalContent;
    card.style.position = '';
    card.style.zIndex = '';
    document.body.removeChild(overlay);

    // Re-attach event listener to config icon
    const detailsConfigIcon = card.querySelector('#details-config');
    if (detailsConfigIcon) {
        detailsConfigIcon.addEventListener('click', function() {
            enterApprenticeshipEditMode(card);
        });
    }
}

async function saveApprenticeshipChanges(card, overlay) {
    // Show loading state on save button
    const saveBtn = card.querySelector('.save-edit');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    // Get input values
    const inputs = card.querySelectorAll('.edit-input, select');
    const updatedData = {};

    inputs.forEach(input => {
        const fieldName = input.getAttribute('data-field');
        let value = input.value;

        // Format date for display
        if (fieldName === 'Start Date' && value) {
            value = formatDateForDisplay(value);
        }

        updatedData[fieldName] = value;
    });

    try {
        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('balticUser'));
        if (!currentUser) {
            alert('Please log in to save profile data');
            return;
        }

        // Get existing profile data to merge with new data
        let existingData = {};
        const localData = localStorage.getItem(`profileData_${currentUser.id}`);
        if (localData) {
            existingData = JSON.parse(localData);
        }

        // Merge existing data with new data
        const mergedData = { ...existingData, ...updatedData };

        // Always save to localStorage as backup
        localStorage.setItem(`profileData_${currentUser.id}`, JSON.stringify(mergedData));

        // Try to save to backend
        try {
            await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mergedData)
            });
        } catch (error) {
            // Silently fall back to localStorage only
            console.log('Backend save failed, using localStorage only');
        }

        // Create updated HTML with saved values
        card.innerHTML = `
            <a id="details-config"><i class="fas fa-wrench"></i></a>
            <p class="card-title">Apprenticeship Details</p>
            <div class="divider"></div>
            <p class="card-content-title">Programme:</p>
            <p class="card-content-value">${updatedData['Programme'] || ''}</p>
            <div class="divider"></div>
            <p class="card-content-title">Referral:</p>
            <p class="card-content-value">${updatedData['Referral'] || ''}</p>
            <div class="divider"></div>
            <p class="card-content-title">Start Date:</p>
            <p class="card-content-value">${updatedData['Start Date'] || ''}</p>
            <div class="divider"></div>
        `;
        card.style.position = '';
        card.style.zIndex = '';
        document.body.removeChild(overlay);

        // Re-attach event listener to config icon
        const detailsConfigIcon = card.querySelector('#details-config');
        if (detailsConfigIcon) {
            detailsConfigIcon.addEventListener('click', function() {
                enterApprenticeshipEditMode(card);
            });
        }

        // Show success feedback (optional)
        console.log('Apprenticeship details saved successfully');

    } catch (error) {
        // Reset button state on error
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        alert('Failed to save apprenticeship details. Please try again.');
        console.error('Error saving apprenticeship details:', error);
    }
}

// Helper functions for date formatting
function formatDateForInput(dateString) {
    if (!dateString) return '';

    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    // Try to parse DD/MM/YYYY format
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }

    return '';
}

function formatDateForDisplay(dateString) {
    if (!dateString) return '';

    // Convert YYYY-MM-DD to DD/MM/YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}/${month}/${year}`;
    }

    return dateString;
}