// Configuration
const BACKEND_URL = "https://baltic-community-xm74.onrender.com";

// Utility Functions
const createOverlay = () => {
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
    return overlay;
};

const removeOverlay = (overlay) => {
    if (overlay && overlay.parentNode) {
        document.body.removeChild(overlay);
    }
};

const setCardEditMode = (card) => {
    card.style.position = 'relative';
    card.style.zIndex = '1000';
};

const resetCardMode = (card) => {
    card.style.position = '';
    card.style.zIndex = '';
};

const setButtonLoading = (button, isLoading = true) => {
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Saving...';
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || 'Save';
        button.disabled = false;
    }
};

const extractCurrentValues = (card) => {
    const contentTitles = card.querySelectorAll('.card-content-title');
    const currentValues = {};
    
    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        const valueElement = title.nextElementSibling;
        currentValues[fieldName] = valueElement?.classList.contains('card-content-value') && !valueElement.classList.contains('loading')
            ? valueElement.textContent
            : '';
    });
    
    return currentValues;
};

const extractInputValues = (card) => {
    const inputs = card.querySelectorAll('.edit-input, select');
    const values = {};
    
    inputs.forEach(input => {
        const fieldName = input.getAttribute('data-field');
        values[fieldName] = input.value;
    });
    
    return values;
};

// Data Management

const loadUserProfileData = async () => {
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) return null;

    try {
        const response = await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.log('Stored in localStorage - 404 is due to fallback...');
        }
    } catch (error) {
        console.log('Stored in localStorage - Network or other error...');
    }

    const localData = localStorage.getItem(`profileData_${currentUser.id}`);
    return localData ? JSON.parse(localData) : {};
};

const saveUserProfileData = async (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) {
        throw new Error('Please log in to save profile data');
    }

    const existingData = await loadUserProfileData() || {};
    const mergedData = { ...existingData, ...updatedData };

    localStorage.setItem(`profileData_${currentUser.id}`, JSON.stringify(mergedData));

    try {
        await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedData)
        });
    } catch (error) {
        console.log('Stored in localStorage');
    }

    return mergedData;
};

const loadProfileData = async () => {
    try {
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

        const profileData = await loadUserProfileData();

        setTimeout(() => {
            removeSkeletonLoading();
            if (profileData && Object.keys(profileData).length > 0) {
                updateProfileDisplay(profileData);
                updateProfileInfoDisplay(profileData);
                updateApprenticeshipDetailsDisplay(profileData);
            } else {
                const summaryElement = document.querySelector('.user-summary p');
                if (summaryElement) {
                    summaryElement.textContent = 'Summary';
                }
            }
            updateContactDetailsDisplay(profileData);
        }, 1000);

    } catch (error) {
        console.log('Could not load profile data:', error);
        setTimeout(() => {
            removeSkeletonLoading();
            const summaryElement = document.querySelector('.user-summary p');
            if (summaryElement) {
                summaryElement.textContent = 'Summary';
            }
            updateContactDetailsDisplayOriginal();
        }, 1000);
    }
};

// Skeleton Loading

const initializeSkeletonLoading = () => {
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement) {
        summaryElement.classList.add('loading');
        summaryElement.textContent = '';
    }

    const contentValues = document.querySelectorAll('.card-content-value');
    contentValues.forEach(element => {
        element.classList.add('loading');
        element.textContent = '';
    });
};

const removeSkeletonLoading = () => {
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement) {
        summaryElement.classList.remove('loading');
    }

    const contentValues = document.querySelectorAll('.card-content-value');
    contentValues.forEach(element => {
        element.classList.remove('loading');
    });
};

// Edit Form Creation

