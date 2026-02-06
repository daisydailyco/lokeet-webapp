// LoopLocal Dashboard JavaScript
// Handles user saves management, map view, categories, and all dashboard functionality

// Configuration
const RADAR_API_KEY = 'prj_live_pk_8c9d4c6a85d8b9e0aacb1b2f6f7ec0ead4cb799a';

// Global state
let allSaves = [];
let filteredSaves = [];
let currentUser = null;
let map = null;
let mapInitialized = false;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let addAutocompleteInstance = null;
let editAutocompleteInstance = null;
let selectedAddAddress = null;
let selectedEditAddress = null;
let selectedCategories = []; // Changed to array for multiple selection
let savedCollections = []; // User's saved category collections

// DOM elements
const loadingDiv = document.getElementById('loading');
const dashboardDiv = document.getElementById('dashboard');
const userEmailSpan = document.getElementById('user-email');
const userUsernameSpan = document.getElementById('user-username');
const categoryHeaderSection = document.getElementById('category-header-section');
const categoryNameText = document.getElementById('category-name-text');
const categoryItemCount = document.getElementById('category-item-count');
const clearCategoryBtn = document.getElementById('clear-category-btn');
const shareBtn = document.getElementById('share-btn');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// My Saves tab elements
const savesGrid = document.getElementById('saves-grid');
const savesContainer = document.querySelector('.saves-container');
const emptyState = document.getElementById('empty-state');
const categoryFilter = document.getElementById('category-filter');
const categoryFilterBar = document.getElementById('category-filter-bar');

// Map elements
const mapDiv = document.getElementById('map');

// Categories elements
const categoriesGrid = document.getElementById('categories-grid');
const categoriesEmpty = document.getElementById('categories-empty');

// Modal elements
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const addForm = document.getElementById('add-form');
const editForm = document.getElementById('edit-form');
const addCategorySelect = document.getElementById('add-category');
const addCustomCategoryGroup = document.getElementById('add-custom-category-group');
const addCustomCategoryInput = document.getElementById('add-custom-category');
const addTimezoneSelect = document.getElementById('add-timezone');
const editCategorySelect = document.getElementById('edit-category');
const editTimezoneSelect = document.getElementById('edit-timezone');

// Buttons
const addSaveBtn = document.getElementById('add-save-btn');
const arrowIndicator = document.getElementById('arrow-indicator');
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');
const settingsUpdateBtn = document.getElementById('settings-update-btn');
const customizeProfileBtn = document.getElementById('customize-profile-btn');

// Profile modal elements
const profileModal = document.getElementById('profile-modal');
const profileForm = document.getElementById('profile-form');
const profileDisplayName = document.getElementById('profile-display-name');
const profileUsername = document.getElementById('profile-username');
const profileBirthday = document.getElementById('profile-birthday');
const usernameFeedback = document.getElementById('username-feedback');

// Account settings modal elements
const accountSettingsModal = document.getElementById('account-settings-modal');
const accountSettingsForm = document.getElementById('account-settings-form');
const settingsEmail = document.getElementById('settings-email');
const settingsNewPassword = document.getElementById('settings-new-password');
const settingsConfirmPassword = document.getElementById('settings-confirm-password');
const settingsConfirmPasswordGroup = document.getElementById('settings-confirm-password-group');
const deleteAccountBtn = document.getElementById('delete-account-btn');

// Username availability state
let usernameCheckTimeout = null;
let isUsernameAvailable = true;
let originalUsername = '';

// Custom Confirmation Dialog
function customConfirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-confirm-modal');
    const titleEl = document.getElementById('custom-confirm-title');
    const messageEl = document.getElementById('custom-confirm-message');
    const okBtn = document.getElementById('custom-confirm-ok');
    const cancelBtn = document.getElementById('custom-confirm-cancel');

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.style.display = 'block';

    const handleOk = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleBackdropClick);
    };

    const handleBackdropClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdropClick);
  });
}

// Custom Alert Dialog
function customAlert(message, title = 'Notice') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-alert-modal');
    const titleEl = document.getElementById('custom-alert-title');
    const messageEl = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.style.display = 'block';

    const handleOk = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      modal.removeEventListener('click', handleBackdropClick);
    };

    const handleBackdropClick = (e) => {
      if (e.target === modal) {
        handleOk();
      }
    };

    okBtn.addEventListener('click', handleOk);
    modal.addEventListener('click', handleBackdropClick);
  });
}

// Custom Delete Confirmation Dialog
function customDeleteConfirm() {
  return new Promise((resolve) => {
    const modal = document.getElementById('delete-confirm-modal');
    const input = document.getElementById('delete-confirm-input');
    const okBtn = document.getElementById('delete-confirm-ok');
    const cancelBtn = document.getElementById('delete-confirm-cancel');

    // Reset input
    input.value = '';
    okBtn.disabled = true;

    modal.style.display = 'block';

    // Enable/disable delete button based on input
    const handleInput = () => {
      if (input.value === 'DELETE') {
        okBtn.disabled = false;
      } else {
        okBtn.disabled = true;
      }
    };

    const handleOk = () => {
      if (input.value === 'DELETE') {
        cleanup();
        resolve(true);
      }
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      modal.style.display = 'none';
      input.value = '';
      okBtn.disabled = true;
      input.removeEventListener('input', handleInput);
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      modal.removeEventListener('click', handleBackdropClick);
    };

    const handleBackdropClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    input.addEventListener('input', handleInput);
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdropClick);

    // Focus input
    setTimeout(() => input.focus(), 100);
  });
}

// Initialize Radar SDK
function initializeRadar() {
  if (window.Radar) {
    try {
      Radar.initialize(RADAR_API_KEY);
      console.log('Radar SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Radar:', error);
    }
  }
}

// Geocode address using Radar API
async function geocodeAddress(address) {
  if (!window.Radar) {
    console.error('Radar SDK not loaded');
    return null;
  }

  try {
    console.log('Geocoding address:', address);
    const response = await Radar.geocode.forward({ query: address });

    if (response && response.addresses && response.addresses.length > 0) {
      const result = response.addresses[0];
      return {
        lat: result.latitude,
        lng: result.longitude,
        formattedAddress: result.formattedAddress,
        city: result.city,
        state: result.stateCode,
        postalCode: result.postalCode
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Typing animation for tagline
const typingWords = ['Community', 'Saves', 'Events', 'Calendar', 'Posts'];
let typingWordIndex = 0;
let typingCharIndex = 0;
let isDeleting = false;
let typingTimeout = null;

function typeWriter() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const currentWord = typingWords[typingWordIndex];

  if (isDeleting) {
    // Delete character
    typingElement.textContent = currentWord.substring(0, typingCharIndex - 1);
    typingCharIndex--;

    if (typingCharIndex === 0) {
      isDeleting = false;
      typingWordIndex = (typingWordIndex + 1) % typingWords.length;
      typingTimeout = setTimeout(typeWriter, 500); // Pause before typing next word
    } else {
      typingTimeout = setTimeout(typeWriter, 50); // Delete speed
    }
  } else {
    // Type character
    typingElement.textContent = currentWord.substring(0, typingCharIndex + 1);
    typingCharIndex++;

    if (typingCharIndex === currentWord.length) {
      isDeleting = true;
      typingTimeout = setTimeout(typeWriter, 2000); // Pause before deleting
    } else {
      typingTimeout = setTimeout(typeWriter, 100); // Type speed
    }
  }
}

// Timezone management functions
function getDefaultTimezone() {
  // Try to get from localStorage
  const saved = localStorage.getItem('lokeet_default_timezone');
  if (saved) return saved;

  // Otherwise detect from browser
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'America/New_York'; // Fallback to Eastern
  }
}

function setDefaultTimezone(timezone) {
  localStorage.setItem('lokeet_default_timezone', timezone);
}

// Get timezone abbreviation from timezone identifier
function getTimezoneAbbr(timezone) {
  if (!timezone) return '';

  const timezoneMap = {
    'Pacific/Midway': 'SST',
    'Pacific/Honolulu': 'HST',
    'America/Anchorage': 'AKST',
    'America/Los_Angeles': 'PST',
    'America/Denver': 'MST',
    'America/Phoenix': 'MST',
    'America/Chicago': 'CST',
    'America/New_York': 'EST',
    'America/Caracas': 'VET',
    'America/Halifax': 'AST',
    'America/St_Johns': 'NST',
    'America/Argentina/Buenos_Aires': 'ART',
    'America/Sao_Paulo': 'BRT',
    'Atlantic/Azores': 'AZOT',
    'Atlantic/Cape_Verde': 'CVT',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Europe/Athens': 'EET',
    'Africa/Cairo': 'EET',
    'Africa/Johannesburg': 'SAST',
    'Europe/Moscow': 'MSK',
    'Asia/Dubai': 'GST',
    'Asia/Karachi': 'PKT',
    'Asia/Kolkata': 'IST',
    'Asia/Dhaka': 'BST',
    'Asia/Bangkok': 'ICT',
    'Asia/Singapore': 'SGT',
    'Asia/Hong_Kong': 'HKT',
    'Asia/Shanghai': 'CST',
    'Asia/Tokyo': 'JST',
    'Asia/Seoul': 'KST',
    'Australia/Sydney': 'AEDT',
    'Australia/Adelaide': 'ACDT',
    'Pacific/Auckland': 'NZDT',
    'Pacific/Fiji': 'FJT'
  };

  return timezoneMap[timezone] || '';
}

// Initialize dashboard
async function init() {
  try {
    // Initialize Radar SDK
    initializeRadar();

    // Verify authentication
    const verification = await verifySession();

    if (!verification.valid) {
      // Not logged in, redirect to login page
      window.location.href = '/login.html';
      return;
    }

    currentUser = verification.user;

    // Fetch user profile (display name, username, etc.)
    await fetchUserProfile();

    // Update display name in settings dropdown
    updateUserDisplayName();

    // Fetch user's saves
    await fetchSaves();

    // Show dashboard
    loadingDiv.style.display = 'none';
    dashboardDiv.style.display = 'block';

    // Initialize event listeners
    initEventListeners();

    // Start typing animation
    typeWriter();

    // Render initial view
    renderSaves();

    // Update collections dropdown
    updateCollectionsDropdown();

  } catch (error) {
    console.error('Dashboard initialization error:', error);
    await customAlert('Failed to load dashboard. Please try logging in again.');
    window.location.href = '/login.html';
  }
}

// Fetch user profile from backend
async function fetchUserProfile() {
  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(`${API_BASE}/v1/user/profile`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.profile) {
        // Merge profile data into currentUser
        currentUser = {
          ...currentUser,
          ...data.profile
        };

        // Load saved collections
        if (data.profile.collections && Array.isArray(data.profile.collections)) {
          savedCollections = data.profile.collections;
          console.log('[PROFILE] Loaded', savedCollections.length, 'saved collections');
        }

        console.log('[PROFILE] Loaded user profile');
      }
    } else {
      console.log('[PROFILE] No profile data found (this is okay for new users)');
    }
  } catch (error) {
    console.error('[PROFILE] Error fetching profile:', error);
    // Non-critical error, don't block dashboard loading
  }
}

