// ... existing code ...

function initEvoChart() {
    const ctx = document.getElementById(EVO_CHART_ID).getContext('2d');
    evoState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Altruists', data: [], borderColor: '#3b82f6', backgroundColor: '#3b82f6', pointRadius: 0, borderWidth: 2 },
                { label: 'Freeloaders', data: [], borderColor: '#64748b', backgroundColor: '#64748b', pointRadius: 0, borderWidth: 2 }
            ]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false, // Ensure fixed height
            scales: {
                x: { display: false },
                y: { display: false } 
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ... existing code ...
