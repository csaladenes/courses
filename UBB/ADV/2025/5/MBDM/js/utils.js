/**
 * Utility functions for Wheat Price Visualization
 */

/**
 * Generate month name from month number (1-12)
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} Month name
 */
function getMonthName(monthNum) {
    return MONTH_NAMES[monthNum - 1];
}

/**
 * Format price with proper currency symbol
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(price);
}

/**
 * Detect if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return window.innerWidth < 768;
}

/**
 * Format date in a human-readable format
 * @param {string} dateStr - Date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
function formatDate(dateStr, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {string} Formatted percentage change
 */
function calculatePercentChange(oldValue, newValue) {
    const change = ((newValue - oldValue) / oldValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

/**
 * Debounce function to limit how often a function can run
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Utility functions for the Wheat Price Carpet Plot
 */

/**
 * Find the closest date in dataset to a given date
 * @param {Array} dates - Array of date strings
 * @param {Date} targetDate - Target date to find closest match
 * @returns {string} The closest date from the dates array
 */
function findClosestDate(dates, targetDate) {
    return dates.reduce((prev, curr) => {
        return Math.abs(new Date(curr) - targetDate) < Math.abs(new Date(prev) - targetDate) ? curr : prev;
    });
}

/**
 * Filter the data based on selected filters
 * @param {Array} data - The complete dataset
 * @param {Array} selectedWheatTypes - Selected wheat types
 * @param {Array} selectedCountries - Selected countries
 * @param {string} yearRange - Selected year range
 * @returns {Array} Filtered data
 */
function filterData(data, selectedWheatTypes, selectedCountries, yearRange) {
    let filteredData = [...data];
    
    // Filter by wheat type
    if (selectedWheatTypes && selectedWheatTypes.length > 0) {
        filteredData = filteredData.filter(item => selectedWheatTypes.includes(item.Name));
    }
    
    // Filter by country
    if (selectedCountries && selectedCountries.length > 0) {
        filteredData = filteredData.filter(item => selectedCountries.includes(item.Country));
    }
    
    // Filter by year range
    if (yearRange !== 'all' && YEAR_RANGES[yearRange]) {
        const [startYear, endYear] = YEAR_RANGES[yearRange].range;
        filteredData = filteredData.filter(item => {
            const year = new Date(item.Date).getFullYear();
            return year >= startYear && year <= endYear;
        });
    }
    
    return filteredData;
}

/**
 * Create a gradient for a D3 cell based on price
 * @param {number} price - The price value
 * @returns {string} CSS gradient string
 */
function getPriceGradient(price) {
    const thresholds = COLOR_SCALES.thresholds;
    
    if (price < thresholds[0]) {
        return COLOR_SCALES.colors[0];
    } else if (price < thresholds[1]) {
        return COLOR_SCALES.colors[1];
    } else if (price < thresholds[2]) {
        return COLOR_SCALES.colors[2];
    } else if (price < thresholds[3]) {
        return COLOR_SCALES.colors[3];
    } else {
        return COLOR_SCALES.colors[4];
    }
}

/**
 * Get a color for D3 to use based on price
 * @param {number} price - The price value
 * @returns {string} Color hex code
 */
function getPriceColor(price) {
    const thresholds = COLOR_SCALES.thresholds;
    
    if (price < thresholds[0]) {
        return COLOR_SCALES.d3Colors[0];
    } else if (price < thresholds[1]) {
        return COLOR_SCALES.d3Colors[1];
    } else if (price < thresholds[2]) {
        return COLOR_SCALES.d3Colors[2];
    } else if (price < thresholds[3]) {
        return COLOR_SCALES.d3Colors[3];
    } else {
        return COLOR_SCALES.d3Colors[4];
    }
}

/**
 * Creates a tooltip HTML content
 * @param {Object} data - Data point for tooltip
 * @returns {string} HTML content for tooltip
 */
function createTooltipContent(data) {
    let content = `<strong>${data.Name}</strong> (${data.Country})<br>`;
    content += `<span>Price: <b>${formatPrice(data.Price)}</b></span><br>`;
    
    // Format date
    const date = new Date(data.Date);
    content += `<span>Date: ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>`;
    
    return content;
}

/**
 * Creates a tooltip HTML content for global events
 * @param {Object} event - Event data
 * @returns {string} HTML content for tooltip
 */
function createEventTooltipContent(event) {
    return `
        <strong><i class="${event.icon}"></i> ${event.event}</strong><br>
        <span>${formatDate(event.date)}</span><br>
        <p>${event.description}</p>
    `;
} 