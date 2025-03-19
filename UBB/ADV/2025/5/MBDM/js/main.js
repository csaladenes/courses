/**
 * Main JavaScript file for Wheat Price Visualization
 */

// Global variables
let wheatData = [];

// Use the GLOBAL_EVENTS from config.js instead of redefining them here
// This ensures consistency across the application

// Initialize Select2
$(document).ready(function() {
    $('.select2').select2({
        theme: "classic",
        placeholder: "Select options",
        allowClear: true
    });
    
    // Load data
    loadData();
    
    // Set up event listeners for theme toggle
    setupThemeListeners();
    
    // Set up event listeners for filter changes
    setupFilterListeners();
});

/**
 * Set up event listeners for theme changes
 */
function setupThemeListeners() {
    // Update Select2 theme when the page theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "class") {
                const isDarkTheme = document.body.classList.contains('dark-theme');
                $('.select2').each(function() {
                    $(this).select2('destroy');
                    $(this).select2({
                        theme: isDarkTheme ? "classic" : "classic",
                        placeholder: "Select options",
                        allowClear: true
                    });
                });
                
                // If we have already created visualizations, update them
                if (wheatData.length > 0) {
                    updateVisualization();
                }
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
}

/**
 * Set up event listeners for filter changes
 */
function setupFilterListeners() {
    $('#wheatType, #country, #yearRange').on('change', function() {
        updateVisualization();
    });
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    if (!document.getElementById('loading-indicator')) {
        const loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-wheat-awn fa-spin"></i>
            </div>
            <p>Loading data...</p>
        `;
        loading.style.position = 'fixed';
        loading.style.top = '0';
        loading.style.left = '0';
        loading.style.width = '100%';
        loading.style.height = '100%';
        loading.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loading.style.display = 'flex';
        loading.style.flexDirection = 'column';
        loading.style.alignItems = 'center';
        loading.style.justifyContent = 'center';
        loading.style.zIndex = '1000';
        loading.style.fontSize = '18px';
        loading.style.color = '#8b6914';
        
        document.body.appendChild(loading);
    } else {
        document.getElementById('loading-indicator').style.display = 'flex';
    }
}

/**
 * Fetch data from the API
 */
async function fetchData() {
    try {
        showLoadingIndicator();
        
        const response = await fetch(CHART_CONFIG.dataSourceUrl);
        wheatData = await response.json();
        
        // Process wheat data to replace long names with shorter versions
        wheatData = processWheatNames(wheatData);
        
        // Initialize the visualization
        populateFilters();
        updateVisualization();
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error fetching data:', error);
        displayErrorMessage('Failed to load data. Please try again later.');
        hideLoadingIndicator();
    }
}

/**
 * Process wheat names to replace long names with shorter versions
 * @param {Array} data - The wheat data
 * @returns {Array} - The processed data
 */
function processWheatNames(data) {
    return data.map(item => {
        // Create a new object to avoid modifying the original
        const newItem = {...item};
        
        // Replace "Fryers Global fob wheat price index" with "Global"
        if (newItem.Name === "Fryers Global fob wheat price index") {
            newItem.Name = "Global";
            console.log("Replaced 'Fryers Global fob wheat price index' with 'Global'");
        }
        
        return newItem;
    });
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
    const wheatTypeSelect = document.getElementById('wheatType');
    const countrySelect = document.getElementById('country');
    
    // Clear existing options
    wheatTypeSelect.innerHTML = '';
    countrySelect.innerHTML = '';
    
    // Get unique wheat types
    const wheatTypes = [...new Set(wheatData.map(item => item.Name))].sort();
    wheatTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        wheatTypeSelect.appendChild(option);
    });
    
    // Get unique countries
    const countries = [...new Set(wheatData.map(item => item.Country))].sort();
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
    
    // Refresh Select2
    $('.select2').trigger('change');
}

/**
 * Update visualization based on filters
 */
function updateVisualization() {
    const selectedWheatTypes = $('#wheatType').val();
    const selectedCountries = $('#country').val();
    const yearRange = document.getElementById('yearRange').value;
    
    // Filter data based on selections
    let filteredData = filterData(wheatData, selectedWheatTypes, selectedCountries, yearRange);
    
    // Create/update visualizations with filtered data
    createHeatmap(filteredData);
    createParallelCoordinates(filteredData);
}

/**
 * Reset all filters
 */
function resetFilters() {
    $('#wheatType').val(null).trigger('change');
    $('#country').val(null).trigger('change');
    document.getElementById('yearRange').value = 'all';
    updateVisualization();
}

/**
 * Load data
 */
function loadData() {
    fetchData();
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    if (document.getElementById('loading-indicator')) {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>${message}</p>
        <button onclick="this.parentNode.remove()">Dismiss</button>
    `;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.padding = '15px 20px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    errorDiv.style.zIndex = '1001';
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.gap = '10px';
    
    document.body.appendChild(errorDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}