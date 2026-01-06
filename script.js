// Main JavaScript for BL Tracker

// Global data storage
let blData = {
    upcoming: [],
    airing: [],
    completed: []
};

// Initialize the site
document.addEventListener('DOMContentLoaded', function() {
    console.log('BL Tracker initialized');
    loadBLData();
    
    // Setup event listeners for common elements
    setupCommonEventListeners();
});

// Load BL data from JSON file
async function loadBLData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load BL data');
        }
        
        const data = await response.json();
        blData = data;
        
        console.log('BL data loaded:', {
            upcoming: blData.upcoming.length,
            airing: blData.airing.length,
            completed: blData.completed.length
        });
        
        // Update last updated time
        updateLastUpdated();
        
        // Initialize page based on current URL
        initializePage();
        
    } catch (error) {
        console.error('Error loading BL data:', error);
        showError('Failed to load BL data. Please try refreshing the page.');
    }
}

// Setup common event listeners
function setupCommonEventListeners() {
    // Country filter buttons
    document.querySelectorAll('.country-btn').forEach(button => {
        button.addEventListener('click', function() {
            const country = this.dataset.country;
            filterByCountry(country);
        });
    });
    
    // Search functionality
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            searchBLs(this.value);
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

// Initialize page based on URL
function initializePage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    switch(filename) {
        case 'index.html':
        case '':
            loadHomepageData();
            break;
        case 'upcoming.html':
            loadUpcomingPage();
            break;
        case 'airing.html':
            loadAiringPage();
            break;
        case 'completed.html':
            loadCompletedPage();
            break;
        default:
            loadHomepageData();
    }
}

// Load homepage data
function loadHomepageData() {
    console.log('Loading homepage data');
    
    // Update counts
    document.getElementById('upcoming-count').textContent = blData.upcoming.length;
    document.getElementById('airing-count').textContent = blData.airing.length;
    document.getElementById('completed-count').textContent = blData.completed.length;
    
    // Load featured BLs (mix of upcoming and airing)
    const featured = [...blData.upcoming.slice(0, 3), ...blData.airing.slice(0, 3)];
    loadBLsToGrid(featured, 'featured-grid');
    
    // Load upcoming BLs
    loadBLsToGrid(blData.upcoming.slice(0, 6), 'upcoming-grid');
    
    // Load airing BLs
    loadBLsToGrid(blData.airing.slice(0, 6), 'airing-grid');
}

// Load upcoming page
function loadUpcomingPage() {
    console.log('Loading upcoming page');
    
    // Update total count
    document.getElementById('total-upcoming').textContent = blData.upcoming.length;
    
    // Load all upcoming BLs
    loadBLsToGrid(blData.upcoming, 'upcoming-bl-list', 'upcoming');
    
    // Setup year filter
    setupYearFilter();
    
    // Setup month filter
    setupMonthFilter();
    
    // Setup calendar
    setupCalendar();
    
    // Setup sort functionality
    setupSorting();
}

// Load airing page
function loadAiringPage() {
    console.log('Loading airing page');
    
    // Update total count
    document.getElementById('total-airing')?.textContent = blData.airing.length;
    
    // Load all airing BLs
    loadBLsToGrid(blData.airing
