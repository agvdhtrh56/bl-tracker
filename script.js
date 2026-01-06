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
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
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
    loadBLsToGrid(blData.airing, 'airing-bl-list', 'airing');
    
    // Setup day filter (airing days)
    setupDayFilter();
    
    // Setup airing calendar
    setupAiringCalendar();
    
    // Setup episode tracker
    setupEpisodeTracker();
}

// Load completed page
function loadCompletedPage() {
    console.log('Loading completed page');
    
    // Update total count
    document.getElementById('total-completed')?.textContent = blData.completed.length;
    
    // Load all completed BLs
    loadBLsToGrid(blData.completed, 'completed-bl-list', 'completed');
    
    // Setup year filter for completed
    setupCompletedYearFilter();
    
    // Setup rating filter
    setupRatingFilter();
}

// Load BLs to grid
function loadBLsToGrid(bls, containerId, type = 'general') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!bls || bls.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No BL series found</h3>
                <p>Check back soon for updates</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bls.map(bl => createBLCard(bl, type)).join('');
    
    // Add event listeners to cards
    addCardEventListeners();
}

// Create BL card HTML
function createBLCard(bl, type) {
    const statusClass = getStatusClass(type);
    const statusText = getStatusText(type);
    
    return `
        <div class="bl-card" data-id="${bl.id || ''}" data-country="${bl.country || ''}" data-genre="${bl.genre || ''}">
            <div class="bl-image-container">
                <img src="${bl.image || 'https://via.placeholder.com/300x200/764ba2/ffffff?text=No+Image'}" 
                     alt="${bl.title}" 
                     class="bl-image"
                     onerror="this.src='https://via.placeholder.com/300x200/764ba2/ffffff?text=Image+Error'">
                ${bl.trailer ? `<div class="trailer-indicator"><i class="fas fa-play"></i></div>` : ''}
            </div>
            <div class="bl-content">
                <h3 class="bl-title">${bl.title}</h3>
                <div class="bl-meta">
                    <span class="bl-country"><i class="fas fa-globe"></i> ${bl.country || 'Unknown'}</span>
                    <span class="bl-genre"><i class="fas fa-tag"></i> ${bl.genre || 'Romance'}</span>
                </div>
                
                <div class="bl-dates">
                    ${type === 'upcoming' ? `
                        <span class="date-item"><i class="fas fa-calendar"></i> ${formatDate(bl.releaseDate)}</span>
                        <span class="date-item"><i class="fas fa-clock"></i> ${bl.episodes || 'TBA'} eps</span>
                    ` : ''}
                    
                    ${type === 'airing' ? `
                        <span class="date-item"><i class="fas fa-calendar-day"></i> ${bl.airingDay || 'Weekly'}</span>
                        <span class="date-item"><i class="fas fa-tv"></i> ${bl.currentEpisode || '0'}/${bl.totalEpisodes || '?'}</span>
                    ` : ''}
                    
                    ${type === 'completed' ? `
                        <span class="date-item"><i class="fas fa-calendar-check"></i> ${bl.completedDate || '2024'}</span>
                        ${bl.rating ? `<span class="rating-stars">${generateStars(bl.rating)}</span>` : ''}
                    ` : ''}
                </div>
                
                <p class="bl-description">${bl.description || 'No description available.'}</p>
                
                <div class="bl-footer">
                    <span class="bl-status ${statusClass}">${statusText}</span>
                    <div class="bl-actions">
                        ${bl.officialLink ? `<a href="${bl.officialLink}" target="_blank" class="btn-link"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        ${bl.trailer ? `<button class="btn-trailer" data-trailer="${bl.trailer}"><i class="fas fa-play-circle"></i></button>` : ''}
                        <button class="btn-favorite" data-id="${bl.id || ''}"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getStatusClass(type) {
    switch(type) {
        case 'upcoming': return 'status-upcoming';
        case 'airing': return 'status-airing';
        case 'completed': return 'status-completed';
        default: return 'status-general';
    }
}

function getStatusText(type) {
    switch(type) {
        case 'upcoming': return 'Upcoming';
        case 'airing': return 'Airing Now';
        case 'completed': return 'Completed';
        default: return 'Series';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'TBA';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateString;
    }
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

// Add event listeners to cards
function addCardEventListeners() {
    // Trailer buttons
    document.querySelectorAll('.btn-trailer').forEach(button => {
        button.addEventListener('click', function() {
            const trailerUrl = this.dataset.trailer;
            openTrailerModal(trailerUrl);
        });
    });
    
    // Favorite buttons
    document.querySelectorAll('.btn-favorite').forEach(button => {
        button.addEventListener('click', function() {
            const blId = this.dataset.id;
            toggleFavorite(blId, this);
        });
    });
    
    // Card click for details
    document.querySelectorAll('.bl-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or links
            if (!e.target.closest('.btn-trailer') && 
                !e.target.closest('.btn-favorite') && 
                !e.target.closest('a')) {
                const blId = this.dataset.id;
                showBLDetails(blId);
            }
        });
    });
}