// Fetch saves from backend
async function fetchSaves() {
  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(`${API_BASE}/v1/user/saves`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saves');
    }

    const data = await response.json();
    allSaves = data.saves || [];
    filteredSaves = [...allSaves];

    console.log('Fetched saves:', allSaves.length);
  } catch (error) {
    console.error('Error fetching saves:', error);
    allSaves = [];
    filteredSaves = [];
  }
}

// Populate category dropdown
function populateCategoryDropdown() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  categoryDropdown.innerHTML = '';

  categories.forEach(category => {
    const item = document.createElement('div');
    item.className = 'category-dropdown-item';
    if (selectedCategories.includes(category)) {
      item.classList.add('active');
    }
    item.textContent = category;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      setCategory(category);
      categoryDropdown.classList.remove('show');
    });
    categoryDropdown.appendChild(item);
  });
}

// Set category filter (now supports multiple categories)
function setCategory(category) {
  // If single category passed, set it as the only selected
  if (typeof category === 'string') {
    selectedCategories = [category];
  } else if (Array.isArray(category)) {
    selectedCategories = category;
  }

  updateCategoryHeader();
  applyFilters();
  updateCategoryCheckboxes();
}

// Update category header display
function updateCategoryHeader() {
  if (selectedCategories.length === 0) {
    categoryHeaderSection.style.display = 'none';
    return;
  }

  // Show header
  categoryHeaderSection.style.display = 'block';

  // Update title
  if (selectedCategories.length === 1) {
    categoryNameText.textContent = selectedCategories[0];
    clearCategoryBtn.textContent = '×';
    clearCategoryBtn.title = 'Clear filter';
  } else {
    categoryNameText.textContent = `${selectedCategories.length} Categories Selected`;
    clearCategoryBtn.textContent = '↗';
    clearCategoryBtn.title = 'Edit collection';
  }

  // Count items in selected categories
  const itemCount = allSaves.filter(save =>
    save.category && selectedCategories.includes(save.category)
  ).length;
  categoryItemCount.textContent = `${itemCount} Save${itemCount !== 1 ? 's' : ''}`;
}

// Clear category filter
function clearCategory() {
  selectedCategories = [];
  categoryHeaderSection.style.display = 'none';
  applyFilters();
  updateCategoryCheckboxes();
}

// Edit Categories Modal
const editCategoriesModal = document.getElementById('edit-categories-modal');
const editCategoriesBtn = document.getElementById('edit-categories-btn');
const saveCategoriesBtn = document.getElementById('save-categories-btn');
const categoriesList = document.getElementById('categories-list');

let categoryChanges = new Map(); // Map of original name -> new name
let categoriesToDelete = new Set(); // Set of categories to delete

// Open edit categories modal
async function openEditCategoriesModal() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  if (categories.size === 0) {
    await customAlert('No categories to edit.');
    return;
  }

  // Reset tracking
  categoryChanges.clear();
  categoriesToDelete.clear();

  // Populate modal with category inputs
  categoriesList.innerHTML = '';
  Array.from(categories).sort().forEach(category => {
    const row = document.createElement('div');
    row.className = 'category-edit-row';
    row.dataset.originalName = category;

    row.innerHTML = `
      <input type="text" class="category-edit-input" value="${category}" data-original="${category}">
      <button class="category-delete-btn" title="Delete category">×</button>
    `;

    // Track input changes
    const input = row.querySelector('.category-edit-input');
    input.addEventListener('input', () => {
      const original = input.dataset.original;
      const newValue = input.value.trim();
      if (newValue && newValue !== original) {
        categoryChanges.set(original, newValue);
      } else {
        categoryChanges.delete(original);
      }
    });

    // Delete button
    const deleteBtn = row.querySelector('.category-delete-btn');
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await customConfirm(`Delete category "${category}"? This will remove the category from all saves.`, 'Delete Category');
      if (confirmed) {
        categoriesToDelete.add(category);
        row.remove();
      }
    });

    categoriesList.appendChild(row);
  });

  editCategoriesModal.style.display = 'flex';
}

// Close edit categories modal
function closeEditCategoriesModal() {
  editCategoriesModal.style.display = 'none';
  categoryChanges.clear();
  categoriesToDelete.clear();
}

// Save category changes
async function saveCategoryChanges() {
  if (categoryChanges.size === 0 && categoriesToDelete.size === 0) {
    closeEditCategoriesModal();
    return;
  }

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    saveCategoriesBtn.disabled = true;
    saveCategoriesBtn.textContent = 'Saving...';

    // Collect all update promises
    const updatePromises = [];

    // Handle deletions
    for (const categoryToDelete of categoriesToDelete) {
      const savesToUpdate = allSaves.filter(save => save.category === categoryToDelete);
      for (const save of savesToUpdate) {
        updatePromises.push(
          fetch(`${API_BASE}/v1/user/saves/${save.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              category: null
            })
          }).then(response => {
            if (!response.ok) throw new Error(`Failed to update save ${save.id}`);
            return response;
          })
        );
      }
    }

    // Handle renames
    for (const [oldName, newName] of categoryChanges) {
      if (categoriesToDelete.has(oldName)) continue; // Skip if deleted

      const savesToUpdate = allSaves.filter(save => save.category === oldName);
      for (const save of savesToUpdate) {
        updatePromises.push(
          fetch(`${API_BASE}/v1/user/saves/${save.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              category: newName
            })
          }).then(response => {
            if (!response.ok) throw new Error(`Failed to update save ${save.id}`);
            return response;
          })
        );
      }
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Refresh saves
    await fetchSaves();

    // Update selection if needed
    if (selectedCategory) {
      if (categoriesToDelete.has(selectedCategory)) {
        clearCategory();
      } else if (categoryChanges.has(selectedCategory)) {
        setCategory(categoryChanges.get(selectedCategory));
      } else {
        renderSaves();
      }
    } else {
      renderSaves();
    }

    closeEditCategoriesModal();
    await customAlert('Categories updated successfully!', 'Success');

  } catch (error) {
    console.error('Error updating categories:', error);
    await customAlert('Failed to update categories. Please try again.', 'Error');
  } finally {
    saveCategoriesBtn.disabled = false;
    saveCategoriesBtn.textContent = 'Done';
  }
}

