// Configuration
const BACKEND_URL = 'https://web-production-5630.up.railway.app';
const RADAR_API_KEY = 'prj_live_pk_8c9d4c6a85d8b9e0aacb1b2f6f7ec0ead4cb799a';

// Get share ID from URL
const urlParams = new URLSearchParams(window.location.search);
const shareId = urlParams.get('id') || window.location.pathname.split('/').pop();

// Initialize
let radarMap = null;
let markers = [];
let isEditMode = false;
let currentItems = [];
let allCategories = [];
let selectedCategories = [];
let shareData = null;

async function loadSharedList() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/share/${shareId}`);

    if (!response.ok) {
      throw new Error('List not found');
    }

    const data = await response.json();

    // Debug: Log what data we received
    console.log('📥 Received data from backend:', data);
    console.log('📍 Items received:', data.items?.length || 0);
    if (data.items) {
      data.items.forEach((item, i) => {
        console.log(`Item ${i + 1}:`, {
          name: item.venue_name || item.event_name,
          address: item.address,
          lat: item.latitude,
          lng: item.longitude,
          hasCoords: !!(item.latitude && item.longitude)
        });
      });
    }

    // Store items for reordering
    currentItems = data.items;
    shareData = data;

    // Parse categories (may be combined with " + ")
    if (data.category.includes(' + ')) {
      allCategories = data.category.split(' + ').map(c => c.trim());
      selectedCategories = [...allCategories]; // Select all by default
    } else {
      allCategories = [data.category];
      selectedCategories = [data.category];
    }

    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';

    // Render the page
    renderCategoryHeader(data);
    setupCategoryFilter();
    renderLocationCards(getFilteredItems());
    initializeRadarMap(getFilteredItems());

  } catch (error) {
    console.error('Error loading shared list:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
  }
}

function renderCategoryHeader(data) {
  // Display category name
  document.getElementById('category-name').textContent = data.category;

  // Update counts
  updateCounts();

  // Show number of categories
  const categoryCount = allCategories.length;
  document.getElementById('view-count').textContent = `${categoryCount} categor${categoryCount !== 1 ? 'ies' : 'y'}`;
  document.title = `${data.category} - ParaSosh`; // Cache bust
}

function updateCounts() {
  const filteredItems = getFilteredItems();
  const itemsWithCoords = filteredItems.filter(item => item.latitude && item.longitude).length;
  const totalItems = filteredItems.length;

  // Show count with location info if some items are missing coordinates
  if (itemsWithCoords < totalItems) {
    document.getElementById('item-count').textContent = `${itemsWithCoords} of ${totalItems} place${totalItems !== 1 ? 's' : ''} on map`;
  } else {
    document.getElementById('item-count').textContent = `${totalItems} place${totalItems !== 1 ? 's' : ''}`;
  }
}

function getFilteredItems() {
  if (selectedCategories.length === 0 || selectedCategories.length === allCategories.length) {
    return currentItems;
  }
  return currentItems.filter(item => item.category && selectedCategories.includes(item.category));
}

function setupCategoryFilter() {
  // Only show filter if there are multiple categories
  if (allCategories.length <= 1) {
    return;
  }

  const filterBar = document.getElementById('share-category-filter-bar');
  const toggle = document.getElementById('share-category-toggle');
  const dropdown = document.getElementById('share-category-dropdown');
  const checkboxContainer = document.getElementById('share-category-checkboxes');

  // Show filter bar
  filterBar.style.display = 'block';

  // Populate checkboxes
  allCategories.forEach(category => {
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
      updateCategoryLabel();
      updateView();
    });

    const span = document.createElement('span');
    span.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    label.appendChild(checkbox);
    label.appendChild(span);
    checkboxContainer.appendChild(label);
  });

  // Toggle dropdown
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  updateCategoryLabel();
}

function updateCategoryLabel() {
  const label = document.getElementById('share-category-label');
  if (!label) return;

  if (selectedCategories.length === 0) {
    label.textContent = 'Select Categories';
  } else if (selectedCategories.length === 1) {
    label.textContent = selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1);
  } else if (selectedCategories.length === allCategories.length) {
    label.textContent = 'All Categories';
  } else {
    label.textContent = `${selectedCategories.length} Selected`;
  }
}

function updateView() {
  const filteredItems = getFilteredItems();
  renderLocationCards(filteredItems);
  updateCounts();

  // Update map if it's visible
  const mapTab = document.getElementById('map-tab');
  if (mapTab.classList.contains('active')) {
    initializeRadarMap(filteredItems);
  }

  // Update calendar if it's visible
  const calendarTab = document.getElementById('calendar-tab');
  if (calendarTab.classList.contains('active')) {
    renderCalendar();
  }
}

function renderLocationCards(items) {
  const container = document.getElementById('location-list');
  container.innerHTML = '';

  // Sort items by date and time (earliest first)
  const sortedItems = [...items].sort((a, b) => {
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

  // Separate items with and without coordinates
  const itemsWithCoords = [];
  const itemsWithoutCoords = [];

  sortedItems.forEach(item => {
    if (item.latitude && item.longitude) {
      itemsWithCoords.push(item);
    } else {
      itemsWithoutCoords.push(item);
    }
  });

  // Render items with coordinates
  itemsWithCoords.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'location-card';

    const venue = item.venue_name || item.event_name || 'Saved Location';
    const address = item.address || '';

    // Format date and time like dashboard
    let dateTimeStr = '';
    if (item.event_date) {
      const date = new Date(item.event_date + 'T00:00:00');
      dateTimeStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Add time if available
      if (item.start_time) {
        const [hours, minutes] = item.start_time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        let timeStr = `${displayHour}:${minutes} ${ampm}`;

        // Add end time if available
        if (item.end_time) {
          const [endHours, endMinutes] = item.end_time.split(':');
          const endHour = parseInt(endHours);
          const endAmpm = endHour >= 12 ? 'PM' : 'AM';
          const endDisplayHour = endHour % 12 || 12;
          timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
        }

        // Add timezone abbreviation if available
        if (item.timezone) {
          const tzMap = {
            'Pacific/Midway': 'SST', 'Pacific/Honolulu': 'HST', 'America/Anchorage': 'AKST',
            'America/Los_Angeles': 'PST', 'America/Denver': 'MST', 'America/Phoenix': 'MST',
            'America/Chicago': 'CST', 'America/New_York': 'EST', 'America/Caracas': 'VET',
            'America/Halifax': 'AST', 'America/St_Johns': 'NST', 'America/Argentina/Buenos_Aires': 'ART',
            'America/Sao_Paulo': 'BRT', 'Atlantic/Azores': 'AZOT', 'Atlantic/Cape_Verde': 'CVT',
            'Europe/London': 'GMT', 'Europe/Paris': 'CET', 'Europe/Berlin': 'CET',
            'Europe/Athens': 'EET', 'Africa/Cairo': 'EET', 'Africa/Johannesburg': 'SAST',
            'Europe/Moscow': 'MSK', 'Asia/Dubai': 'GST', 'Asia/Karachi': 'PKT',
            'Asia/Kolkata': 'IST', 'Asia/Dhaka': 'BST', 'Asia/Bangkok': 'ICT',
            'Asia/Singapore': 'SGT', 'Asia/Hong_Kong': 'HKT', 'Asia/Shanghai': 'CST',
            'Asia/Tokyo': 'JST', 'Asia/Seoul': 'KST', 'Australia/Sydney': 'AEDT',
            'Australia/Adelaide': 'ACDT', 'Pacific/Auckland': 'NZDT', 'Pacific/Fiji': 'FJT'
          };
          const tzAbbr = tzMap[item.timezone];
          if (tzAbbr) timeStr += ` ${tzAbbr}`;
        }

        dateTimeStr += ` • ${timeStr}`;
      }
    }

    card.innerHTML = `
      <div class="card-preview-icon">↗</div>
      <div class="card-title">${venue}</div>
      ${item.category ? `<div class="card-category">${item.category}</div>` : ''}
      ${address ? `<div class="card-address">📍 ${address}</div>` : ''}
      ${dateTimeStr ? `<div class="card-date">📅 ${dateTimeStr}</div>` : ''}
      ${item.url ? `<div class="card-link-preview">
        <a href="${item.url}" target="_blank" class="card-link-text" style="font-size: 14px; color: #666; text-decoration: underline; cursor: pointer;">View Post 🔗 Open in New Tab</a>
      </div>` : ''}
    `;

    // Preview icon click handler - show preview modal
    const previewIcon = card.querySelector('.card-preview-icon');
    previewIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      showPreviewModal(item);
    });

    container.appendChild(card);
  });

  // Render items without coordinates in a separate section
  if (itemsWithoutCoords.length > 0) {
    const divider = document.createElement('div');
    divider.style.cssText = 'margin: 24px 0 16px; padding-top: 16px; border-top: 2px dashed rgba(0,0,0,0.1);';
    divider.innerHTML = `
      <div style="text-align: center; color: #000000; opacity: 0.7; font-size: 13px; font-weight: 600; margin-bottom: 12px;">
        📍 Items Without Locations (${itemsWithoutCoords.length})
      </div>
      <div style="text-align: center; color: #000000; opacity: 0.6; font-size: 11px; margin-bottom: 16px;">
        Add locations in the extension to show these on the map
      </div>
    `;
    container.appendChild(divider);

    itemsWithoutCoords.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'location-card';
      card.style.opacity = '0.6';
      card.style.cursor = 'default';

      const venue = item.venue_name || item.address || item.event_name || 'Saved Location';
      const platform = item.platform || '';
      const author = item.author || '';
      const eventDate = formatEventDate(item.event_date);

      card.innerHTML = `
        <div style="display: inline-block; background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.2); color: #000000; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-bottom: 12px;">?</div>
        <h3>${venue}</h3>
        ${platform || author ? `
          <div class="location-details">
            ${platform ? platform : ''}
            ${platform && author ? ' • ' : ''}
            ${author ? (author.startsWith('@') ? author : '@' + author) : ''}
          </div>
        ` : ''}
        ${eventDate ? `<div class="location-date">${eventDate}</div>` : ''}
      `;

      container.appendChild(card);
    });
  }
}

function initializeRadarMap(items) {
  // Filter items with valid coordinates first
  const itemsWithCoords = items.filter(item => item.latitude && item.longitude);

  if (itemsWithCoords.length === 0) {
    console.log('No items with coordinates to display');
    return;
  }

  // Calculate initial center from coordinates
  const avgLat = itemsWithCoords.reduce((sum, item) => sum + item.latitude, 0) / itemsWithCoords.length;
  const avgLng = itemsWithCoords.reduce((sum, item) => sum + item.longitude, 0) / itemsWithCoords.length;

  // Create native MapLibre map with Radar tiles
  radarMap = new maplibregl.Map({
    container: 'radar-map',
    style: `https://api.radar.io/maps/styles/radar-default-v1?publishableKey=${RADAR_API_KEY}`,
    center: [avgLng, avgLat],
    zoom: 13,
  });

  // Add navigation controls (zoom buttons)
  radarMap.addControl(new maplibregl.NavigationControl(), 'top-right');

  console.log('🗺️ Map initialized, waiting for load event...');

  // Close all popups when clicking the map
  radarMap.on('click', (e) => {
    // Close all open popups
    markers.forEach(marker => {
      const popup = marker.getPopup();
      if (popup && popup.isOpen()) {
        popup.remove();
      }
    });
  });

  // Wait for map to be fully loaded and rendered
  radarMap.on('load', () => {
    console.log('🗺️ Map loaded, adding markers...');

    // Add markers for each location
    items.forEach((item, index) => {
      // Only add marker if we have valid coordinates
      if (item.latitude && item.longitude) {
        console.log(`Adding marker ${index + 1} at:`, item.latitude, item.longitude);

        const venue = item.venue_name || item.event_name || 'Saved Location';
        const address = item.address || '';
        const category = item.category || '';

        // Format date and time
        let dateTimeStr = '';
        if (item.event_date) {
          const date = new Date(item.event_date + 'T00:00:00');
          dateTimeStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          // Add time if available
          if (item.start_time) {
            const [hours, minutes] = item.start_time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            let timeStr = `${displayHour}:${minutes} ${ampm}`;

            // Add end time if available
            if (item.end_time) {
              const [endHours, endMinutes] = item.end_time.split(':');
              const endHour = parseInt(endHours);
              const endAmpm = endHour >= 12 ? 'PM' : 'AM';
              const endDisplayHour = endHour % 12 || 12;
              timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
            }

            dateTimeStr += ` • ${timeStr}`;
          }
        }

        // Store item data for popup access
        const itemData = JSON.stringify(item).replace(/"/g, '&quot;');

        // Create popup HTML matching dashboard style with single-line overflow
        let popupHTML = `
          <div style="padding: 8px; max-width: 250px;">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
              <strong style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${venue}</strong>
              <div onclick="window.showPreviewModal(JSON.parse('${itemData}'))" style="cursor: pointer; font-size: 18px; color: #666; flex-shrink: 0; transition: color 0.2s;" onmouseover="this.style.color='#000'" onmouseout="this.style.color='#666'">↗</div>
            </div>
            ${category ? `<div style="font-size: 11px; color: #666; text-transform: uppercase; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${category}</div>` : ''}
            ${address ? `<div style="margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${address}</div>` : ''}
            ${dateTimeStr ? `<div style="margin-top: 4px; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📅 ${dateTimeStr}</div>` : ''}
            <br>
        `;

        // Add Google Maps link
        const googleMapsQuery = address
          ? encodeURIComponent(address)
          : `${item.latitude},${item.longitude}`;
        popupHTML += `
          <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}"
             target="_blank"
             style="color: #000; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            Open in Google Maps →
          </a>
        `;

        // Add View Post link if URL exists
        if (item.url) {
          popupHTML += `
            <br>
            <a href="${item.url}"
               target="_blank"
               style="color: #000; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              View Post 🔗 Open in New Tab →
            </a>
          `;
        }

        popupHTML += '</div>';

        // Create native MapLibre marker using global maplibregl
        try {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.innerHTML = `
            <svg width="27" height="41" viewBox="0 0 27 41">
              <g fill="#42A746">
                <path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path>
              </g>
              <circle fill="#FFFFFF" cx="13.5" cy="13.5" r="5.5"></circle>
            </svg>
          `;
          el.style.cursor = 'pointer';
          el.style.width = '27px';
          el.style.height = '41px';

          // Use native MapLibre GL JS marker (loaded globally)
          const marker = new maplibregl.Marker(el)
            .setLngLat([item.longitude, item.latitude])
            .addTo(radarMap);

          // Create native MapLibre popup
          const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true,
            maxWidth: '180px',
            offset: 15
          }).setHTML(popupHTML);

          marker.setPopup(popup);

          console.log(`✅ Native marker ${markers.length + 1} added at [${item.longitude}, ${item.latitude}]`);
          markers.push(marker);
        } catch (error) {
          console.error(`❌ Error creating marker ${index + 1}:`, error);
        }
      } else {
        console.log(`Skipping item ${index + 1} - no coordinates`);
      }
    });

    // Auto-zoom to fit all markers
    if (markers.length > 0) {
      console.log(`🗺️ Adjusting map to show ${markers.length} markers...`);

      // Calculate zoom level based on marker spread
      const coordinates = items
        .filter(item => item.latitude && item.longitude)
        .map(item => [item.longitude, item.latitude]);

      if (coordinates.length > 1) {
        // Calculate bounds to determine zoom
        const lngs = coordinates.map(c => c[0]);
        const lats = coordinates.map(c => c[1]);
        const lngSpan = Math.max(...lngs) - Math.min(...lngs);
        const latSpan = Math.max(...lats) - Math.min(...lats);
        const maxSpan = Math.max(lngSpan, latSpan);

        // Adjust zoom based on span (rough approximation)
        let zoom = 13;
        if (maxSpan < 0.01) zoom = 15;
        else if (maxSpan < 0.05) zoom = 13;
        else if (maxSpan < 0.1) zoom = 12;
        else zoom = 11;

        radarMap.setZoom(zoom);
        console.log(`✅ Map zoom set to ${zoom} for span ${maxSpan.toFixed(4)}`);
      }
    } else {
      console.log('No markers to display - items may not have coordinates');
    }
  });
}

function formatEventDate(dateString) {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return null;
  }
}

// Removed edit order functionality

// Calendar rendering
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function renderCalendar() {
  const calendarView = document.getElementById('calendar-view');

  // Filter items with dates (using filtered items)
  const filteredItems = getFilteredItems();
  const itemsWithDates = filteredItems.filter(item => item.event_date);

  if (itemsWithDates.length === 0) {
    calendarView.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #000;">No Events Scheduled</h2>
      <p style="color: #666; font-size: 16px;">Events with dates will appear here</p>
    `;
    return;
  }

  // Group items by date and store globally for calendar clicks
  window.calendarItemsByDate = {};
  itemsWithDates.forEach(item => {
    const dateKey = item.event_date.split('T')[0];
    if (!window.calendarItemsByDate[dateKey]) {
      window.calendarItemsByDate[dateKey] = [];
    }
    window.calendarItemsByDate[dateKey].push(item);
  });

  const itemsByDate = window.calendarItemsByDate;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const prevLastDay = new Date(currentCalendarYear, currentCalendarMonth, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  let calendarHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <button onclick="changeCalendarMonth(-1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">‹ Prev</button>
      <h2 style="margin: 0; font-size: 20px;">${monthNames[currentCalendarMonth]} ${currentCalendarYear}</h2>
      <button onclick="changeCalendarMonth(1)" style="background: #f5f5f5; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">Next ›</button>
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

  // Previous month trailing days
  for (let i = firstDayIndex; i > 0; i--) {
    calendarHTML += `
      <div class="calendar-day-cell other-month">
        <div class="calendar-day-number">${prevLastDate - i + 1}</div>
      </div>
    `;
  }

  // Current month days
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= lastDateOfMonth; day++) {
    const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const hasItems = itemsByDate[dateStr];

    // Always show the first item's name, even if there are multiple
    const itemName = hasItems
      ? (hasItems[0].event_name || hasItems[0].venue_name || 'Event')
      : '';

    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasItems) classes += ' has-events';

    calendarHTML += `
      <div class="${classes}" ${hasItems ? `onclick="showItemsForDate('${dateStr}')"` : ''}>
        <div class="calendar-day-number">${day}</div>
        ${hasItems ? `<div class="calendar-day-saves">${itemName}</div>` : ''}
      </div>
    `;
  }

  calendarHTML += '</div>';
  calendarView.innerHTML = calendarHTML;
}

function changeCalendarMonth(direction) {
  currentCalendarMonth += direction;

  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  } else if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }

  renderCalendar();
}

