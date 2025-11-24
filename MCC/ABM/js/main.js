function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Trigger resize events for canvases if needed (Chart.js sometimes needs this when unhidden)
    window.dispatchEvent(new Event('resize'));
}

// Initialize default tab
document.addEventListener('DOMContentLoaded', () => {
    switchTab('systems');
});