// Initialize event listeners
function initEventListeners() {
  // Settings dropdown toggle
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
      settingsDropdown.classList.remove('show');
    }
  });

  // Update button in settings dropdown
  settingsUpdateBtn.addEventListener('click', handleUpdate);

  // Logout button
  logoutBtn.addEventListener('click', handleLogout);

  // Add save button
  addSaveBtn.addEventListener('click', openAddModal);

  // Clear/Edit category button
  clearCategoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    // If multiple categories, open collection modal
    if (selectedCategories.length > 1) {
      openCollectionModal();
    } else {
      // Single category, just clear it
      clearCategory();
    }
  });

  // Share button
  shareBtn.addEventListener('click', handleShare);

  // Confirm share button in modal
  const confirmShareBtn = document.getElementById('confirm-share-btn');
  if (confirmShareBtn) {
    confirmShareBtn.addEventListener('click', confirmShare);
  }

  // Save collection button in modal
  const saveCollectionBtn = document.getElementById('save-collection-btn');
  if (saveCollectionBtn) {
    saveCollectionBtn.addEventListener('click', saveCollection);
  }

  // Share name input - submit on Enter key (defaults to share)
  const shareNameInput = document.getElementById('share-name-input');
  if (shareNameInput) {
    shareNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmShare();
      }
    });
  }

  // Edit categories button
  editCategoriesBtn.addEventListener('click', openEditCategoriesModal);

  // Save categories button
  saveCategoriesBtn.addEventListener('click', saveCategoryChanges);

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Filters
  // Category filter toggle
  const categoryFilterToggle = document.getElementById('category-filter-toggle');
  const categoryFilterDropdown = document.getElementById('category-filter-dropdown');

  if (categoryFilterToggle) {
    categoryFilterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = categoryFilterDropdown.style.display === 'block';
      categoryFilterDropdown.style.display = isVisible ? 'none' : 'block';
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (categoryFilterToggle && categoryFilterDropdown &&
        !categoryFilterToggle.contains(e.target) &&
        !categoryFilterDropdown.contains(e.target)) {
      categoryFilterDropdown.style.display = 'none';
    }
  });

  // Handle new category input
  const newCategoryInput = document.getElementById('new-category-input');
  if (newCategoryInput) {
    newCategoryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newCategory = newCategoryInput.value.trim();
        if (newCategory) {
          // Check if category already exists
          const existingCategories = new Set();
          allSaves.forEach(save => {
            if (save.category) {
              existingCategories.add(save.category.toLowerCase());
            }
          });

          if (existingCategories.has(newCategory.toLowerCase())) {
            customAlert('This category already exists!');
            return;
          }

          // Add to selected categories
          if (!selectedCategories.includes(newCategory)) {
            selectedCategories.push(newCategory);
          }

          // Clear input
          newCategoryInput.value = '';

          // Update UI
          updateCategoryCheckboxes();
          updateCategoryFilterLabel();
          updateCategoryHeader();
          applyFilters();
        }
      }
    });
  }

  // Add category dropdown change handler
  addCategorySelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === '__create_new__') {
      // Show custom category input
      addCustomCategoryGroup.style.display = 'block';
      addCustomCategoryInput.required = true;
      addCustomCategoryInput.focus();
    } else {
      // Hide custom category input
      addCustomCategoryGroup.style.display = 'none';
      addCustomCategoryInput.value = '';
      addCustomCategoryInput.required = false;
    }
  });

  // Add form submission
  addForm.addEventListener('submit', handleAddSave);

  // Edit form submission
  editForm.addEventListener('submit', handleEditSave);

  // Profile modal handlers
  customizeProfileBtn.addEventListener('click', openProfileModal);
  profileForm.addEventListener('submit', handleSaveProfile);

  // Account settings modal handlers
  accountSettingsForm.addEventListener('submit', handleSaveAccountSettings);
  deleteAccountBtn.addEventListener('click', handleDeleteAccount);

  // Show/hide confirm password when new password is entered (in settings modal)
  settingsNewPassword.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      settingsConfirmPasswordGroup.style.display = 'block';
      settingsConfirmPassword.required = true;
    } else {
      settingsConfirmPasswordGroup.style.display = 'none';
      settingsConfirmPassword.required = false;
      settingsConfirmPassword.value = '';
    }
  });

  // Username availability checking
  profileUsername.addEventListener('input', (e) => {
    const username = e.target.value.trim();

    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Clear feedback if empty
    if (!username) {
      usernameFeedback.textContent = '';
      usernameFeedback.style.color = '';
      isUsernameAvailable = true;
      return;
    }

    // If username hasn't changed from original, skip check
    if (username === originalUsername) {
      usernameFeedback.textContent = 'This is your current username';
      usernameFeedback.style.color = '#666';
      isUsernameAvailable = true;
      return;
    }

    // Show checking message
    usernameFeedback.textContent = 'Checking availability...';
    usernameFeedback.style.color = '#666';

    // Debounce: check after 500ms of no typing
    usernameCheckTimeout = setTimeout(async () => {
      await checkUsernameAvailability(username);
    }, 500);
  });
}

// Handle update to newest version
async function handleUpdate() {
  settingsUpdateBtn.disabled = true;
  settingsUpdateBtn.textContent = 'Updating...';

  try {
    // Check if there's a new service worker available
    if (window.newServiceWorker) {
      // Tell the new service worker to skip waiting and take over
      window.newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: clear cache and reload
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      window.location.reload(true);
    }
  } catch (error) {
    console.error('Update error:', error);
    window.location.reload(true);
  }
}

// Handle logout
async function handleLogout() {
  logoutBtn.disabled = true;
  logoutBtn.textContent = 'Logging out...';

  settingsDropdown.classList.remove('show');
  await logout();
  window.location.href = '/';
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update tab content
  tabContents.forEach(content => {
    content.classList.remove('active');
  });

  if (tabName === 'saves') {
    document.getElementById('saves-tab').classList.add('active');
  } else if (tabName === 'map') {
    document.getElementById('map-tab').classList.add('active');
    initMap();
  } else if (tabName === 'calendar') {
    document.getElementById('calendar-tab').classList.add('active');
    renderCalendar();
  } else if (tabName === 'categories') {
    document.getElementById('categories-tab').classList.add('active');
    renderCategories();
  }
}

// Render saves cards
function renderSaves() {
  savesGrid.innerHTML = '';

  // Toggle arrow indicator based on whether there are any saves
  if (allSaves.length === 0) {
    arrowIndicator.classList.add('show');
  } else {
    arrowIndicator.classList.remove('show');
  }

  if (filteredSaves.length === 0) {
    savesContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  savesContainer.style.display = 'block';
  emptyState.style.display = 'none';

  // Update category filter options
  updateCategoryFilter();

  // Sort by date and time (earliest first)
  const sortedSaves = [...filteredSaves].sort((a, b) => {
    // Items with dates come before items without dates
    if (!a.event_date && b.event_date) return 1;
    if (a.event_date && !b.event_date) return -1;
    if (!a.event_date && !b.event_date) return 0;

    // Compare dates
    const dateCompare = a.event_date.localeCompare(b.event_date);
    if (dateCompare !== 0) return dateCompare;

    // If same date, compare times
    const timeA = a.start_time || '23:59';
    const timeB = b.start_time || '23:59';
    return timeA.localeCompare(timeB);
  });

  sortedSaves.forEach(save => {
    const card = createSaveCard(save);
    savesGrid.appendChild(card);
  });
}

// Create save card element
function createSaveCard(save) {
  const card = document.createElement('div');
  card.className = 'save-card';

  // Format date and time
  let dateStr = '';
  if (save.event_date) {
    // Fix timezone issue by appending time to force local interpretation
    const date = new Date(save.event_date + 'T00:00:00');
    dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Add time if available
    if (save.start_time) {
      // Format time from 24hr to 12hr
      const [hours, minutes] = save.start_time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let timeStr = `${displayHour}:${minutes} ${ampm}`;

      // Add end time if available
      if (save.end_time) {
        const [endHours, endMinutes] = save.end_time.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour % 12 || 12;
        timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
      }

      // Add timezone abbreviation if available
      const tzAbbr = getTimezoneAbbr(save.timezone);
      if (tzAbbr) {
        timeStr += ` ${tzAbbr}`;
      }

      dateStr += ` • ${timeStr}`;
    }
  }

  // Tags HTML
  const tagsHTML = (save.tags || []).map(tag =>
    `<span class="tag">${tag}</span>`
  ).join('');

  card.innerHTML = `
    <div class="card-edit-icon" data-save-id="${save.id}">↗</div>
    <div class="card-title">${save.event_name || save.venue_name || 'Untitled'}</div>
    ${save.category ? `<div class="card-category" data-category="${save.category}">${save.category}</div>` : ''}
    ${save.address ? `<div class="card-address">📍 ${save.address}</div>` : ''}
    ${dateStr ? `<div class="card-date">📅 ${dateStr}</div>` : ''}
    ${save.tags && save.tags.length > 0 ? `<div class="card-tags">${tagsHTML}</div>` : ''}
    ${save.url ? `<div class="card-link-preview">
      <a href="${save.url}" target="_blank" class="card-link-text" style="font-size: 14px; color: #666; text-decoration: underline; cursor: pointer;">View Post 🔗 Open in New Tab</a>
    </div>` : ''}
  `;

  // Edit icon click handler - show preview modal first
  const editIcon = card.querySelector('.card-edit-icon');
  editIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    showSaveDetails(save.id);
  });

  // Category click handler
  const categoryEl = card.querySelector('.card-category');
  if (categoryEl) {
    categoryEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = e.target.dataset.category;
      setCategory(category);
    });
  }

  return card;
}

// Update category filter with checkboxes
function updateCategoryFilter() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  // Show/hide filter bar based on whether there are any saves
  if (allSaves.length === 0) {
    categoryFilterBar.style.display = 'none';
  } else {
    categoryFilterBar.style.display = 'flex';
  }

  updateCategoryCheckboxes();
  updateCategoryFilterLabel();
}

// Update category checkboxes
function updateCategoryCheckboxes() {
  const categoryCheckboxes = document.getElementById('category-checkboxes');
  if (!categoryCheckboxes) return;

  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  // Clear existing checkboxes
  categoryCheckboxes.innerHTML = '';

  if (categories.size === 0) {
    categoryCheckboxes.innerHTML = '<div style="padding: 8px; color: #666; font-size: 13px;">No categories yet</div>';
    return;
  }

  // Create checkbox for each category
  categories.forEach(category => {
    const label = document.createElement('label');
    label.style.cssText = 'display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s; font-size: 14px;';
    label.onmouseover = () => label.style.background = '#f0f0f0';
    label.onmouseout = () => label.style.background = 'transparent';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = category;
    checkbox.checked = selectedCategories.includes(category);
    checkbox.style.cssText = 'margin-right: 8px; cursor: pointer;';
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedCategories.includes(category)) {
          selectedCategories.push(category);
        }
      } else {
        selectedCategories = selectedCategories.filter(c => c !== category);
      }
      updateCategoryFilterLabel();
      updateCategoryHeader();
      applyFilters();
    });

    const span = document.createElement('span');
    span.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    label.appendChild(checkbox);
    label.appendChild(span);
    categoryCheckboxes.appendChild(label);
  });
}

