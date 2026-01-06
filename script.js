// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const searchInput = document.getElementById('searchInput');
const clearSearchButton = document.getElementById('clearSearch');

// BL Data Storage
let blData = { upcoming: [], current: [] };
let activeTab = 'upcoming';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadBLData();
  setupEventListeners();
});

// Load BL data from JSON file
async function loadBLData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data');
    
    blData = await response.json();
    displayBLs(blData.upcoming, 'upcoming-list');
  } catch (error) {
    console.error('Error loading BL data:', error);
    showError('Failed to load BL data. Please try refreshing the page.');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });

  // Search functionality
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filterAndDisplayBLs(searchTerm);
  });

  // Clear search
  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    filterAndDisplayBLs('');
  });

  // Show clear button when typing
  searchInput.addEventListener('input', function() {
    clearSearchButton.style.display = this.value ? 'block' : 'none';
  });
}

// Switch between tabs
function switchTab(tabId) {
  // Update active tab button
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });

  // Show active tab content
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });

  activeTab = tabId;
  
  // Apply search filter to newly active tab
  const searchTerm = searchInput.value.toLowerCase().trim();
  filterAndDisplayBLs(searchTerm);
}

// Filter and display BLs based on search
function filterAndDisplayBLs(searchTerm) {
  const listId = `${activeTab}-list`;
  const data = blData[activeTab];
  
  if (!searchTerm) {
    displayBLs(data, listId);
    return;
  }

  const filteredData = data.filter(bl => 
    bl.title.toLowerCase().includes(searchTerm) ||
    bl.description.toLowerCase().includes(searchTerm) ||
    bl.genre.toLowerCase().includes(searchTerm)
  );

  displayBLs(filteredData, listId, searchTerm);
}

// Display BLs in the specified container
function displayBLs(bls, containerId, searchTerm = '') {
  const container = document.getElementById(containerId);
  
  if (!bls || bls.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>${searchTerm ? 'No matching BL series found' : 'No BL series available'}</h3>
        <p>${searchTerm ? 'Try a different search term' : 'Check back soon for updates'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bls.map(bl => createBLCard(bl, activeTab)).join('');
}

// Create BL card HTML
function createBLCard(bl, type) {
  const status = type === 'upcoming' ? 'Upcoming' : 'Currently Airing';
  const statusClass = type === 'upcoming' ? 'status-upcoming' : 'status-airing';
  
  return `
    <div class="bl-card">
      <div class="bl-image-container">
        <img src="${bl.image}" alt="${bl.title}" class="bl-image" onerror="this.src='https://via.placeholder.com/400x250/764ba2/ffffff?text=No+Image'">
      </div>
      <div class="bl-content">
        <h3 class="bl-title">${bl.title}</h3>
        <div class="bl-info">
          <span><i class="fas fa-calendar"></i> ${type === 'upcoming' ? 'Release:' : 'Airing:'} ${bl.date}</span>
          <span><i class="fas fa-film"></i> ${bl.episodes || 'TBA'}</span>
        </div>
        <p class="bl-description">${bl.description}</p>
        <div class="bl-info">
          <span><i class="fas fa-tags"></i> ${bl.genre}</span>
          <span><i class="fas fa-globe"></i> ${bl.country}</span>
        </div>
        <div style="margin-top: 15px;">
          <span class="bl-status ${statusClass}">${status}</span>
          ${bl.airingDay ? `<span style="margin-left: 10px;"><i class="fas fa-clock"></i> ${bl.airingDay}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Show error message
function showError(message) {
  const containers = ['upcoming-list', 'current-list'];
  
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Data</h3>
          <p>${message}</p>
        </div>
      `;
    }
  });
}
