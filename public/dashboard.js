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
let selectedCategory = null;

// DOM elements
const loadingDiv = document.getElementById('loading');
const dashboardDiv = document.getElementById('dashboard');
const userEmailSpan = document.getElementById('user-email');
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
const emptyState = document.getElementById('empty-state');
const categoryFilter = document.getElementById('category-filter');

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
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');
const settingsUpdateBtn = document.getElementById('settings-update-btn');

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
    'America/New_York': 'ET',
    'America/Chicago': 'CT',
    'America/Denver': 'MT',
    'America/Phoenix': 'MST',
    'America/Los_Angeles': 'PT',
    'America/Anchorage': 'AKT',
    'Pacific/Honolulu': 'HST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
    'Australia/Sydney': 'AEDT'
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
    userEmailSpan.textContent = currentUser.email || 'User';

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

  } catch (error) {
    console.error('Dashboard initialization error:', error);
    alert('Failed to load dashboard. Please try logging in again.');
    window.location.href = '/login.html';
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
    if (category === selectedCategory) {
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

// Set category filter
function setCategory(category) {
  selectedCategory = category;
  categoryNameText.textContent = category;

  // Count items in this category
  const itemCount = allSaves.filter(save => save.category === category).length;
  categoryItemCount.textContent = `${itemCount} Save${itemCount !== 1 ? 's' : ''}`;

  // Show category header
  categoryHeaderSection.style.display = 'block';

  // Apply filters
  applyFilters();

  // Update category filter dropdown to match (after applyFilters to ensure dropdown is populated)
  categoryFilter.value = category;
}

// Clear category filter
function clearCategory() {
  selectedCategory = null;
  categoryHeaderSection.style.display = 'none';

  // Reset category filter dropdown
  categoryFilter.value = '';

  // Apply filters
  applyFilters();
}

// Edit Categories Modal
const editCategoriesModal = document.getElementById('edit-categories-modal');
const editCategoriesBtn = document.getElementById('edit-categories-btn');
const saveCategoriesBtn = document.getElementById('save-categories-btn');
const categoriesList = document.getElementById('categories-list');

let categoryChanges = new Map(); // Map of original name -> new name
let categoriesToDelete = new Set(); // Set of categories to delete

// Open edit categories modal
function openEditCategoriesModal() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  if (categories.size === 0) {
    alert('No categories to edit.');
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
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete category "${category}"? This will remove the category from all saves.`)) {
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
    alert('Categories updated successfully!');

  } catch (error) {
    console.error('Error updating categories:', error);
    alert('Failed to update categories. Please try again.');
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

  // Clear category button
  clearCategoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearCategory();
  });

  // Share button
  shareBtn.addEventListener('click', handleShare);

  // Edit categories button
  editCategoriesBtn.addEventListener('click', openEditCategoriesModal);

  // Save categories button
  saveCategoriesBtn.addEventListener('click', saveCategoryChanges);

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Filters
  categoryFilter.addEventListener('change', async (e) => {
    const value = e.target.value;

    // Handle special options
    if (value === '__other_new__') {
      // Prompt for new category name
      const newCategory = prompt('Enter new category name:');
      if (newCategory && newCategory.trim()) {
        setCategory(newCategory.trim());
      } else {
        // Reset to previous selection
        categoryFilter.value = selectedCategory || '';
      }
      return;
    }

    // Handle normal category selection
    if (value) {
      setCategory(value);
    } else {
      clearCategory();
    }
  });

  // Add category dropdown change handler
  addCategorySelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === '__create_new__') {
      // Show custom category input
      addCustomCategoryGroup.style.display = 'block';
      addCustomCategoryInput.focus();
    } else {
      // Hide custom category input
      addCustomCategoryGroup.style.display = 'none';
      addCustomCategoryInput.value = '';
    }
  });

  // Add form submission
  addForm.addEventListener('submit', handleAddSave);

  // Edit form submission
  editForm.addEventListener('submit', handleEditSave);
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

  if (filteredSaves.length === 0) {
    savesGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  savesGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  // Update category filter options
  updateCategoryFilter();

  filteredSaves.forEach(save => {
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
    <div class="card-edit-icon" data-save-id="${save.id}">+</div>
    <div class="card-title">${save.event_name || save.venue_name || 'Untitled'}</div>
    ${save.category ? `<div class="card-category" data-category="${save.category}">${save.category}</div>` : ''}
    ${save.address ? `<div class="card-address">📍 ${save.address}</div>` : ''}
    ${dateStr ? `<div class="card-date">📅 ${dateStr}</div>` : ''}
    ${save.tags && save.tags.length > 0 ? `<div class="card-tags">${tagsHTML}</div>` : ''}
    <div class="card-link-preview">
      <button class="card-link-btn" data-url="${save.url || ''}">Link Preview - Open in Tab</button>
    </div>
  `;

  // Edit icon click handler
  const editIcon = card.querySelector('.card-edit-icon');
  editIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    editSave(save.id);
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

  // Link button click handler
  const linkBtn = card.querySelector('.card-link-btn');
  linkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (save.url) {
      window.open(save.url, '_blank');
    }
  });

  return card;
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = new Set();
  allSaves.forEach(save => {
    if (save.category) {
      categories.add(save.category);
    }
  });

  // Build dropdown options
  categoryFilter.innerHTML = '<option value="">All Categories</option>';

  // Add existing categories
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });

  // Add separator
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '──────────';
  categoryFilter.appendChild(separator);

  // Add "Other (Enter New)" option at bottom
  const otherOption = document.createElement('option');
  otherOption.value = '__other_new__';
  otherOption.textContent = 'Other (Enter New)';
  categoryFilter.appendChild(otherOption);
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

  // Add separator
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '──────────';
  addCategorySelect.appendChild(separator);

  // Add "Other (Create New)" option at bottom
  const otherOption = document.createElement('option');
  otherOption.value = '__create_new__';
  otherOption.textContent = 'Other (Create New)';
  addCategorySelect.appendChild(otherOption);
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
  // Filter by category (use global selectedCategory)
  filteredSaves = allSaves.filter(save => {
    if (selectedCategory && save.category !== selectedCategory) {
      return false;
    }
    return true;
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

// Handle share button
async function handleShare() {
  if (!selectedCategory) return;

  try {
    const session = getSession();
    if (!session) throw new Error('No session found');

    // Get saves for the selected category
    const categorySaves = allSaves.filter(save => save.category === selectedCategory);

    if (categorySaves.length === 0) {
      alert('No saves in this category to share');
      return;
    }

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

    console.log('Sharing category:', selectedCategory);
    console.log('Items to share:', formattedItems.length);

    // Create a share link by calling backend API
    const response = await fetch(`${API_BASE}/v1/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: selectedCategory,
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
    alert(`Failed to create share link: ${error.message}`);

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

  // Get saves with coordinates from filtered saves
  const savesWithCoords = filteredSaves.filter(save =>
    save.coordinates && save.coordinates.lat && save.coordinates.lng
  );

  if (savesWithCoords.length === 0) {
    mapDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🗺️</div>
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #000;">No maps yet!</h2>
        <p style="font-size: 16px; color: #666;">Click "Add Save" to get started</p>
      </div>
    `;
    return;
  }

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
    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 8px;">
        <strong>${save.event_name || save.venue_name || 'Location'}</strong><br>
        ${save.address || ''}
        <br><br>
        <a href="https://www.google.com/maps/search/?api=1&query=${save.coordinates.lat},${save.coordinates.lng}"
           target="_blank"
           style="color: #000; font-weight: 600;">
          Open in Google Maps →
        </a>
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

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const prevLastDay = new Date(currentYear, currentMonth, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  // Group saves by date
  const savesByDate = {};
  savesWithDates.forEach(save => {
    const dateKey = save.event_date.split('T')[0]; // Get YYYY-MM-DD
    if (!savesByDate[dateKey]) {
      savesByDate[dateKey] = [];
    }
    savesByDate[dateKey].push(save);
  });

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

    calendarHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''}" ${hasSaves ? `onclick="showSavesForDate('${dateStr}')"` : ''}>
        <div style="font-weight: 600;">${day}</div>
        ${hasSaves ? `<div class="calendar-day-dot"></div>` : ''}
        ${hasSaves ? `<div style="font-size: 11px; color: #666; margin-top: 4px;">${hasSaves.length} save${hasSaves.length > 1 ? 's' : ''}</div>` : ''}
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
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Link</div>
      <a href="${save.url}" target="_blank" style="font-size: 16px; color: #000; text-decoration: underline;">🔗 Open in new tab</a>
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

  // Populate category dropdown
  populateAddCategoryDropdown();

  // Hide custom category input
  addCustomCategoryGroup.style.display = 'none';
  addCustomCategoryInput.value = '';

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
        alert('Please enter a category name');
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

    alert('Save added successfully!');

  } catch (error) {
    console.error('Add save error:', error);
    alert('Failed to add save. Please try again.');
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

    alert('Save updated successfully!');

  } catch (error) {
    console.error('Update save error:', error);
    alert('Failed to update save. Please try again.');
  } finally {
    editSaveBtn.disabled = false;
    editSaveBtn.textContent = 'Save';
  }
}

// Delete save
async function deleteSave(itemId) {
  if (!confirm('Are you sure you want to delete this save?')) {
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

    alert('Save deleted successfully!');

  } catch (error) {
    console.error('Delete save error:', error);
    alert('Failed to delete save. Please try again.');
  }
}

// Make functions globally accessible
window.editSave = editSave;
window.deleteSave = deleteSave;
window.closeAddModal = closeAddModal;
window.closeEditModal = closeEditModal;
window.closeEditCategoriesModal = closeEditCategoriesModal;
window.changeMonth = changeMonth;
window.showSavesForDate = showSavesForDate;

// Initialize on page load
init();