// Update category filter label
function updateCategoryFilterLabel() {
  const label = document.getElementById('category-filter-label');
  if (!label) return;

  if (selectedCategories.length === 0) {
    label.textContent = 'Sort by Category';
  } else if (selectedCategories.length === 1) {
    label.textContent = selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1);
  } else {
    label.textContent = `${selectedCategories.length} Selected`;
  }
}

// Populate add modal category dropdown
function populateAddCategoryDropdown() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  // Build dropdown options
  addCategorySelect.innerHTML = '<option value="">Select a category...</option>';

  // Add existing categories
  Array.from(categories).sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    addCategorySelect.appendChild(option);
  });

  // Add separator if there are categories
  if (categories.size > 0) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    addCategorySelect.appendChild(separator);
  }

  // Add "Other (Create New)" option at bottom
  const otherOption = document.createElement('option');
  otherOption.value = '__create_new__';
  otherOption.textContent = 'Other (Create New)';
  addCategorySelect.appendChild(otherOption);

  // Return whether categories exist
  return categories.size > 0;
}

// Populate edit modal category dropdown
function populateEditCategoryDropdown() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  // Build dropdown options
  editCategorySelect.innerHTML = '<option value="">Select category</option>';

  // Add existing categories
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    editCategorySelect.appendChild(option);
  });

  // Add separator
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '──────────';
  editCategorySelect.appendChild(separator);

  // Add "Other (Enter New)" option at bottom
  const otherOption = document.createElement('option');
  otherOption.value = '__other_new__';
  otherOption.textContent = 'Other (Enter New)';
  editCategorySelect.appendChild(otherOption);
}

// Apply filters
function applyFilters() {
  // Filter by selected categories
  filteredSaves = allSaves.filter(save => {
    // If no categories selected, show all
    if (selectedCategories.length === 0) {
      return true;
    }
    // Otherwise, check if save's category is in selected categories
    return save.category && selectedCategories.includes(save.category);
  });

  // Sort by newest first (default)
  filteredSaves.sort((a, b) => {
    return new Date(b.saved_at) - new Date(a.saved_at);
  });

  // Render appropriate view based on active tab
  const activeSavesTab = document.getElementById('saves-tab');
  const activeMapTab = document.getElementById('map-tab');
  const activeCalendarTab = document.getElementById('calendar-tab');

  if (activeSavesTab.classList.contains('active')) {
    renderSaves();
  }
  if (activeMapTab.classList.contains('active')) {
    initMap();
  }
  if (activeCalendarTab.classList.contains('active')) {
    renderCalendar();
  }
}

// Handle share button - Show naming modal
async function handleShare() {
  if (selectedCategories.length === 0) return;

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    // Get saves for the selected categories (use filteredSaves which is already filtered)
    const categorySaves = filteredSaves;

    if (categorySaves.length === 0) {
      await customAlert('No saves in selected categories to share');
      return;
    }

    // Show share name modal
    const modal = document.getElementById('share-name-modal');
    const input = document.getElementById('share-name-input');
    const preview = document.getElementById('share-categories-preview');

    // Pre-fill with combined category names
    const defaultName = selectedCategories.length === 1
      ? selectedCategories[0]
      : selectedCategories.join(' + ');

    input.value = defaultName;
    preview.textContent = `Sharing ${categorySaves.length} item${categorySaves.length !== 1 ? 's' : ''} from: ${selectedCategories.join(', ')}`;

    modal.classList.add('active');
    input.focus();
    input.select();

    // Store items for when user confirms
    window.pendingShareItems = categorySaves;

  } catch (error) {
    console.error('Share error:', error);
    await customAlert(`Failed to prepare share: ${error.message}`, 'Error');
  }
}

// Open collection modal for editing/saving
function openCollectionModal() {
  const modal = document.getElementById('share-name-modal');
  const input = document.getElementById('share-name-input');
  const preview = document.getElementById('share-categories-preview');

  // Get saves for the selected categories
  const categorySaves = filteredSaves;

  if (categorySaves.length === 0) {
    customAlert('No saves in selected categories');
    return;
  }

  // Pre-fill with combined category names
  const defaultName = selectedCategories.join(' + ');

  input.value = defaultName;
  preview.textContent = `${categorySaves.length} item${categorySaves.length !== 1 ? 's' : ''} from: ${selectedCategories.join(', ')}`;

  modal.classList.add('active');
  input.focus();
  input.select();

  // Store items for when user confirms
  window.pendingShareItems = categorySaves;
}

// Close share name modal
function closeShareNameModal() {
  const modal = document.getElementById('share-name-modal');
  modal.classList.remove('active');
  window.pendingShareItems = null;
}