// Make function globally accessible
window.changeCalendarMonth = changeCalendarMonth;

// Show items for a specific date
function showItemsForDate(dateStr) {
  const itemsForDate = window.calendarItemsByDate[dateStr];

  if (!itemsForDate || itemsForDate.length === 0) return;

  // If only one item, show details directly
  if (itemsForDate.length === 1) {
    showPreviewModal(itemsForDate[0]);
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

  // Show list of items for this date
  const modal = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('preview-modal-title');
  const modalBody = document.getElementById('preview-modal-body');

  modalTitle.textContent = dateFormatted;

  // Sort by start_time (earliest first)
  const sortedItems = [...itemsForDate].sort((a, b) => {
    const timeA = a.start_time || '23:59';
    const timeB = b.start_time || '23:59';
    return timeA.localeCompare(timeB);
  });

  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
  sortedItems.forEach((item, index) => {
    // Format time if available
    let timeStr = '';
    if (item.start_time) {
      const [hours, minutes] = item.start_time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let formattedTime = `${displayHour}:${minutes} ${ampm}`;

      // Add end time if available
      if (item.end_time) {
        const [endHours, endMinutes] = item.end_time.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour % 12 || 12;
        formattedTime += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
      }

      // Add timezone abbreviation if available
      if (item.timezone) {
        const tzMap = {
          'Pacific/Midway': 'SST', 'Pacific/Honolulu': 'HST', 'America/Anchorage': 'AKST',
          'America/Los_Angeles': 'PST', 'America/Denver': 'MST', 'America/Phoenix': 'MST',
          'America/Chicago': 'CST', 'America/New_York': 'EST', 'America/Caracas': 'VET',
          'America/Halifax': 'AST', 'America/St_Johns': 'NST', 'America/Argentina/Buenos_Aires': 'ART',
          'America/Sao_Paulo': 'BRT', 'Atlantic/Azores': 'AZOT', 'Atlantic/Cape_Verde': 'CVT',
          'Europe/London': 'GMT', 'Europe/Paris': 'CET', 'Europe/Berlin': 'CET',
          'Europe/Athens': 'EET', 'Africa/Cairo': 'EET', 'Africa/Johannesburg': 'SAST',
          'Europe/Moscow': 'MSK', 'Asia/Dubai': 'GST', 'Asia/Karachi': 'PKT',
          'Asia/Kolkata': 'IST', 'Asia/Dhaka': 'BST', 'Asia/Bangkok': 'ICT',
          'Asia/Singapore': 'SGT', 'Asia/Hong_Kong': 'HKT', 'Asia/Shanghai': 'CST',
          'Asia/Tokyo': 'JST', 'Asia/Seoul': 'KST', 'Australia/Sydney': 'AEDT',
          'Australia/Adelaide': 'ACDT', 'Pacific/Auckland': 'NZDT', 'Pacific/Fiji': 'FJT'
        };
        const tzAbbr = tzMap[item.timezone];
        if (tzAbbr) formattedTime += ` ${tzAbbr}`;
      }

      timeStr = `<div style="font-size: 14px; color: #666; margin-bottom: 4px;">🕐 ${formattedTime}</div>`;
    }

    // Store the item in a temporary global for the click handler
    const itemIndex = `dateItem_${dateStr}_${index}`;
    window[itemIndex] = item;

    html += `
      <div onclick="showPreviewModal(window['${itemIndex}'])" style="padding: 16px; background: #f9f9f9; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
        ${timeStr}
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${item.event_name || item.venue_name || 'Untitled'}</div>
        ${item.address ? `<div style="font-size: 14px; color: #666;">📍 ${item.address}</div>` : ''}
        ${item.category ? `<div style="font-size: 12px; color: #666; text-transform: uppercase; margin-top: 4px;">${item.category}</div>` : ''}
      </div>
    `;
  });
  html += '</div>';

  modalBody.innerHTML = html;
  modal.classList.add('active');
}

// Make function globally accessible
window.showItemsForDate = showItemsForDate;

// Show preview modal - Match Dashboard Style
function showPreviewModal(item) {
  const modal = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('preview-modal-title');
  const modalBody = document.getElementById('preview-modal-body');

  const venue = item.venue_name || item.event_name || 'Saved Location';
  const address = item.address || '';
  const category = item.category || '';

  // Set title
  modalTitle.textContent = venue;

  // Format date and time
  let dateTimeStr = '';
  if (item.event_date) {
    const date = new Date(item.event_date + 'T00:00:00');
    dateTimeStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Add time if available
    if (item.start_time) {
      const [hours, minutes] = item.start_time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      let timeStr = `${displayHour}:${minutes} ${ampm}`;

      // Add end time if available
      if (item.end_time) {
        const [endHours, endMinutes] = item.end_time.split(':');
        const endHour = parseInt(endHours);
        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
        const endDisplayHour = endHour % 12 || 12;
        timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
      }

      // Add timezone abbreviation if available
      if (item.timezone) {
        const tzMap = {
          'Pacific/Midway': 'SST', 'Pacific/Honolulu': 'HST', 'America/Anchorage': 'AKST',
          'America/Los_Angeles': 'PST', 'America/Denver': 'MST', 'America/Phoenix': 'MST',
          'America/Chicago': 'CST', 'America/New_York': 'EST', 'America/Caracas': 'VET',
          'America/Halifax': 'AST', 'America/St_Johns': 'NST', 'America/Argentina/Buenos_Aires': 'ART',
          'America/Sao_Paulo': 'BRT', 'Atlantic/Azores': 'AZOT', 'Atlantic/Cape_Verde': 'CVT',
          'Europe/London': 'GMT', 'Europe/Paris': 'CET', 'Europe/Berlin': 'CET',
          'Europe/Athens': 'EET', 'Africa/Cairo': 'EET', 'Africa/Johannesburg': 'SAST',
          'Europe/Moscow': 'MSK', 'Asia/Dubai': 'GST', 'Asia/Karachi': 'PKT',
          'Asia/Kolkata': 'IST', 'Asia/Dhaka': 'BST', 'Asia/Bangkok': 'ICT',
          'Asia/Singapore': 'SGT', 'Asia/Hong_Kong': 'HKT', 'Asia/Shanghai': 'CST',
          'Asia/Tokyo': 'JST', 'Asia/Seoul': 'KST', 'Australia/Sydney': 'AEDT',
          'Australia/Adelaide': 'ACDT', 'Pacific/Auckland': 'NZDT', 'Pacific/Fiji': 'FJT'
        };
        const tzAbbr = tzMap[item.timezone];
        if (tzAbbr) timeStr += ` ${tzAbbr}`;
      }

      dateTimeStr += ` • ${timeStr}`;
    }
  }

  // Build modal HTML - matching dashboard structure
  let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';

  if (category) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Category</div>
      <div style="font-size: 16px;">${category}</div>
    </div>`;
  }

  if (address) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Location</div>
      <div style="font-size: 16px;">📍 ${address}</div>
    </div>`;
  }

  if (dateTimeStr) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Date & Time</div>
      <div style="font-size: 16px;">📅 ${dateTimeStr}</div>
    </div>`;
  }

  // Add Google Maps link
  if (address || (item.latitude && item.longitude)) {
    const googleMapsQuery = address
      ? encodeURIComponent(address)
      : `${item.latitude},${item.longitude}`;
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Map</div>
      <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}"
         target="_blank"
         style="font-size: 16px; color: #000; text-decoration: underline;">
        🔗 Open in Google Maps
      </a>
    </div>`;
  }

  // Add View Post link if URL exists
  if (item.url) {
    html += `<div>
      <div style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; margin-bottom: 4px;">Post</div>
      <a href="${item.url}"
         target="_blank"
         style="font-size: 16px; color: #000; text-decoration: underline;">
        🔗 Open in New Tab
      </a>
    </div>`;
  }

  html += '</div>';

  modalBody.innerHTML = html;
  modal.classList.add('active');
}

