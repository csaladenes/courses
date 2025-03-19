/**
 * Configuration for the Wheat Price Carpet Plot
 */

// Color scale configuration for price ranges
const COLOR_SCALES = {
    thresholds: [230, 250, 275, 325],
    colors: [
        "linear-gradient(to right, #0a3d8f, #0d47a1)", // Low price
        "linear-gradient(to right, #58a6e8, #64b5f6)", // Medium-Low price
        "linear-gradient(to right, #f5e332, #ffeb3b)",  // Medium price
        "linear-gradient(to right, #f08f00, #ff9800)", // Medium-High price
        "linear-gradient(to right, #a51a1a, #b71c1c)"  // High price
    ],
    // Colors for D3 usage
    d3Colors: ["#0d47a1", "#64b5f6", "#ffeb3b", "#ff9800", "#b71c1c"]
};

// Global events data
const GLOBAL_EVENTS = [
    { 
        date: "2020-03-11", 
        event: "WHO declares COVID-19 a pandemic", 
        description: "The World Health Organization officially characterized COVID-19 as a pandemic, affecting global supply chains and markets.",
        icon: "fa-solid fa-virus"
    },
    { 
        date: "2022-02-24", 
        event: "Russia-Ukraine conflict begins", 
        description: "The conflict between Russia and Ukraine started, significantly impacting global wheat markets as both countries are major exporters.",
        icon: "fa-solid fa-burst"
    },
    { 
        date: "2023-05-17", 
        event: "Black Sea Grain Initiative suspended", 
        description: "Russia suspended participation in the Black Sea Grain Initiative, affecting wheat exports from Ukraine.",
        icon: "fa-solid fa-ship"
    },
    { 
        date: "2021-06-23", 
        event: "Major drought in North America", 
        description: "Severe drought conditions in North America affected wheat production and global prices.",
        icon: "fa-solid fa-cloud-sun"
    },
    { 
        date: "2024-01-15", 
        event: "Global shipping disruptions", 
        description: "Attacks on shipping in the Red Sea led to disruptions in global supply chains, affecting wheat transportation costs.",
        icon: "fa-solid fa-ship-circle-exclamation"
    }
];

// Chart configuration
const CHART_CONFIG = {
    heatmap: {
        margin: {top: 50, right: 30, bottom: 100, left: 150},
        cellPadding: 0.05,
        axisPadding: 0.1,
        transitionDuration: 300
    },
    parallelCoords: {
        margin: {top: 40, right: 50, bottom: 20, left: 50},
        axisPadding: 0.1,
        transitionDuration: 300
    },
    tooltip: {
        fadeInDuration: 150, 
        fadeOutDuration: 300,
        offsetX: 15,
        offsetY: -30
    },
    tooltipDelay: 200,
    yearSeparatorColor: "rgba(139, 105, 20, 0.3)",
    eventMarkerRadius: 6,
    eventMarkerColor: "#d32f2f",
    eventLineColor: "#d32f2f",
    eventLineWidth: 2,
    dataSourceUrl: "https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/wheat_data.json",
    chartColors: {
        grid: 'var(--grid-line-color)',
        axis: 'var(--wheat-dark)'
    },
    animationDuration: 500
};

// Year ranges for filtering
const YEAR_RANGES = {
    "all": { label: "All Years", range: [2019, 2025] },
    "2019-2020": { label: "2019-2020", range: [2019, 2020] },
    "2021-2022": { label: "2021-2022", range: [2021, 2022] },
    "2023-2025": { label: "2023-2025", range: [2023, 2025] }
};

// Price thresholds for color scales
const PRICE_THRESHOLDS = [230, 250, 275, 325];

// Month names mapping
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Data source information
const DATA_INFO = {
    source: "Fryer's Reports Wheat Price Index",
    lastUpdated: "March 2025",
    citation: "Fryer's Reports Global Wheat Price Index (2025). Retrieved from fryersreports.com/data"
};

// Application version
const APP_VERSION = "1.2.0"; 