// Save collection (without sharing)
async function saveCollection() {
  const input = document.getElementById('share-name-input');
  const customName = input.value.trim();

  if (!customName) {
    await customAlert('Please enter a name for your collection');
    return;
  }

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    // Create new collection
    const newCollection = {
      id: Date.now().toString(),
      name: customName,
      categories: [...selectedCategories],
      itemCount: filteredSaves.length,
      createdAt: new Date().toISOString()
    };

    // Add to saved collections
    savedCollections.push(newCollection);

    // Save to backend profile - must include all profile fields
    const payload = {
      display_name: currentUser.display_name || null,
      username: currentUser.username || null,
      zip_code: currentUser.zip_code || null,
      birthday: currentUser.birthday || null,
      email: currentUser.email,
      collections: savedCollections
    };

    const response = await fetch(`${API_BASE}/v1/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Failed to save collection to profile');
    }

    // Update collections dropdown
    updateCollectionsDropdown();

    // Close modal
    closeShareNameModal();

    // Show success message
    await customAlert(`Collection "${customName}" saved!`);

  } catch (error) {
    console.error('Save collection error:', error);
    await customAlert(`Failed to save collection: ${error.message}`, 'Error');
  }
}

// Confirm share with custom name
async function confirmShare() {
  const input = document.getElementById('share-name-input');
  const customName = input.value.trim();

  if (!customName) {
    await customAlert('Please enter a name for your collection');
    return;
  }

  if (!window.pendingShareItems) {
    await customAlert('No items to share');
    closeShareNameModal();
    return;
  }

  const categorySaves = window.pendingShareItems;

  // Close modal
  closeShareNameModal();

  try {
    // Show loading state
    const originalHTML = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span>⏳</span><span>Sharing...</span>';
    shareBtn.disabled = true;

    // Format items to match backend SavedItem model
    const formattedItems = categorySaves.map(save => ({
      id: save.id,
      user_id: currentUser?.id || save.user_id,
      platform: save.platform || 'instagram',
      url: save.url || '',
      content: save.content || '',
      images: save.images || [],
      author: save.author || 'unknown',
      event_name: save.event_name || null,
      venue_name: save.venue_name || null,
      address: save.address || null,
      latitude: save.coordinates?.lat || null,
      longitude: save.coordinates?.lng || null,
      coordinates: save.coordinates || null,
      city: save.city || null,
      state: save.state || null,
      event_date: save.event_date || null,
      start_time: save.start_time || null,
      end_time: save.end_time || null,
      event_type: save.event_type || save.category || null,
      tags: save.tags || [],
      category: save.category || null,
      ai_processed: save.ai_processed || false,
      confidence_score: save.confidence_score || 0.0,
      saved_at: save.saved_at || new Date().toISOString()
    }));

    // Use custom name from input
    const categoryName = customName;

    console.log('Sharing categories:', selectedCategories);
    console.log('Items to share:', formattedItems.length);

    // Create a share link by calling backend API
    const response = await fetch(`${API_BASE}/v1/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: categoryName,
        items: formattedItems
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Failed to create share link: ${response.status}`);
    }

    const data = await response.json();

    if (data.share_url) {
      // Open in new tab
      window.open(data.share_url, '_blank');

      // Also copy to clipboard
      await navigator.clipboard.writeText(data.share_url);

      // Show success message
      shareBtn.innerHTML = '<span>✓</span><span>Opened!</span>';
      setTimeout(() => {
        shareBtn.innerHTML = originalHTML;
        shareBtn.disabled = false;
      }, 2000);
    }

  } catch (error) {
    console.error('Share error:', error);
    await customAlert(`Failed to create share link: ${error.message}`, 'Error');

    // Reset button
    shareBtn.innerHTML = '<span>🔗</span><span>Share</span>';
    shareBtn.disabled = false;
  }
}

// Initialize map
function initMap() {
  // Always reinitialize to reflect current filters
  if (map) {
    map.remove();
    map = null;
  }
  mapInitialized = false;

  const mapContainer = document.querySelector('.map-container');
  const mapEmpty = document.getElementById('map-empty');

  // Get saves with coordinates from filtered saves
  const savesWithCoords = filteredSaves.filter(save =>
    save.coordinates && save.coordinates.lat && save.coordinates.lng
  );

  if (savesWithCoords.length === 0) {
    // Hide map container, show empty state
    mapContainer.style.display = 'none';
    mapEmpty.style.display = 'block';
    return;
  }

  // Show map container, hide empty state
  mapContainer.style.display = 'block';
  mapEmpty.style.display = 'none';

  // Calculate center from all coordinates
  const avgLat = savesWithCoords.reduce((sum, save) => sum + save.coordinates.lat, 0) / savesWithCoords.length;
  const avgLng = savesWithCoords.reduce((sum, save) => sum + save.coordinates.lng, 0) / savesWithCoords.length;

  // Initialize map with Radar tiles
  map = new maplibregl.Map({
    container: 'map',
    style: `https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${RADAR_API_KEY}`,
    center: [avgLng, avgLat],
    zoom: 12
  });

  // Add navigation controls
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Add markers
  savesWithCoords.forEach((save, index) => {
    // Create custom marker
    const el = document.createElement('div');
    el.style.cssText = `
      background: #000;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    el.textContent = index + 1;

    // Create popup
    const postLinkHTML = save.url ? `
      <br>
      <a href="${save.url}"
         target="_blank"
         style="color: #000; font-weight: 600;">
        View Post 🔗 Open in New Tab →
      </a>
    ` : '';

    const googleMapsQuery = save.address
      ? encodeURIComponent(save.address)
      : `${save.coordinates.lat},${save.coordinates.lng}`;

    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 8px;">
        <strong>${save.event_name || save.venue_name || 'Location'}</strong><br>
        ${save.address || ''}
        <br><br>
        <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}"
           target="_blank"
           style="color: #000; font-weight: 600;">
          Open in Google Maps →
        </a>
        ${postLinkHTML}
      </div>
    `);

    // Add marker to map
    new maplibregl.Marker(el)
      .setLngLat([save.coordinates.lng, save.coordinates.lat])
      .setPopup(popup)
      .addTo(map);
  });

  // Fit bounds to show all markers
  if (savesWithCoords.length > 1) {
    const bounds = new maplibregl.LngLatBounds();
    savesWithCoords.forEach(save => {
      bounds.extend([save.coordinates.lng, save.coordinates.lat]);
    });
    map.fitBounds(bounds, { padding: 50 });
  }

  mapInitialized = true;
}

// Render categories
function renderCategories() {
  categoriesGrid.innerHTML = '';

  // Group saves by category
  const categoryGroups = {};
  allSaves.forEach(save => {
    const category = save.category || 'uncategorized';
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(save);
  });

  const categories = Object.keys(categoryGroups);

  if (categories.length === 0) {
    categoriesGrid.style.display = 'none';
    categoriesEmpty.style.display = 'block';
    return;
  }

  categoriesGrid.style.display = 'grid';
  categoriesEmpty.style.display = 'none';

  // Category icons
  const categoryIcons = {
    restaurant: '🍽️',
    bar: '🍺',
    event: '🎉',
    activity: '🎯',
    venue: '🏛️',
    other: '📌',
    uncategorized: '📁'
  };

  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';

    const icon = categoryIcons[category] || '📌';
    const count = categoryGroups[category].length;
    const displayName = category.charAt(0).toUpperCase() + category.slice(1);

    card.innerHTML = `
      <div class="category-icon">${icon}</div>
      <div class="category-name">${displayName}</div>
      <div class="category-count">${count} ${count === 1 ? 'save' : 'saves'}</div>
    `;

    card.addEventListener('click', () => {
      // Switch to My Saves tab and filter by this category
      switchTab('saves');
      categoryFilter.value = category === 'uncategorized' ? '' : category;
      applyFilters();
    });

    categoriesGrid.appendChild(card);
  });
}

// Render calendar
function renderCalendar() {
  const calendarView = document.getElementById('calendar-view');
  const calendarEmpty = document.getElementById('calendar-empty');

  // Get saves with dates from filtered saves
  const savesWithDates = filteredSaves.filter(save => save.event_date);

  if (savesWithDates.length === 0) {
    calendarView.style.display = 'none';
    calendarEmpty.style.display = 'block';
    return;
  }

  calendarView.style.display = 'block';
  calendarEmpty.style.display = 'none';

  // Create calendar header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Group saves by date
  const savesByDate = {};
  savesWithDates.forEach(save => {
    const dateKey = save.event_date.split('T')[0]; // Get YYYY-MM-DD
    if (!savesByDate[dateKey]) {
      savesByDate[dateKey] = [];
    }
    savesByDate[dateKey].push(save);
  });

  // Count unique dates
  const uniqueDates = Object.keys(savesByDate);
  const isWeekView = selectedCategories.length > 0 && uniqueDates.length > 0 && uniqueDates.length <= 7;

  if (isWeekView) {
    // Week view: show the week containing the events
    const eventDates = uniqueDates.map(d => new Date(d + 'T00:00:00')).sort((a, b) => a - b);
    const earliestDate = eventDates[0];

    // Find the Sunday of the week containing the earliest event
    const weekStart = new Date(earliestDate);
    weekStart.setDate(earliestDate.getDate() - earliestDate.getDay()); // Go back to Sunday

    let calendarHTML = `
      <div class="calendar-header">
        <button onclick="changeMonth(-1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">‹ Prev</button>
        <h2 style="margin: 0; font-size: 20px;">Week of ${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}, ${weekStart.getFullYear()}</h2>
        <button onclick="changeMonth(1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Next ›</button>
      </div>

      <div class="calendar-grid">
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Sun</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Mon</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Tue</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Wed</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Thu</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Fri</div>
        <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Sat</div>
    `;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Show 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + i);
      const dateStr = currentDay.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const hasSaves = savesByDate[dateStr];

      const saveName = hasSaves && hasSaves.length === 1
        ? (hasSaves[0].event_name || hasSaves[0].venue_name || 'Untitled')
        : (hasSaves ? `${hasSaves.length} saves` : '');

      calendarHTML += `
        <div class="calendar-day ${isToday ? 'today' : ''}" ${hasSaves ? `onclick="showSavesForDate('${dateStr}')"` : ''}>
          <div style="font-weight: 600;">${currentDay.getDate()}</div>
          ${hasSaves ? `<div class="calendar-day-dot"></div>` : ''}
          ${hasSaves ? `<div style="font-size: 11px; color: #666; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${saveName}</div>` : ''}
        </div>
      `;
    }

    calendarHTML += '</div>';
    calendarView.innerHTML = calendarHTML;
    return;
  }

  // Month view (default)
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const prevLastDay = new Date(currentYear, currentMonth, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  let calendarHTML = `
    <div class="calendar-header">
      <button onclick="changeMonth(-1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">‹ Prev</button>
      <h2 style="margin: 0; font-size: 20px;">${monthNames[currentMonth]} ${currentYear}</h2>
      <button onclick="changeMonth(1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Next ›</button>
    </div>

    <div class="calendar-grid">
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Sun</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Mon</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Tue</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Wed</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Thu</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Fri</div>
      <div style="text-align: center; font-weight: 700; padding: 8px; color: #666;">Sat</div>
  `;

  // Add previous month's trailing days
  for (let i = firstDayIndex; i > 0; i--) {
    calendarHTML += `
      <div class="calendar-day" style="opacity: 0.3;">
        <div style="font-weight: 600;">${prevLastDate - i + 1}</div>
      </div>
    `;
  }

  // Add current month's days
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= lastDateOfMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const hasSaves = savesByDate[dateStr];

    const saveName = hasSaves && hasSaves.length === 1
      ? (hasSaves[0].event_name || hasSaves[0].venue_name || 'Untitled')
      : (hasSaves ? `${hasSaves.length} saves` : '');

    calendarHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''}" ${hasSaves ? `onclick="showSavesForDate('${dateStr}')"` : ''}>
        <div style="font-weight: 600;">${day}</div>
        ${hasSaves ? `<div class="calendar-day-dot"></div>` : ''}
        ${hasSaves ? `<div style="font-size: 11px; color: #666; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${saveName}</div>` : ''}
      </div>
    `;
  }

  // Add next month's leading days
  const remainingDays = 7 - ((firstDayIndex + lastDateOfMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      calendarHTML += `
        <div class="calendar-day" style="opacity: 0.3;">
          <div style="font-weight: 600;">${i}</div>
        </div>
      `;
    }
  }

  calendarHTML += '</div>';
  calendarView.innerHTML = calendarHTML;
}

// Change calendar month
function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  renderCalendar();
}

// Show saves for a specific date
function showSavesForDate(dateStr) {
  const savesForDate = filteredSaves.filter(save =>
    save.event_date && save.event_date.startsWith(dateStr)
  );

  if (savesForDate.length === 0) return;

  // Sort by start_time (earliest first)
  savesForDate.sort((a, b) => {
    const timeA = a.start_time || '23:59'; // Put items without time at the end
    const timeB = b.start_time || '23:59';
    return timeA.localeCompare(timeB);
  });

  // If only one save, show details directly
  if (savesForDate.length === 1) {
    showSaveDetails(savesForDate[0].id);
    return;
  }

  // Format date nicely
  const date = new Date(dateStr + 'T00:00:00');
  const dateFormatted = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Show list of saves for this date
  const viewModal = document.getElementById('view-modal');
  const viewModalTitle = document.getElementById('view-modal-title');
  const viewModalContent = document.getElementById('view-modal-content');
  const editBtn = document.getElementById('view-modal-edit-btn');

  viewModalTitle.textContent = dateFormatted;
  editBtn.style.display = 'none';

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  savesForDate.forEach(save => {
    // Format time if available
    let timeStr = '';
    if (save.start_time) {
      const [hours, minutes] = save.start_time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let formattedTime = `${displayHour}:${minutes} ${ampm}`;

      // Add end time if available
      if (save.end_time) {
        const [endHours, endMinutes] = save.end_time.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour % 12 || 12;
        formattedTime += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
      }

      // Add timezone abbreviation if available
      const tzAbbr = getTimezoneAbbr(save.timezone);
      if (tzAbbr) {
        formattedTime += ` ${tzAbbr}`;
      }

      timeStr = `<div style="font-size: 14px; color: #666; margin-bottom: 4px;">🕐 ${formattedTime}</div>`;
    }

    html += `
      <div onclick="showSaveDetails('${save.id}')" style="padding: 16px; background: #f9f9f9; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
        ${timeStr}
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${save.event_name || save.venue_name || 'Untitled'}</div>
        ${save.address ? `<div style="font-size: 14px; color: #666;">📍 ${save.address}</div>` : ''}
        ${save.category ? `<div style="font-size: 12px; color: #666; text-transform: uppercase; margin-top: 4px;">${save.category}</div>` : ''}
      </div>
    `;
  });
  html += '</div>';

  viewModalContent.innerHTML = html;
  viewModal.classList.add('active');
}

// Show individual save details
function showSaveDetails(saveId) {
  const save = allSaves.find(s => s.id === saveId);
  if (!save) return;

  const viewModal = document.getElementById('view-modal');
  const viewModalTitle = document.getElementById('view-modal-title');
  const viewModalContent = document.getElementById('view-modal-content');
  const editBtn = document.getElementById('view-modal-edit-btn');

  viewModalTitle.textContent = save.event_name || save.venue_name || 'Save Details';

  let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

  if (save.category) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Category</div>
      <div style="font-size: 16px;">${save.category}</div>
    </div>`;
  }

  if (save.address) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Location</div>
      <div style="font-size: 16px;">📍 ${save.address}</div>
    </div>`;
  }

  if (save.event_date) {
    // Fix timezone issue by appending time to force local interpretation
    const date = new Date(save.event_date + 'T00:00:00');
    let dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Add time if available
    if (save.start_time) {
      const [hours, minutes] = save.start_time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let timeStr = `${displayHour}:${minutes} ${ampm}`;

      // Add end time if available
      if (save.end_time) {
        const [endHours, endMinutes] = save.end_time.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour % 12 || 12;
        timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
      }

      // Add timezone abbreviation if available
      const tzAbbr = getTimezoneAbbr(save.timezone);
      if (tzAbbr) {
        timeStr += ` ${tzAbbr}`;
      }

      dateStr += ` • ${timeStr}`;
    }

    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Date & Time</div>
      <div style="font-size: 16px;">📅 ${dateStr}</div>
    </div>`;
  }

  if (save.url) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Post</div>
      <a href="${save.url}" target="_blank" style="font-size: 16px; color: #000; text-decoration: underline;">🔗 Open in New Tab</a>
    </div>`;
  }

  html += '</div>';

  viewModalContent.innerHTML = html;
  editBtn.style.display = 'block';
  editBtn.onclick = () => {
    closeViewModal();
    editSave(saveId);
  };

  viewModal.classList.add('active');
}

// Close view modal
function closeViewModal() {
  const viewModal = document.getElementById('view-modal');
  viewModal.classList.remove('active');
}

// Initialize autocomplete for add modal
function initializeAddAutocomplete() {
  if (!window.Radar) {
    console.error('Radar SDK not loaded');
    return;
  }

  const container = document.getElementById('add-location-autocomplete');
  if (!container) {
    console.error('Add location autocomplete container not found');
    return;
  }

  try {
    // Clean up previous instance if exists
    if (addAutocompleteInstance) {
      try {
        addAutocompleteInstance.remove();
      } catch (e) {
        console.log('Previous add autocomplete already removed');
      }
    }

    // Reset selected address
    selectedAddAddress = null;

    // Initialize autocomplete
    addAutocompleteInstance = Radar.ui.autocomplete({
      container: 'add-location-autocomplete',
      width: '100%',
      responsive: true,
      placeholder: 'Search for address...',
      near: '27.7676,-82.6403',
      layers: ['place', 'address'],
      limit: 8,
      debounceMS: 300,
      minCharacters: 3,
      showMarkers: false,
      onSelection: (address) => {
        selectedAddAddress = {
          lat: address.latitude,
          lng: address.longitude,
          formattedAddress: address.formattedAddress,
          city: address.city,
          state: address.stateCode,
          postalCode: address.postalCode
        };
        console.log('Add location selected:', selectedAddAddress);
      },
      onError: (error) => {
        console.error('Add autocomplete error:', error);
      }
    });

    console.log('Add autocomplete initialized');
  } catch (error) {
    console.error('Failed to initialize add autocomplete:', error);
  }
}

// Open add modal
function openAddModal() {
  addForm.reset();
  selectedAddAddress = null;

  // Populate category dropdown and check if categories exist
  const hasCategories = populateAddCategoryDropdown();

  // If no categories exist, auto-select "Other (Create New)" and show custom category field
  if (!hasCategories) {
    addCategorySelect.value = '__create_new__';
    addCustomCategoryGroup.style.display = 'block';
    addCustomCategoryInput.required = true;
    // Focus on custom category input after a brief delay
    setTimeout(() => {
      addCustomCategoryInput.focus();
    }, 150);
  } else {
    // Hide custom category input
    addCustomCategoryGroup.style.display = 'none';
    addCustomCategoryInput.value = '';
    addCustomCategoryInput.required = false;
  }

  // Set default timezone
  addTimezoneSelect.value = getDefaultTimezone();

  addModal.classList.add('active');

  // Initialize autocomplete after modal is shown
  setTimeout(() => {
    initializeAddAutocomplete();
  }, 100);
}

// Close add modal
function closeAddModal() {
  // Clean up autocomplete
  if (addAutocompleteInstance) {
    try {
      addAutocompleteInstance.remove();
    } catch (e) {
      console.log('Autocomplete already removed');
    }
  }
  addAutocompleteInstance = null;
  selectedAddAddress = null;

  addModal.classList.remove('active');
}

// Handle add save
async function handleAddSave(e) {
  e.preventDefault();

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    // Get form data
    const url = document.getElementById('add-url').value.trim();
    const name = document.getElementById('add-name').value.trim();
    const date = document.getElementById('add-date').value;
    const time = document.getElementById('add-time').value;
    const endTime = document.getElementById('add-end-time').value;
    const timezone = document.getElementById('add-timezone').value;
    let category = document.getElementById('add-category').value;

    // Save timezone as new default
    if (timezone) {
      setDefaultTimezone(timezone);
    }

    // Handle custom category
    if (category === '__create_new__') {
      const customCategory = addCustomCategoryInput.value.trim();
      if (!customCategory) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
        await customAlert('Please enter a category name');
        return;
      }
      category = customCategory;
    }

    // Auto-detect platform from URL
    let platform = 'instagram';
    if (url.includes('tiktok.com')) {
      platform = 'tiktok';
    }

    // Call backend POST /v1/user/saves
    const response = await fetch(`${API_BASE}/v1/user/saves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        platform: platform,
        url: url,
        content: name,
        images: [],
        author: 'unknown',
        category: category || null
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Save failed');
    }

    // Prepare location data from autocomplete or manual entry
    let locationData = null;
    if (selectedAddAddress) {
      // Use address from autocomplete
      locationData = {
        address: selectedAddAddress.formattedAddress,
        latitude: selectedAddAddress.lat,
        longitude: selectedAddAddress.lng,
        city: selectedAddAddress.city,
        state: selectedAddAddress.state,
        postalCode: selectedAddAddress.postalCode
      };
      console.log('Using autocomplete address:', locationData);
    } else {
      // Try to get manual text input (if autocomplete wasn't used)
      const manualInput = document.querySelector('#add-location-autocomplete input');
      if (manualInput && manualInput.value.trim()) {
        const manualAddress = manualInput.value.trim();
        console.log('Geocoding manual address:', manualAddress);
        const geocoded = await geocodeAddress(manualAddress);
        if (geocoded) {
          locationData = {
            address: geocoded.formattedAddress,
            latitude: geocoded.lat,
            longitude: geocoded.lng,
            city: geocoded.city,
            state: geocoded.state,
            postalCode: geocoded.postalCode
          };
          console.log('Geocoded manual address:', locationData);
        }
      }
    }

    // Update the item with user-provided data
    const updateData = {};
    if (name) {
      updateData.event_name = name;
      updateData.venue_name = name;
    }
    if (locationData) {
      updateData.address = locationData.address;
      updateData.coordinates = {
        lat: locationData.latitude,
        lng: locationData.longitude
      };
      if (locationData.city) updateData.city = locationData.city;
      if (locationData.state) updateData.state = locationData.state;
      if (locationData.postalCode) updateData.postalCode = locationData.postalCode;
    }
    if (date) updateData.event_date = date;
    if (time) updateData.start_time = time;
    if (endTime) updateData.end_time = endTime;
    if (timezone) updateData.timezone = timezone;
    if (category) updateData.category = category;

    if (Object.keys(updateData).length > 0) {
      await fetch(`${API_BASE}/v1/user/saves/${data.item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updateData)
      });
    }

    // Clean up autocomplete
    if (addAutocompleteInstance) {
      try {
        addAutocompleteInstance.remove();
      } catch (e) {
        console.log('Autocomplete already removed');
      }
    }
    addAutocompleteInstance = null;
    selectedAddAddress = null;

    // Refresh saves
    await fetchSaves();
    renderSaves();

    // Close modal
    closeAddModal();

    await customAlert('Save added successfully!', 'Success');

  } catch (error) {
    console.error('Add save error:', error);
    await customAlert('Failed to add save. Please try again.', 'Error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// Initialize autocomplete for edit modal
function initializeEditAutocomplete(currentAddress) {
  if (!window.Radar) {
    console.error('Radar SDK not loaded');
    return;
  }

  const container = document.getElementById('edit-location-autocomplete');
  if (!container) {
    console.error('Edit location autocomplete container not found');
    return;
  }

  try {
    // Clean up previous instance if exists
    if (editAutocompleteInstance) {
      try {
        editAutocompleteInstance.remove();
      } catch (e) {
        console.log('Previous edit autocomplete already removed');
      }
    }

    // Reset selected address
    selectedEditAddress = null;

    // Initialize autocomplete
    editAutocompleteInstance = Radar.ui.autocomplete({
      container: 'edit-location-autocomplete',
      width: '100%',
      responsive: true,
      placeholder: currentAddress || 'Search for address...',
      near: '27.7676,-82.6403',
      layers: ['place', 'address'],
      limit: 8,
      debounceMS: 300,
      minCharacters: 3,
      showMarkers: false,
      onSelection: (address) => {
        selectedEditAddress = {
          lat: address.latitude,
          lng: address.longitude,
          formattedAddress: address.formattedAddress,
          city: address.city,
          state: address.stateCode,
          postalCode: address.postalCode
        };
        console.log('Edit location selected:', selectedEditAddress);
      },
      onError: (error) => {
        console.error('Edit autocomplete error:', error);
      }
    });

    console.log('Edit autocomplete initialized');
  } catch (error) {
    console.error('Failed to initialize edit autocomplete:', error);
  }
}

// Edit save
function editSave(itemId) {
  const save = allSaves.find(s => s.id === itemId);
  if (!save) return;

  selectedEditAddress = null;

  // Populate category dropdown with current categories
  populateEditCategoryDropdown();

  // Fill edit form
  document.getElementById('edit-item-id').value = save.id;
  document.getElementById('edit-category').value = save.category || '';
  document.getElementById('edit-event-name').value = save.event_name || save.venue_name || '';
  document.getElementById('edit-date').value = save.event_date || '';
  document.getElementById('edit-time').value = save.start_time || '';
  document.getElementById('edit-end-time').value = save.end_time || '';
  document.getElementById('edit-timezone').value = save.timezone || getDefaultTimezone();

  // Open modal
  editModal.classList.add('active');

  // Initialize autocomplete after modal is shown
  setTimeout(() => {
    initializeEditAutocomplete(save.address || '');
  }, 100);
}

// Close edit modal
function closeEditModal() {
  // Clean up autocomplete
  if (editAutocompleteInstance) {
    try {
      editAutocompleteInstance.remove();
    } catch (e) {
      console.log('Autocomplete already removed');
    }
  }
  editAutocompleteInstance = null;
  selectedEditAddress = null;

  editModal.classList.remove('active');
}

// Handle edit save
async function handleEditSave(e) {
  e.preventDefault();

  const editSaveBtn = document.getElementById('edit-save-btn');
  editSaveBtn.disabled = true;
  editSaveBtn.textContent = 'Saving...';

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const itemId = document.getElementById('edit-item-id').value;
    let category = document.getElementById('edit-category').value;

    // Handle "Other (Enter New)" option
    if (category === '__other_new__') {
      const newCategory = prompt('Enter new category name:');
      if (newCategory && newCategory.trim()) {
        category = newCategory.trim();
      } else {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = 'Save';
        return;
      }
    }

    const eventName = document.getElementById('edit-event-name').value.trim();
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const endTime = document.getElementById('edit-end-time').value;
    const timezone = document.getElementById('edit-timezone').value;

    // Save timezone as new default
    if (timezone) {
      setDefaultTimezone(timezone);
    }

    // Get current save to preserve existing location if not changed
    const currentSave = allSaves.find(s => s.id === itemId);

    // Prepare location data
    let locationData = null;
    if (selectedEditAddress) {
      // Use address from autocomplete
      locationData = {
        address: selectedEditAddress.formattedAddress,
        coordinates: {
          lat: selectedEditAddress.lat,
          lng: selectedEditAddress.lng
        },
        city: selectedEditAddress.city,
        state: selectedEditAddress.state,
        postalCode: selectedEditAddress.postalCode
      };
      console.log('Using autocomplete address:', locationData);
    } else {
      // Try to get manual text input (if autocomplete wasn't used)
      const manualInput = document.querySelector('#edit-location-autocomplete input');
      if (manualInput && manualInput.value.trim()) {
        const manualAddress = manualInput.value.trim();
        // Only geocode if address is different from current
        if (manualAddress !== currentSave.address) {
          console.log('Geocoding manual address:', manualAddress);
          const geocoded = await geocodeAddress(manualAddress);
          if (geocoded) {
            locationData = {
              address: geocoded.formattedAddress,
              coordinates: {
                lat: geocoded.lat,
                lng: geocoded.lng
              },
              city: geocoded.city,
              state: geocoded.state,
              postalCode: geocoded.postalCode
            };
            console.log('Geocoded manual address:', locationData);
          }
        }
      }
    }

    // Build update data
    const updateData = {
      category: category || null,
      event_name: eventName || null,
      event_date: date || null,
      start_time: time || null,
      end_time: endTime || null,
      timezone: timezone || null
    };

    // Add location data if provided
    if (locationData) {
      updateData.address = locationData.address;
      updateData.coordinates = locationData.coordinates;
      if (locationData.city) updateData.city = locationData.city;
      if (locationData.state) updateData.state = locationData.state;
      if (locationData.postalCode) updateData.postalCode = locationData.postalCode;
    }

    // Call backend PATCH /v1/user/saves/{id}
    const response = await fetch(`${API_BASE}/v1/user/saves/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update');
    }

    // Clean up autocomplete
    if (editAutocompleteInstance) {
      try {
        editAutocompleteInstance.remove();
      } catch (e) {
        console.log('Autocomplete already removed');
      }
    }
    editAutocompleteInstance = null;
    selectedEditAddress = null;

    // Refresh saves
    await fetchSaves();
    renderSaves();

    // Reset map
    if (mapInitialized) {
      mapInitialized = false;
      mapDiv.innerHTML = '';
    }

    // Close modal
    closeEditModal();

    await customAlert('Save updated successfully!', 'Success');

  } catch (error) {
    console.error('Update save error:', error);
    await customAlert('Failed to update save. Please try again.', 'Error');
  } finally {
    editSaveBtn.disabled = false;
    editSaveBtn.textContent = 'Save';
  }
}

