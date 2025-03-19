# Wheat Price Data Visualization Project

This project demonstrates how to create sophisticated, interactive data visualizations for wheat price analysis using AI-assisted development. Without writing code manually, I used Claude 3.7 Sonnet to generate a complete visualization suite that includes heatmaps, parallel coordinates plots, and an executive summary dashboard. The visualizations feature responsive design, interactive filtering, dark/light themes, and contextual information about global events affecting wheat markets.

## 🕹️ [Interactive data visualization](https://data.csaladen.es/ADV%202025/5/)


A fenti gabonás vizuaizációkat teljességgel kódolás nélkül készítettem (bár kellet hozzá egy pár próbálkozás.. :sweat_smile:)
Itt megtaláljátok az összes promptot amit használtam (`clause-sonnet-3.7`):

# [Prompt 1](https://github.com/denesdata/denesdata.github.io/blob/main/ADV%202025/5/prompts%201.md) - Wheat Price Data Visualization Development Journey
This conversation documents the iterative development of interactive visualizations for wheat price data. The process began with a simple Vega-Lite specification for line charts and evolved into multiple sophisticated visualizations including:

1. **Line charts** showing price trends over time for different wheat types
2. **Interactive dashboard** with multiple chart types (bar charts, box plots, heatmaps)
3. **Violin plot** showing price distributions by wheat type
4. **D3.js carpet plot** with:
   - Color-coded price visualization
   - Year separators
   - Global event markers
   - Multiselect filtering options
   - Enhanced tooltips
   - Wheat/grain themed styling

Throughout the development, several improvements were made:
- Adding company logos to visualizations
- Fixing technical issues (like Chart.js width calculation errors)
- Switching from Chart.js to D3.js for better control
- Enhancing user experience with better tooltips and filters
- Adding contextual information about global events affecting wheat prices
- Implementing a grain-themed design with gradients and icons

The final product is a comprehensive, interactive data exploration tool that allows users to analyze wheat price trends across different types, countries, and time periods while providing context through global events that impacted the market.

### Screenshot 1-1
![Screenshot 1-1](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%201-1.png)
### Screenshot 1-2
![Screenshot 1-2](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%201-2.png)
### Screenshot 1-3
![Screenshot 1-3](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%201-3.png)
.

.
# [Prompt 2](https://github.com/denesdata/denesdata.github.io/blob/main/ADV%202025/5/prompts%202.md) - Adding a second plot, interactions and styling

Key developments:

1. **Initial Restructuring**
   - Breaking a monolithic file into smaller functional components
   - Organizing code into a subfolder structure
   - Implementing proper separation of concerns (HTML, CSS, JS)

2. **Visual Enhancements**
   - Adding gradients and wheat-themed styling
   - Incorporating FontAwesome icons
   - Fixing tooltip positioning issues
   - Removing drop shadows from logos

3. **Adding Parallel Coordinates Plot**
   - Creating a second visualization type below the heatmap
   - Implementing interactive brushing and filtering
   - Fixing issues with categorical axes and year labels
   - Changing coloring from price-based to country-based

4. **Style Refinements**
   - Aligning legends consistently
   - Using pastel colors inspired by Information is Beautiful and Airbnb ViSX
   - Implementing modern typography with the Inter font family
   - Reducing spline curvature to prevent data distortion

5. **Theme Implementation**
   - Creating a dark theme with pink and green color scheme
   - Adding a theme toggle with sun/moon icons
   - Implementing persistent theme preferences
   - Adding top-left to bottom-right gradients on containers

The final product is a sophisticated data visualization tool that combines a heatmap/carpet plot with a parallel coordinates plot, allowing users to explore wheat price data through multiple perspectives while enjoying a visually pleasing, professionally designed interface with both light and dark themes.

### Screenshot 2-1
![Screenshot 2-1](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%202-1.png)
### Screenshot 2-2
![Screenshot 2-2](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%202-2.png)
.

.
# [Prompt 3](https://github.com/denesdata/denesdata.github.io/blob/main/ADV%202025/5/prompts%202.md) - Final touches and Executive Summary

Key developments:

1. **Standardizing Chart Formatting**
   - Aligning titles, margins, and legends across both visualizations
   - Creating consistent container styling and spacing
   - Implementing uniform header and legend designs

2. **Code Cleanup**
   - Eliminating duplicate function declarations
   - Standardizing function styles
   - Resolving global variable conflicts
   - Centralizing tooltip content generation

3. **Event Visualization Improvements**
   - Fixing event dot tooltips and label alignments
   - Resolving issues with event markers moving on hover
   - Implementing consistent tooltip behavior

4. **Navigation Enhancements**
   - Adding a navigation bar to the main page
   - Implementing smooth scrolling between sections
   - Adding appropriate spacing when scrolling to sections

5. **Parallel Coordinates Refinements**
   - Implementing default price range highlighting (450-550)
   - Fixing cross-filtering functionality across multiple axes

The final product features a cohesive design with consistent styling across all elements, proper cross-filtering functionality, and smooth navigation between different sections of the visualization.

### Screenshot 3-1
![Screenshot 3-1](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%203-1.png)
### Screenshot 3-2
![Screenshot 3-2](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%203-2.png)
### Screenshot 3-3
![Screenshot 3-3](https://raw.githubusercontent.com/denesdata/denesdata.github.io/refs/heads/main/ADV%202025/5/Screenshot%203-3.gif)
.