const createEditForm = (fields, cardTitle, configIconId) => {
    let editHTML = `
        <a id="${configIconId}"><i class="fas fa-wrench"></i></a>
        <p class="card-title">${cardTitle}</p>
        <div class="divider"></div>
    `;

    fields.forEach(field => {
        if (field.type === 'select') {
            editHTML += `
                <div class="edit-field">
                    <p class="card-content-title">${field.label}:</p>
                    <select class="edit-input" data-field="${field.name}">
                        ${field.options.map(option => 
                            `<option value="${option.value}" ${field.value === option.value ? 'selected' : ''}>${option.label}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="divider"></div>
            `;
        } else if (field.type === 'date') {
            editHTML += `
                <div class="edit-field">
                    <p class="card-content-title">${field.label}:</p>
                    <input type="date" class="edit-input" data-field="${field.name}" value="${formatDateForInput(field.value)}" placeholder="${field.placeholder || ''}">
                </div>
                <div class="divider"></div>
            `;
        } else if (field.type === 'text-with-counter') {
            editHTML += `
                <div class="edit-field">
                    <input type="text" class="edit-input" data-field="${field.name}" maxlength="${field.maxLength}" value="${field.value || ''}" placeholder="${field.placeholder || ''}">
                    <div class="character-count">
                        <span id="char-count">${(field.value || '').length}</span>/${field.maxLength}
                    </div>
                </div>
                <div class="divider"></div>
            `;
        } else {
            editHTML += `
                <div class="edit-field">
                    <p class="card-content-title">${field.label}:</p>
                    <input type="text" class="edit-input" data-field="${field.name}" value="${field.value || ''}" placeholder="${field.placeholder || ''}">
                </div>
                <div class="divider"></div>
            `;
        }
    });

    editHTML += `
        <div class="edit-buttons">
            <button class="btn btn-secondary cancel-edit">Cancel</button>
            <button class="btn btn-primary save-edit">Save</button>
        </div>
    `;

    return editHTML;
};

// Generic Edit Handler

const handleGenericEdit = async (card, fields, onSave, exitFunction) => {
    const overlay = createOverlay();
    setCardEditMode(card);
    
    const originalContent = card.innerHTML;
    const cardTitle = card.querySelector('.card-title').textContent;
    const configIconId = card.querySelector('a[id$="-config"]').id;
    
    card.innerHTML = createEditForm(fields, cardTitle, configIconId);
    
    const textWithCounterField = fields.find(f => f.type === 'text-with-counter');
    if (textWithCounterField) {
        const input = card.querySelector(`input[data-field="${textWithCounterField.name}"]`);
        const charCount = card.querySelector('#char-count');
        
        input.addEventListener('input', () => {
            charCount.textContent = input.value.length;
            charCount.style.color = input.value.length >= (textWithCounterField.maxLength - 5) ? '#ff6b6b' : '#666';
        });
        
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
    
    const cancelBtn = card.querySelector('.cancel-edit');
    const saveBtn = card.querySelector('.save-edit');
    
    cancelBtn.addEventListener('click', () => {
        exitGenericEdit(card, originalContent, overlay, exitFunction);
    });
    
    saveBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(saveBtn, true);
            await onSave(card);
            removeOverlay(overlay);
            resetCardMode(card);
        } catch (error) {
            setButtonLoading(saveBtn, false);
            alert('Failed to save. Please try again.');
            console.error('Error saving:', error);
        }
    });
    
    card.addEventListener('click', e => e.stopPropagation());
    overlay.addEventListener('click', () => {
        exitGenericEdit(card, originalContent, overlay, exitFunction);
    });
};

const exitGenericEdit = (card, originalContent, overlay, exitFunction) => {
    card.innerHTML = originalContent;
    resetCardMode(card);
    removeOverlay(overlay);
    
    if (exitFunction) {
        exitFunction();
    } else {
        const configIcon = card.querySelector('a[id$="-config"]');
        if (configIcon) {
            const editFunction = getEditFunctionForCard(configIcon.id);
            if (editFunction) {
                configIcon.addEventListener('click', editFunction);
            }
        }
    }
};

const getEditFunctionForCard = (configIconId) => {
    switch (configIconId) {
        case 'about-config':
            return () => enterEditMode(document.querySelector('#about-config').closest('.card'));
        case 'details-config':
            return () => enterApprenticeshipEditMode(document.querySelector('#details-config').closest('.card'));
        case 'contact-config':
            return () => enterContactEditMode(document.querySelector('#contact-config').closest('.card'));
        case 'header-config':
            return () => enterProfileInfoEditMode();
        default:
            return null;
    }
};

// Contact Edit Mode

const enterContactEditMode = (card) => {
    const overlay = createOverlay();
    setCardEditMode(card);

    const originalContent = card.innerHTML;

    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    const emailValue = currentUser?.email || 'No email available';

    // Get social links from stored data instead of display text
    const getCurrentSocialLinks = async () => {
        const profileData = await loadUserProfileData();
        return profileData?.['Social Links'] || '';
    };

    getCurrentSocialLinks().then(socialLinksString => {
        const socialLinksArray = socialLinksString ? socialLinksString.split(', ').filter(link => link.trim()) : [];

        card.innerHTML = `
            <a id="contact-config"><i class="fas fa-wrench"></i></a>
            <p class="card-title">Contact Details</p>
            <div class="divider"></div>
            <p class="card-content-title">Email:</p>
            <p class="card-content-value">${emailValue}</p>
            <div class="divider"></div>
            <div class="edit-field">
                <p class="card-content-title">Social Links:</p>
                <div class="social-links-container" id="social-links-container">
                    ${socialLinksArray.map((link, index) => `
                        <div class="social-link-item" data-index="${index}">
                            <input type="text" class="edit-input social-link-input" value="${link}" placeholder="Enter social link">
                            <button type="button" class="remove-link-btn" onclick="removeSocialLink(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="add-social-link">
                    <button type="button" class="btn btn-secondary add-link-btn" id="add-link-btn">
                        <i class="fas fa-plus"></i> Add Social Link
                    </button>
                    <div class="social-dropdown hidden" id="social-dropdown">
                        <div class="dropdown-item" data-type="linkedin">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </div>
                        <div class="dropdown-item" data-type="other">
                            <i class="fas fa-link"></i> Other
                        </div>
                    </div>
                </div>
            </div>
            <div class="edit-buttons">
                <button class="btn btn-secondary cancel-edit">Cancel</button>
                <button class="btn btn-primary save-edit">Save</button>
            </div>
        `;

        const addLinkBtn = card.querySelector('#add-link-btn');
        const socialDropdown = card.querySelector('#social-dropdown');
        const socialLinksContainer = card.querySelector('#social-links-container');

        addLinkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            socialDropdown.classList.toggle('hidden');
        });

        socialDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownItem = e.target.closest('.dropdown-item');
            if (dropdownItem) {
                const type = dropdownItem.getAttribute('data-type');
                addSocialLink(type, socialLinksContainer);
                socialDropdown.classList.add('hidden');
            }
        });

        document.addEventListener('click', () => {
            socialDropdown.classList.add('hidden');
        });

        const cancelBtn = card.querySelector('.cancel-edit');
        const saveBtn = card.querySelector('.save-edit');

        cancelBtn.addEventListener('click', () => {
            exitContactEdit(card, originalContent, overlay);
        });

        saveBtn.addEventListener('click', async () => {
            try {
                setButtonLoading(saveBtn, true);

                const socialLinkInputs = card.querySelectorAll('.social-link-input');
                const socialLinks = Array.from(socialLinkInputs)
                .map(input => input.value.trim())
                .filter(link => link)
                .join(', ');

                const dataToSave = {
                    'Social Links': socialLinks
                };

                await saveUserProfileData(dataToSave);

                removeOverlay(overlay);
                resetCardMode(card);

                const savedData = await loadUserProfileData();
                updateContactDetailsDisplay(savedData);

            } catch (error) {
                setButtonLoading(saveBtn, false);
                alert('Failed to save. Please try again.');
                console.error('Error saving:', error);
            }
        });

        card.addEventListener('click', e => e.stopPropagation());
        overlay.addEventListener('click', () => {
            exitContactEdit(card, originalContent, overlay);
        });
    });
};

