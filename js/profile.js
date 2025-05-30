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
        let value = input.value;
        
        if (fieldName === 'Start Date' && value) {
            value = formatDateForDisplay(value);
        }
        
        values[fieldName] = value;
    });
    
    return values;
};

// Data Management
const loadUserProfileData = async () => {
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) return null;

    // Try backend first
    try {
        const response = await fetch(`${BACKEND_URL}/api/profile/${currentUser.id}`);
        if (response.ok) {
            return await response.json();
        } else {
            // Backend responded but with error status
            console.log('Stored in localStorage - 404 is due to fallback...');
        }
    } catch (error) {
        // Network or other error
        console.log('Stored in localStorage - Network or other error...');
    }

    // Fall back to localStorage
    const localData = localStorage.getItem(`profileData_${currentUser.id}`);
    return localData ? JSON.parse(localData) : {};
};

const saveUserProfileData = async (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem('balticUser'));
    if (!currentUser) {
        throw new Error('Please log in to save profile data');
    }

    // Get existing data and merge
    const existingData = await loadUserProfileData() || {};
    const mergedData = { ...existingData, ...updatedData };

    // Save to localStorage as backup
    localStorage.setItem(`profileData_${currentUser.id}`, JSON.stringify(mergedData));

    // Try to save to backend
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

// Skeleton Loading
const initializeSkeletonLoading = () => {
    // Add skeleton loading to summary
    const summaryElement = document.querySelector('.user-summary p');
    if (summaryElement) {
        summaryElement.classList.add('loading');
        summaryElement.textContent = '';
    }
    
    // Add skeleton loading to all card-content-value elements
    const contentValues = document.querySelectorAll('.card-content-value');
    contentValues.forEach(element => {
        element.classList.add('loading');
        element.textContent = '';
    });
};

const removeSkeletonLoading = () => {
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
    
    // Add character counter if needed
    const textWithCounterField = fields.find(f => f.type === 'text-with-counter');
    if (textWithCounterField) {
        const input = card.querySelector(`input[data-field="${textWithCounterField.name}"]`);
        const charCount = card.querySelector('#char-count');
        
        input.addEventListener('input', function() {
            charCount.textContent = input.value.length;
            charCount.style.color = input.value.length >= (textWithCounterField.maxLength - 5) ? '#ff6b6b' : '#666';
        });
        
        // Focus and position cursor at end
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
        // Re-attach default event listener
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
            return () => enterEditMode(document.querySelector('#contact-config').closest('.card'));
        case 'header-config':
            return () => enterProfileInfoEditMode();
        default:
            return null;
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
    
    // Re-attach event listener
    const configIcon = card.querySelector(`#${configIconId}`);
    if (configIcon) {
        const editFunction = getEditFunctionForCard(configIconId);
        if (editFunction) {
            configIcon.addEventListener('click', editFunction);
        }
    }
};

const updateContactDetailsDisplay = () => {
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
};

const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}/${month}/${year}`;
    }

    return dateString;
};

// Main Profile Functions
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
};

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
    
    // Hide elements
    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    summaryElement.innerHTML = createEditForm(fields, '', '');
    
    // Add character counter functionality
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
            type: 'date',
            value: currentValues['Start Date'],
            placeholder: 'Select start date'
        }
    ];
    
    handleGenericEdit(card, fields, async (card) => {
        const updatedData = extractInputValues(card);
        await saveUserProfileData(updatedData);

        // Create updated HTML specifically for apprenticeship details
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

        // Re-attach event listener
        const detailsConfigIcon = card.querySelector('#details-config');
        if (detailsConfigIcon) {
            detailsConfigIcon.addEventListener('click', function () {
                enterApprenticeshipEditMode(card);
            });
        }
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