// Delete save
async function deleteSave(itemId) {
  const confirmed = await customConfirm('Are you sure you want to delete this save?', 'Delete Save');
  if (!confirmed) {
    return;
  }

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    // Call backend DELETE /v1/user/saves/{id}
    const response = await fetch(`${API_BASE}/v1/user/saves/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    // Refresh saves
    await fetchSaves();
    renderSaves();

    // Reset map
    if (mapInitialized) {
      mapInitialized = false;
      mapDiv.innerHTML = '';
    }

    await customAlert('Save deleted successfully!', 'Success');

  } catch (error) {
    console.error('Delete save error:', error);
    await customAlert('Failed to delete save. Please try again.', 'Error');
  }
}

// Update user display name in settings dropdown
function updateUserDisplayName() {
  // If both display name and username exist, show both
  if (currentUser.display_name && currentUser.username) {
    userEmailSpan.textContent = currentUser.display_name;
    userUsernameSpan.textContent = '@' + currentUser.username;
    userUsernameSpan.style.display = 'block';
  }
  // If only display name exists, show display name only
  else if (currentUser.display_name) {
    userEmailSpan.textContent = currentUser.display_name;
    userUsernameSpan.style.display = 'none';
  }
  // If only username exists, show username only
  else if (currentUser.username) {
    userEmailSpan.textContent = '@' + currentUser.username;
    userUsernameSpan.style.display = 'none';
  }
  // Default to email
  else {
    userEmailSpan.textContent = currentUser.email || 'User';
    userUsernameSpan.style.display = 'none';
  }
}

// Profile Modal Functions
function openProfileModal() {
  // Close settings dropdown
  settingsDropdown.classList.remove('show');

  // Load current user data
  if (currentUser) {
    // Load profile fields
    profileDisplayName.value = currentUser.display_name || '';
    profileUsername.value = currentUser.username || '';
    profileBirthday.value = currentUser.birthday || '';

    // Store original username for comparison
    originalUsername = currentUser.username || '';
  }

  // Reset username feedback
  usernameFeedback.textContent = '';
  usernameFeedback.style.color = '';
  isUsernameAvailable = true;

  profileModal.classList.add('active');
}

function closeProfileModal() {
  profileModal.classList.remove('active');
  profileForm.reset();
  usernameFeedback.textContent = '';

  // Reset save button state
  const saveBtn = document.getElementById('save-profile-btn');
  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Changes';
}

function openAccountSettingsModal() {
  // Close profile modal
  profileModal.classList.remove('active');

  // Load current user data
  if (currentUser) {
    settingsEmail.value = currentUser.email || '';
  }

  // Reset password fields
  settingsNewPassword.value = '';
  settingsConfirmPassword.value = '';
  settingsConfirmPasswordGroup.style.display = 'none';
  settingsConfirmPassword.required = false;

  accountSettingsModal.classList.add('active');
}

function closeAccountSettingsModal() {
  accountSettingsModal.classList.remove('active');
  accountSettingsForm.reset();

  // Reset save button state
  const saveBtn = document.getElementById('save-settings-btn');
  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Changes';

  // Reopen profile modal
  openProfileModal();
}

// Check username availability
async function checkUsernameAvailability(username) {
  try {
    const session = getSession();
    if (!session) return;

    // Validate username format (alphanumeric, underscore, hyphen only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      usernameFeedback.textContent = 'Username can only contain letters, numbers, underscores, and hyphens';
      usernameFeedback.style.color = '#ff3b30';
      isUsernameAvailable = false;
      return;
    }

    // Check minimum length
    if (username.length < 3) {
      usernameFeedback.textContent = 'Username must be at least 3 characters';
      usernameFeedback.style.color = '#ff3b30';
      isUsernameAvailable = false;
      return;
    }

    const response = await fetch(`${API_BASE}/v1/user/username/check?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    // If endpoint doesn't exist yet (404), allow username without validation
    if (response.status === 404) {
      usernameFeedback.textContent = '';
      usernameFeedback.style.color = '';
      isUsernameAvailable = true;
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to check username');
    }

    const data = await response.json();

    if (data.available) {
      usernameFeedback.textContent = 'This username is available!';
      usernameFeedback.style.color = '#42A746';
      isUsernameAvailable = true;
    } else {
      usernameFeedback.textContent = 'Sorry, this username is already taken. Please try again.';
      usernameFeedback.style.color = '#ff3b30';
      isUsernameAvailable = false;
    }

  } catch (error) {
    console.error('Username check error:', error);
    // Allow submission if check fails (e.g., network error)
    usernameFeedback.textContent = '';
    usernameFeedback.style.color = '';
    isUsernameAvailable = true;
  }
}