// Social Link Management

const addSocialLink = (type, container) => {
    const index = container.children.length;
    let placeholder;
    let defaultValue;

    if (type === 'linkedin') {
        defaultValue = 'https://www.linkedin.com/in/';
        placeholder = 'https://www.linkedin.com/in/your-profile';
    } else {
        defaultValue = 'https://';
        placeholder = 'https://youtube.com/';
    }

    const linkItem = document.createElement('div');
    linkItem.className = 'social-link-item';
    linkItem.setAttribute('data-index', index.toString());
    linkItem.innerHTML = `
        <input type="text" class="edit-input social-link-input" value="${defaultValue}" placeholder="${placeholder}">
        <button type="button" class="remove-link-btn" onclick="removeSocialLink(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(linkItem);

    const newInput = linkItem.querySelector('input');
    newInput.focus();
    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
};

const removeSocialLink = (index) => {
    const linkItem = document.querySelector(`[data-index="${index}"]`);
    if (linkItem) {
        linkItem.remove();
    }
};

const getPlatformIcon = (url) => {
    const lowerUrl = url.toLowerCase();

    // Social Media Platform icons
    if (lowerUrl.includes('linkedin.com')) {
        return { icon: 'fab fa-linkedin', color: 'var(--baltic-linkedin-blue)' };
    }
    if (lowerUrl.includes('facebook.com')) {
        return { icon: 'fab fa-facebook', color: '#1877f2' };
    }
    if (lowerUrl.includes('instagram.com')) {
        return { icon: 'fab fa-instagram', color: '#e4405f' };
    }
    if (lowerUrl.includes('youtube.com')) {
        return { icon: 'fab fa-youtube', color: '#ff0000' };
    }
    if (lowerUrl.includes('pinterest.com')) {
        return { icon: 'fab fa-pinterest', color: '#bd081c' };
    }
    if (lowerUrl.includes('whatsapp.com')) {
        return { icon: 'fab fa-whatsapp', color: '#25d366' };
    }

    // Tech/Code Platforms
    if (lowerUrl.includes('github.com')) {
        return { icon: 'fab fa-github', color: '#333333' };
    }
    if (lowerUrl.includes('gitlab.com')) {
        return { icon: 'fab fa-gitlab', color: '#fc6d26' };
    }
    if (lowerUrl.includes('stackoverflow.com')) {
        return { icon: 'fab fa-stack-overflow', color: '#f58025' };
    }
    if (lowerUrl.includes('codepen.io')) {
        return { icon: 'fab fa-codepen', color: '#000000' };
    }
    if (lowerUrl.includes('figma.com')) {
        return { icon: 'fab fa-figma', color: '#f24e1e' };
    }
    if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) {
        return { icon: 'fab fa-discord', color: '#5865f2' };
    }
    if (lowerUrl.includes('tumblr.com')) {
        return { icon: 'fab fa-tumblr', color: '#001935' };
    }

    // Other Platforms
    if (lowerUrl.includes('google.com')) {
        return { icon: 'fab fa-google', color: '#4285f4' };
    }
    if (lowerUrl.includes('apple.com')) {
        return { icon: 'fab fa-apple', color: '#000000' };
    }
    if (lowerUrl.includes('microsoft.com')) {
        return { icon: 'fab fa-microsoft', color: '#00a1f1' };
    }
    if (lowerUrl.includes('spotify.com')) {
        return { icon: 'fab fa-spotify', color: '#1db954' };
    }
    if (lowerUrl.includes('twitch.tv')) {
        return { icon: 'fab fa-twitch', color: '#9146ff' };
    }

    // Default for unknown platforms
    return null;
};

const formatSocialLinksForDisplay = (socialLinksString) => {
    if (!socialLinksString || socialLinksString.trim() === '') {
        return '';
    }

    const links = socialLinksString.split(', ').filter(link => link.trim());

    return links.map(link => {
        const trimmedLink = link.trim();
        if (trimmedLink.startsWith('https://')) {
            const platformIcon = getPlatformIcon(trimmedLink);
            if (platformIcon) {
                return `<a href="${trimmedLink}" target="_blank" rel="noopener noreferrer" title="${trimmedLink}"><i class="${platformIcon.icon}" style="color: ${platformIcon.color}; font-size: 2em;"></i></a>`;
            } else {
                // For unknown HTTPS URLs, show the full URL without protocol
                const displayText = trimmedLink.replace('https://', '');
                return `<p></p><a href="${trimmedLink}" target="_blank" rel="noopener noreferrer" style="color: var(--baltic-linkedin-blue)">${displayText}</a>`;
            }
        } else {
            // If it's not a proper HTTPS URL, display with warning icon and tooltip
            const warningIcon = '<p></p><i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i>';
            return `<span class="insecure-link" title="Unsecure URL - be cautious">${warningIcon} ${trimmedLink}</span>`;
        }
    }).join(' ');
};

const exitContactEdit = (card, originalContent, overlay) => {
    card.innerHTML = originalContent;
    resetCardMode(card);
    removeOverlay(overlay);

    const contactConfig = card.querySelector('#contact-config');
    if (contactConfig) {
        contactConfig.addEventListener('click', () => enterContactEditMode(card));
    }
};
const updateContactDetailsDisplay = (data) => {
    const contactCard = document.querySelector('#contact-config').closest('.card');
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));

    contactCard.innerHTML = `
        <a id="contact-config"><i class="fas fa-wrench"></i></a>
        <p class="card-title">Contact Details</p>
        <div class="divider"></div>
        <p class="card-content-title">Email:</p>
        <p class="card-content-value">${currentUser?.email || 'No email available'}</p>
        <div class="divider"></div>
        <p class="card-content-title">Social Links:</p>
        <div class="card-content-value">${formatSocialLinksForDisplay(data && data['Social Links'] || '')}</div>
        <div class="divider"></div>
    `;

    const contactConfig = contactCard.querySelector('#contact-config');
    if (contactConfig) {
        contactConfig.addEventListener('click', () => enterContactEditMode(contactCard));
    }
};

// Display Update Functions
const updateCardDisplay = (card, data, configIconId) => {
    const cardTitle = card.querySelector('.card-title').textContent;

    let updatedHTML = `
        <a id="${configIconId}"><i class="fas fa-wrench"></i></a>
        <p class="card-title">${cardTitle}</p>
        <div class="divider"></div>
    `;

    Object.keys(data).forEach(fieldName => {
        updatedHTML += `
            <p class="card-content-title">${fieldName}:</p>
            <p class="card-content-value">${data[fieldName] || ''}</p>
            <div class="divider"></div>
        `;
    });

    card.innerHTML = updatedHTML;

    const configIcon = card.querySelector(`#${configIconId}`);
    if (configIcon) {
        const editFunction = getEditFunctionForCard(configIconId);
        if (editFunction) {
            configIcon.addEventListener('click', editFunction);
        }
    }
};