// Filter functions
function filterByCountry(country) {
    const activeTab = getActiveTab();
    let filteredData = [];
    
    switch(activeTab) {
        case 'upcoming':
            filteredData = country === 'all' 
                ? blData.upcoming 
                : blData.upcoming.filter(bl => bl.country === country);
            loadBLsToGrid(filteredData, 'upcoming-bl-list', 'upcoming');
            break;
        case 'airing':
            filteredData = country === 'all' 
                ? blData.airing 
                : blData.airing.filter(bl => bl.country === country);
            loadBLsToGrid(filteredData, 'airing-bl-list', 'airing');
            break;
        case 'completed':
            filteredData = country === 'all' 
                ? blData.completed 
                : blData.completed.filter(bl => bl.country === country);
            loadBLsToGrid(filteredData, 'completed-bl-list', 'completed');
            break;
    }
    
    updateFilterCount(filteredData.length);
}

function searchBLs(searchTerm) {
    const activeTab = getActiveTab();
    let dataToSearch = [];
    let containerId = '';
    
    switch(activeTab) {
        case 'upcoming':
            dataToSearch = blData.upcoming;
            containerId = 'upcoming-bl-list';
            break;
        case 'airing':
            dataToSearch = blData.airing;
            containerId = 'airing-bl-list';
            break;
        case 'completed':
            dataToSearch = blData.completed;
            containerId = 'completed-bl-list';
            break;
        default:
            return;
    }
    
    if (!searchTerm.trim()) {
        loadBLsToGrid(dataToSearch, containerId, activeTab);
        return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = dataToSearch.filter(bl => 
        bl.title.toLowerCase().includes(lowerSearchTerm) ||
        bl.description.toLowerCase().includes(lowerSearchTerm) ||
        bl.genre.toLowerCase().includes(lowerSearchTerm) ||
        (bl.cast && bl.cast.toLowerCase().includes(lowerSearchTerm))
    );
    
    loadBLsToGrid(filtered, containerId, activeTab);
    updateFilterCount(filtered.length);
}

// Setup filter functions
function setupYearFilter() {
    const yearFilter = document.getElementById('year-filter');
    if (!yearFilter) return;
    
    // Get unique years from upcoming BLs
    const years = [...new Set(blData.upcoming
        .map(bl => new Date(bl.releaseDate).getFullYear())
        .filter(year => !isNaN(year))
        .sort()
    )];
    
    // Add "All Years" option
    years.unshift('All Years');
    
    // Populate dropdown
    yearFilter.innerHTML = years.map(year => 
        `<option value="${year}">${year}</option>`
    ).join('');
    
    yearFilter.addEventListener('change', function() {
        const selectedYear = this.value;
        if (selectedYear === 'All Years') {
            loadBLsToGrid(blData.upcoming, 'upcoming-bl-list', 'upcoming');
        } else {
            const filtered = blData.upcoming.filter(bl => {
                const year = new Date(bl.releaseDate).getFullYear();
                return year.toString() === selectedYear;
            });
            loadBLsToGrid(filtered, 'upcoming-bl-list', 'upcoming');
        }
    });
}

function setupMonthFilter() {
    const monthFilter = document.getElementById('month-filter');
    if (!monthFilter) return;
    
    const months = [
        'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    monthFilter.innerHTML = months.map((month, index) => 
        `<option value="${index}">${month}</option>`
    ).join('');
    
    monthFilter.addEventListener('change', function() {
        const selectedMonth = parseInt(this.value);
        if (selectedMonth === 0) {
            loadBLsToGrid(blData.upcoming, 'upcoming-bl-list', 'upcoming');
        } else {
            const filtered = blData.upcoming.filter(bl => {
                const month = new Date(bl.releaseDate).getMonth() + 1;
                return month === selectedMonth;
            });
            loadBLsToGrid(filtered, 'upcoming-bl-list', 'upcoming');
        }
    });
}

function setupDayFilter() {
    const dayFilter = document.getElementById('day-filter');
    if (!dayFilter) return;
    
    const days = ['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayFilter.innerHTML = days.map(day => 
        `<option value="${day}">${day}</option>`
    ).join('');
    
    dayFilter.addEventListener('change', function() {
        const selectedDay = this.value;
        if (selectedDay === 'All Days') {
            loadBLsToGrid(blData.airing, 'airing-bl-list', 'airing');
        } else {
            const filtered = blData.airing.filter(bl => 
                bl.airingDay && bl.airingDay.toLowerCase() === selectedDay.toLowerCase()
            );
            loadBLsToGrid(filtered, 'airing-bl-list', 'airing');
        }
    });
}

function setupCompletedYearFilter() {
    const yearFilter = document.getElementById('completed-year-filter');
    if (!yearFilter) return;
    
    const years = [...new Set(blData.completed
        .map(bl => new Date(bl.completedDate).getFullYear())
        .filter(year => !isNaN(year))
        .sort((a, b) => b - a) // Most recent first
    )];
    
    years.unshift('All Years');
    
    yearFilter.innerHTML = years.map(year => 
        `<option value="${year}">${year}</option>`
    ).join('');
    
    yearFilter.addEventListener('change', function() {
        const selectedYear = this.value;
        if (selectedYear === 'All Years') {
            loadBLsToGrid(blData.completed, 'completed-bl-list', 'completed');
        } else {
            const filtered = blData.completed.filter(bl => {
                const year = new Date(bl.completedDate).getFullYear();
                return year.toString() === selectedYear;
            });
            loadBLsToGrid(filtered, 'completed-bl-list', 'completed');
        }
    });
}

function setupRatingFilter() {
    const ratingFilter = document.getElementById('rating-filter');
    if (!ratingFilter) return;
    
    const ratings = [
        { value: 'all', text: 'All Ratings' },
        { value: '4.5', text: '4.5+ Stars' },
        { value: '4.0', text: '4.0+ Stars' },
        { value: '3.5', text: '3.5+ Stars' },
        { value: '3.0', text: '3.0+ Stars' }
    ];
    
    ratingFilter.innerHTML = ratings.map(rating => 
        `<option value="${rating.value}">${rating.text}</option>`
    ).join('');
    
    ratingFilter.addEventListener('change', function() {
        const minRating = parseFloat(this.value);
        if (isNaN(minRating)) {
            loadBLsToGrid(blData.completed, 'completed-bl-list', 'completed');
        } else {
            const filtered = blData.completed.filter(bl => 
                bl.rating && bl.rating >= minRating
            );
            loadBLsToGrid(filtered, 'completed-bl-list', 'completed');
        }
    });
}

function setupSorting() {
    const sortSelect = document.getElementById('sort-by');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        let sortedData = [...blData.upcoming];
        
        switch(sortBy) {
            case 'date-asc':
                sortedData.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
                break;
            case 'date-desc':
                sortedData.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
                break;
            case 'title-asc':
                sortedData.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                sortedData.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        
        loadBLsToGrid(sortedData, 'upcoming-bl-list', 'upcoming');
    });
}