function closeProfileModal() {
  profileModal.classList.remove('active');
  profileForm.reset();
}

// Toggle password visibility
function toggleProfilePassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field.type === 'password') {
    field.type = 'text';
  } else {
    field.type = 'password';
  }
}

// Handle profile save
async function handleSaveProfile(e) {
  e.preventDefault();

  const saveBtn = document.getElementById('save-profile-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const displayName = profileDisplayName.value.trim();
    const username = profileUsername.value.trim();
    const birthday = profileBirthday.value;

    // Check username availability before saving
    if (username && username !== originalUsername && !isUsernameAvailable) {
      await customAlert('Please choose an available username', 'Username Unavailable');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
      return;
    }

    // Build update payload - only profile fields, use current email
    const payload = {
      display_name: displayName || null,
      username: username || null,
      zip_code: null,
      birthday: birthday || null,
      email: currentUser.email // Keep current email
    };

    // Call backend to update profile
    const response = await fetch(`${API_BASE}/v1/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    // Update current user data
    const result = await response.json();
    if (result.user) {
      currentUser = result.user;
    }

    // Update display name in settings dropdown
    updateUserDisplayName();

    // Close modal first, then show success message
    closeProfileModal();
    await customAlert('Profile updated successfully!', 'Success');

  } catch (error) {
    console.error('Save profile error:', error);
    await customAlert(error.message || 'Failed to update profile. Please try again.', 'Error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

// Handle account settings save
async function handleSaveAccountSettings(e) {
  e.preventDefault();

  const saveBtn = document.getElementById('save-settings-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const email = settingsEmail.value.trim();
    const newPassword = settingsNewPassword.value;
    const confirmPassword = settingsConfirmPassword.value;

    // Validate password if changing
    if (newPassword) {
      if (newPassword.length < 8) {
        await customAlert('Password must be at least 8 characters long', 'Invalid Password');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        return;
      }

      if (newPassword !== confirmPassword) {
        await customAlert('Passwords do not match', 'Password Mismatch');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        return;
      }
    }

    // Build update payload with email and password
    const payload = {
      display_name: currentUser.display_name || null,
      username: currentUser.username || null,
      zip_code: null,
      birthday: currentUser.birthday || null,
      email: email
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    // Call backend to update profile
    const response = await fetch(`${API_BASE}/v1/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }

    // Update current user data
    const result = await response.json();
    if (result.user) {
      currentUser = result.user;
    }

    // Update email display in settings dropdown
    userEmailSpan.textContent = email;

    // Close modal first, then show success message
    closeAccountSettingsModal();
    await customAlert('Account settings updated successfully!', 'Success');

  } catch (error) {
    console.error('Save settings error:', error);
    await customAlert(error.message || 'Failed to update settings. Please try again.', 'Error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
}

// Handle account deletion
async function handleDeleteAccount() {
  // Close any open modals first
  accountSettingsModal.classList.remove('active');
  profileModal.classList.remove('active');

  // Show delete confirmation requiring "DELETE" to be typed
  const confirmed = await customDeleteConfirm();

  if (!confirmed) {
    // If cancelled, reopen account settings modal
    accountSettingsModal.classList.add('active');
    return;
  }

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    const response = await fetch(`${API_BASE}/v1/user/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete account');
    }

    await customAlert('Your account has been deleted. You will now be logged out.', 'Account Deleted');

    // Log out
    clearSession();
    window.location.href = '/login.html';

  } catch (error) {
    console.error('Delete account error:', error);
    await customAlert('Failed to delete account. Please try again.', 'Error');
    // Reopen account settings modal on error
    accountSettingsModal.classList.add('active');
  }
}

// Make functions globally accessible
// Update collections dropdown
function updateCollectionsDropdown() {
  const collectionsFilter = document.getElementById('collections-filter');
  if (!collectionsFilter) return;

  // Show/hide filter based on collections
  if (savedCollections.length === 0) {
    collectionsFilter.style.display = 'none';
    return;
  }

  collectionsFilter.style.display = 'flex';

  const collectionsSelect = document.getElementById('collections-select');
  if (!collectionsSelect) return;

  // Clear and populate
  collectionsSelect.innerHTML = '<option value="">Saved Collections</option>';

  savedCollections.forEach(collection => {
    const option = document.createElement('option');
    option.value = collection.id;
    option.textContent = `${collection.name} (${collection.categories.length} categories)`;
    collectionsSelect.appendChild(option);
  });
}

// Select a saved collection
function selectCollection(collectionId) {
  if (!collectionId) return;

  const collection = savedCollections.find(c => c.id === collectionId);
  if (!collection) return;

  // Set the categories from the collection
  setCategory(collection.categories);

  // Reset dropdown
  const collectionsSelect = document.getElementById('collections-select');
  if (collectionsSelect) {
    collectionsSelect.value = '';
  }
}

window.editSave = editSave;
window.deleteSave = deleteSave;
window.closeAddModal = closeAddModal;
window.closeEditModal = closeEditModal;
window.closeEditCategoriesModal = closeEditCategoriesModal;
window.openEditCategoriesModal = openEditCategoriesModal;
window.closeShareNameModal = closeShareNameModal;
window.openCollectionModal = openCollectionModal;
window.confirmShare = confirmShare;
window.saveCollection = saveCollection;
window.updateCollectionsDropdown = updateCollectionsDropdown;
window.selectCollection = selectCollection;
window.changeMonth = changeMonth;
window.showSavesForDate = showSavesForDate;
window.closeProfileModal = closeProfileModal;
window.openAccountSettingsModal = openAccountSettingsModal;
window.closeAccountSettingsModal = closeAccountSettingsModal;
window.toggleProfilePassword = toggleProfilePassword;

// Arrow animation for empty state
let arrowAnimationInterval = null;
let arrowIndex = 0;

function startArrowAnimation() {
  if (arrowAnimationInterval) return; // Already running

  arrowAnimationInterval = setInterval(() => {
    if (arrowIndicator && arrowIndicator.classList.contains('show')) {
      // Create 5 arrows where one is green and bold (moving from left to right)
      let arrowHTML = '';
      for (let i = 0; i < 5; i++) {
        if (i === arrowIndex) {
          arrowHTML += '<span style="color: #42A746; font-weight: 700;">&gt;</span>';
        } else {
          arrowHTML += '<span style="color: #666; font-weight: 700;">&gt;</span>';
        }
      }
      arrowIndicator.innerHTML = arrowHTML;
      arrowIndex = (arrowIndex + 1) % 5;
    }
  }, 500); // Change arrow every 0.5 seconds
}

function stopArrowAnimation() {
  if (arrowAnimationInterval) {
    clearInterval(arrowAnimationInterval);
    arrowAnimationInterval = null;
    arrowIndex = 0;
  }
}

// Start arrow animation on load
startArrowAnimation();

// Initialize on page load
init();