const updateContactDetailsDisplayOriginal = () => {
    const contactCard = document.querySelector('#contact-config')?.closest('.card');
    if (!contactCard) return;

    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) return;

    const emailValueElement = contactCard.querySelector('.card-content-value');
    if (emailValueElement) {
        emailValueElement.textContent = currentUser.email;
        emailValueElement.classList.remove('loading');
    }
};

const updateProfileDisplay = (profileData) => {
    const aboutCard = document.querySelector('#about-config')?.closest('.card');
    if (!aboutCard) return;

    const contentTitles = aboutCard.querySelectorAll('.card-content-title');
    const cardData = {};

    contentTitles.forEach(title => {
        const fieldName = title.textContent.replace(':', '');
        cardData[fieldName] = profileData[fieldName] || '';
    });

    updateCardDisplay(aboutCard, cardData, 'about-config');
};

const updateApprenticeshipDetailsDisplay = (profileData) => {
    const detailsCard = document.querySelector('#details-config')?.closest('.card');
    if (!detailsCard) return;

    const contentValues = detailsCard.querySelectorAll('.card-content-value');
    const titles = detailsCard.querySelectorAll('.card-content-title');

    titles.forEach((title, index) => {
        const fieldName = title.textContent.replace(':', '');
        const value = profileData[fieldName] || '';
        const valueElement = contentValues[index];
        if (valueElement) {
            valueElement.textContent = value;
            valueElement.classList.remove('loading');
        }
    });
};