// Calendar setup
function setupCalendar() {
    // Simple calendar for upcoming releases
    const calendarContainer = document.getElementById('calendar-view');
    if (!calendarContainer) return;
    
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Filter upcoming releases for next month
    const nextMonthReleases = blData.upcoming.filter(bl => {
        const releaseDate = new Date(bl.releaseDate);
        return releaseDate.getMonth() === nextMonth.getMonth() &&
               releaseDate.getFullYear() === nextMonth.getFullYear();
    });
    
    if (nextMonthReleases.length > 0) {
        calendarContainer.innerHTML = `
            <h4>${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Releases</h4>
            <div class="calendar-grid">
                ${nextMonthReleases.map(bl => `
                    <div class="calendar-item">
                        <span class="calendar-date">${new Date(bl.releaseDate).getDate()}</span>
                        <span class="calendar-title">${bl.title}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function setupAiringCalendar() {
    const calendarContainer = document.getElementById('airing-calendar');
    if (!calendarContainer) return;
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Group airing BLs by day
    const byDay = {};
    daysOfWeek.forEach(day => byDay[day] = []);
    
    blData.airing.forEach(bl => {
        if (bl.airingDay && daysOfWeek.includes(bl.airingDay)) {
            byDay[bl.airingDay].push(bl);
        }
    });
    
    calendarContainer.innerHTML = `
        <h4>Weekly Schedule</h4>
        <div class="weekly-schedule">
            ${daysOfWeek.map(day => `
                <div class="day-column ${byDay[day].length > 0 ? 'has-shows' : ''}">
                    <h5>${day}</h5>
                    ${byDay[day].map(bl => `
                        <div class="schedule-item">
                            <span class="show-time">${bl.airingTime || 'Time TBA'}</span>
                            <span class="show-title">${bl.title}</span>
                            <span class="show-episode">Ep ${bl.currentEpisode || '0'}/${bl.totalEpisodes || '?'}</span>
                        </div>
                    `).join('')}
                    ${byDay[day].length === 0 ? '<span class="no-shows">No shows</span>' : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Episode tracker
function setupEpisodeTracker() {
    const trackerContainer = document.getElementById('episode-tracker');
    if (!trackerContainer) return;
    
    // Get BLs that are currently airing and have episode info
    const trackableBLs = blData.airing.filter(bl => 
        bl.currentEpisode && bl.totalEpisodes
    );
    
    if (trackableBLs.length > 0) {
        trackerContainer.innerHTML = `
            <h4>Episode Progress</h4>
            <div class="progress-grid">
                ${trackableBLs.map(bl => {
                    const progress = Math.round((bl.currentEpisode / bl.totalEpisodes) * 100);
                    return `
                        <div class="progress-item">
                            <div class="progress-header">
                                <span class="progress-title">${bl.title}</span>
                                <span class="progress-text">${bl.currentEpisode}/${bl.totalEpisodes}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

// Modal functions
function openTrailerModal(trailerUrl) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    
    if (modal && iframe) {
        // Extract YouTube ID from various URL formats
        let videoId = trailerUrl;
        if (trailerUrl.includes('youtu.be/')) {
            videoId = trailerUrl.split('youtu.be/')[1];
        } else if (trailerUrl.includes('youtube.com/watch?v=')) {
            videoId = trailerUrl.split('v=')[1];
        }
        
        // Clean up any additional parameters
        videoId = videoId.split('&')[0];
        
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function showBLDetails(blId) {
    // Find BL in any category
    const allBLs = [...blData.upcoming, ...blData.airing, ...blData.completed];
    const bl = allBLs.find(item => item.id === blId);
    
    if (!bl) return;
    
    const modal = document.getElementById('details-modal');
    const content = document.getElementById('details-content');
    
    if (modal && content) {
        content.innerHTML = `
            <div class="details-header">
                <h2>${bl.title}</h2>
                <span class="details-country">${bl.country || 'Unknown'}</span>
            </div>
            
            <div class="details-main">
                <img src="${bl.image || 'https://via.placeholder.com/400x250/764ba2/ffffff?text=No+Image'}" 
                     alt="${bl.title}" 
                     class="details-image">
                
                <div class="details-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Release: ${formatDate(bl.releaseDate || bl.completedDate)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tv"></i>
                            <span>Episodes: ${bl.episodes || bl.totalEpisodes || 'TBA'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <span>Genre: ${bl.genre || 'Romance'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-star"></i>
                            <span>Rating: ${bl.rating ? `${bl.rating}/5` : 'Not rated'}</span>
                        </div>
                    </div>
                    
                    <div class="details-description">
                        <h4>Description</h4>
                        <p>${bl.description || 'No description available.'}</p>
                    </div>
                    
                    ${bl.cast ? `
                        <div class="details-cast">
                            <h4>Cast</h4>
                            <p>${bl.cast}</p>
                        </div>
                    ` : ''}
                    
                    <div class="details-actions">
                        ${bl.officialLink ? `
                            <a href="${bl.officialLink}" target="_blank" class="btn-action">
                                <i class="fas fa-external-link-alt"></i> Official Site
                            </a>
                        ` : ''}
                        
                        ${bl.trailer ? `
                            <button class="btn-action btn-trailer-action" data-trailer="${bl.trailer}">
                                <i class="fas fa-play-circle"></i> Watch Trailer
                            </button>
                        ` : ''}
                        
                        <button class="btn-action btn-favorite-action" data-id="${bl.id}">
                            <i class="far fa-heart"></i> Add to Favorites
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add event listeners to modal buttons
        const trailerBtn = content.querySelector('.btn-trailer-action');
        if (trailerBtn) {
            trailerBtn.addEventListener('click', () => {
                closeAllModals();
                openTrailerModal(trailerBtn.dataset.trailer);
            });
        }
        
        const favoriteBtn = content.querySelector('.btn-favorite-action');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                toggleFavorite(favoriteBtn.dataset.id, favoriteBtn);
            });
        }
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Stop any playing videos
    const iframe = document.getElementById('trailer-iframe');
    if (iframe) {
        iframe.src = '';
    }
    
    document.body.style.overflow = 'auto';
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeAllModals();
        }
    });
});

// Favorite functionality
function toggleFavorite(blId, button) {
    let favorites = JSON.parse(localStorage.getItem('bl-favorites')) || [];
    
    const index = favorites.indexOf(blId);
    const icon = button.querySelector('i');
    
    if (index === -1) {
        // Add to favorites
        favorites.push(blId);
        icon.className = 'fas fa-heart';
        showNotification('Added to favorites!', 'success');
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        icon.className = 'far fa-heart';
        showNotification('Removed from favorites', 'info');
    }
    
    localStorage.setItem('bl-favorites', JSON.stringify(favorites));
    
    // Update favorite count in header if exists
    const favoriteCount = document.getElementById('favorite-count');
    if (favoriteCount) {
        favoriteCount.textContent = favorites.length;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Close button
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Update last updated time
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Get active tab
function getActiveTab() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    switch(filename) {
        case 'upcoming.html': return 'upcoming';
        case 'airing.html': return 'airing';
        case 'completed.html': return 'completed';
        default: return 'home';
    }
}

// Update filter count
function updateFilterCount(count) {
    const filterCountElement = document.getElementById('filter-count');
    if (filterCountElement) {
        filterCountElement.textContent = `${count} series`;
    }
}

// Error handling
function showError(message) {
    console.error(message);
    
    // Show error on page if error container exists
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-retry">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
    
    // Also show notification
    showNotification('Error loading data. Please try again.', 'error');
}

// Export to CSV (bonus feature)
function exportToCSV() {
    const activeTab = getActiveTab();
    let dataToExport = [];
    
    switch(activeTab) {
        case 'upcoming':
            dataToExport = blData.upcoming;
            break;
        case 'airing':
            dataToExport = blData.airing;
            break;
        case 'completed':
            dataToExport = blData.completed;
            break;
        default:
            dataToExport = [...blData.upcoming, ...blData.airing, ...blData.completed];
    }
    
    if (dataToExport.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    // Create CSV content
    const headers = ['Title', 'Country', 'Genre', 'Release Date', 'Episodes', 'Status', 'Description'];
    const rows = dataToExport.map(bl => [
        `"${bl.title}"`,
        `"${bl.country || ''}"`,
        `"${bl.genre || ''}"`,
        `"${formatDate(bl.releaseDate || bl.completedDate)}"`,
        `"${bl.episodes || bl.totalEpisodes || ''}"`,
        `"${getStatusText(activeTab === 'home' ? 'general' : activeTab)}"`,
        `"${(bl.description || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bl-tracker-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${dataToExport.length} series to CSV`, 'success');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Close modals with Escape
    if (event.key === 'Escape') {
        closeAllModals();
    }
    
    // Search focus with Ctrl+F
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Export with Ctrl+E
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        exportToCSV();
    }
});

// Initialize favorite count on page load
window.addEventListener('load', function() {
    const favorites = JSON.parse(localStorage.getItem('bl-favorites')) || [];
    const favoriteCount = document.getElementById('favorite-count');
    if (favoriteCount) {
        favoriteCount.textContent = favorites.length;
    }
});