// Close preview modal
function closePreviewModal() {
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('active');
}

// Make functions globally accessible
window.showPreviewModal = showPreviewModal;
window.closePreviewModal = closePreviewModal;

// Tab Switching
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');

      // Update map with filtered items when switching to map tab
      if (targetTab === 'map') {
        initializeRadarMap(getFilteredItems());
      }

      // Render calendar or map when switching tabs
      if (targetTab === 'calendar') {
        renderCalendar();
      } else if (targetTab === 'map') {
        initializeRadarMap(getFilteredItems());
      }
    });
  });
}

// Initialize menu dropdown
function initializeMenuDropdown() {
  const menuBtn = document.getElementById('share-menu-btn');
  const menuDropdown = document.getElementById('share-menu-dropdown');

  if (!menuBtn || !menuDropdown) return;

  // Toggle dropdown on button click
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove('show');
    }
  });
}

// Initialize preview modal
function initializePreviewModal() {
  const modal = document.getElementById('preview-modal');

  // Close on overlay click (click outside modal content)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePreviewModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closePreviewModal();
    }
  });
}

// Load when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadSharedList();
    initializeTabs();
    initializeMenuDropdown();
    initializePreviewModal();
  });
} else {
  loadSharedList();
  initializeTabs();
  initializeMenuDropdown();
  initializePreviewModal();
}