const updateProfileInfoDisplay = (profileData) => {
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement && profileData.summary) {
        summaryElement.textContent = profileData.summary;
    }
};

// Date Formatting Utilities
const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }

    return '';
}

// Specific Edit Mode Functions
const enterEditMode = (card) => {
    const currentValues = extractCurrentValues(card);
    const contentTitles = card.querySelectorAll('.card-content-title');

    const fields = Array.from(contentTitles).map(title => ({
        name: title.textContent.replace(':', ''),
        label: title.textContent.replace(':', ''),
        type: 'text',
        value: currentValues[title.textContent.replace(':', '')]
    }));

    handleGenericEdit(card, fields, async (card) => {
        const updatedData = extractInputValues(card);
        await saveUserProfileData(updatedData);
        updateCardDisplay(card, updatedData, card.querySelector('a[id$="-config"]').id);
    }).then(_r => {});
};

const enterProfileInfoEditMode = () => {
    const summaryElement = document.querySelector('.user-summary');
    if (!summaryElement) return;

    const profileInfoCard = document.querySelector('.profile-info-card');
    const summaryParagraph = summaryElement.querySelector('p');
    const originalText = summaryParagraph.textContent;

    // Hide profile elements during edit
    const elementsToHide = [
        profileInfoCard.querySelector('.user-avatar'),
        profileInfoCard.querySelector('.user-name'),
        profileInfoCard.querySelector('#linkedin-update'),
        profileInfoCard.querySelector('#header-config')
    ];

    const fields = [{
        name: 'summary',
        type: 'text-with-counter',
        value: originalText === 'Summary' ? '' : originalText,
        placeholder: 'Enter a brief summary (40 chars max)',
        maxLength: 40
    }];

    const overlay = createOverlay();
    profileInfoCard.style.position = 'relative';
    profileInfoCard.style.zIndex = '1000';

    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });

    summaryElement.innerHTML = createEditForm(fields, '', '');

    // character counter functionality
    const input = summaryElement.querySelector('input[data-field="summary"]');
    const charCount = summaryElement.querySelector('#char-count');

    input.addEventListener('input', function() {
        charCount.textContent = input.value.length;
        charCount.style.color = input.value.length >= 35 ? '#ff6b6b' : '#666';
    });

    const cancelBtn = summaryElement.querySelector('.cancel-edit');
    const saveBtn = summaryElement.querySelector('.save-edit');

    const exitSummaryEdit = () => {
        summaryElement.innerHTML = `<p>${originalText}</p>`;
        elementsToHide.forEach(el => {
            if (el) el.style.display = '';
        });
        profileInfoCard.style.position = '';
        profileInfoCard.style.zIndex = '';
        removeOverlay(overlay);
        summaryElement.style.cursor = 'default';
    };

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        exitSummaryEdit();
    });

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setButtonLoading(saveBtn, true);
            const summaryText = input.value.trim();
            await saveUserProfileData({ summary: summaryText });

            const displayText = summaryText || 'Summary';
            summaryElement.innerHTML = `<p>${displayText}</p>`;

            elementsToHide.forEach(el => {
                if (el) el.style.display = '';
            });

            profileInfoCard.style.position = '';
            profileInfoCard.style.zIndex = '';
            removeOverlay(overlay);
            summaryElement.style.cursor = 'default';

        } catch (error) {
            setButtonLoading(saveBtn, false);
            alert('Failed to save summary. Please try again.');
            console.error('Error saving summary:', error);
        }
    });

    summaryElement.addEventListener('click', e => e.stopPropagation());
    overlay.addEventListener('click', exitSummaryEdit);

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
};

const enterApprenticeshipEditMode = (card) => {
    const currentValues = extractCurrentValues(card);

    const fields = [
        {
            name: 'Programme',
            label: 'Programme',
            type: 'select',
            value: currentValues['Programme'],
            options: [
                { value: '', label: 'Select Programme' },
                { value: 'Software Developer', label: 'Software Developer' },
                { value: 'IT Support Technician', label: 'IT Support Technician' },
                { value: 'Content Creator', label: 'Content Creator' }
            ]
        },
        {
            name: 'Referral',
            label: 'Referral',
            type: 'select',
            value: currentValues['Referral'],
            options: [
                { value: '', label: 'Select Referral Source' },
                { value: 'Through Employer', label: 'Through Employer' },
                { value: 'Through website', label: 'Through website' }
            ]
        },
        {
            name: 'Start Date',
            label: 'Start Date',
            type: 'text',
            value: currentValues['Start Date'],
            placeholder: 'Enter start date (e.g., 01/09/2024)'
        }
    ];

    handleGenericEdit(card, fields, async (card) => {
        const updatedData = extractInputValues(card);
        await saveUserProfileData(updatedData);
        updateCardDisplay(card, updatedData, 'details-config');
    }).then(_r => {});
};

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    const aboutConfigIcon = document.getElementById('about-config');
    const headerConfigIcon = document.getElementById('header-config');
    const detailsConfigIcon = document.getElementById('details-config');
    const contactConfigIcon = document.getElementById('contact-config');

    initializeSkeletonLoading();
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
            enterContactEditMode(contactCard);
        });
    }

    // Remove any hover styling from summary
    const summaryElement = document.querySelector('.user-summary');
    if (summaryElement) {
        summaryElement.style.cursor = 'default';
        summaryElement.classList.remove('hover-effect');
    }
});