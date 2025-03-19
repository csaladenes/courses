/**
 * Heatmap (carpet plot) visualization for wheat price data
 */

/**
 * Create the heatmap visualization
 * @param {Array} data - The dataset to visualize
 */
function createHeatmap(data) {
    // Clear previous chart
    d3.select("#heatmap").html("");
    
    // If no data or too little data, show a message
    if (!data || data.length < 5) {
        d3.select("#heatmap")
            .append("div")
            .attr("class", "no-data-message")
            .style("text-align", "center")
            .style("padding", "50px")
            .style("color", "var(--wheat-dark)")
            .html("<i class='fa-solid fa-triangle-exclamation'></i> Not enough data to display the heatmap. Please adjust your filters.");
        return;
    }
    
    // Get unique wheat types and dates
    const wheatTypes = [...new Set(data.map(d => d.Name))];
    const dates = [...new Set(data.map(d => d.Date))].sort((a, b) => a - b);
    
    // Set up dimensions
    const margin = {top: -35, right: 30, bottom: 160, left: 150};
    const container = document.getElementById('heatmap');
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
        .domain(dates.map(d => new Date(d)))
        .range([0, width])
        .padding(0.05);
    
    const y = d3.scaleBand()
        .domain(wheatTypes)
        .range([0, height])
        .padding(0.05);
    
    // Price thresholds - these directly match our CSS variables
    const priceThresholds = [230, 250, 275, 325];
    
    // Color scale that will use our CSS variables
    const colorScale = d => {
        if (d < priceThresholds[0]) return "var(--price-low)";
        if (d < priceThresholds[1]) return "var(--price-medium-low)";
        if (d < priceThresholds[2]) return "var(--price-medium)";
        if (d < priceThresholds[3]) return "var(--price-medium-high)";
        return "var(--price-high)";
    };
    
    // Create x-axis with formatted dates
    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%b %Y"))
        .tickValues(x.domain().filter((d, i) => i % Math.ceil(dates.length / 12) === 0));
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .style("fill", "var(--text-color)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    
    // Style the axis paths and lines
    svg.selectAll(".domain, .tick line")
        .style("stroke", "var(--text-color)")
        .style("opacity", 0.5);
    
    // Create y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "var(--text-color)");
    
    // Add axis labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Date")
        .style("fill", "var(--text-color)")
        .style("font-weight", "600")
        .style("font-size", "14px");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Wheat Type")
        .style("fill", "var(--text-color)")
        .style("font-weight", "600")
        .style("font-size", "14px");
    
    // Create cells
    svg.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => x(new Date(d.Date)))
        .attr("y", d => y(d.Name))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.Price))
        .on("mouseover", function(event, d) {
            const tooltip = d3.select("#tooltip");
            tooltip.transition()
                .duration(150)
                .style("opacity", 1);
                
            tooltip.html(createTooltipContent(d))
                .style("left", (event.clientX + 15) + "px")
                .style("top", (event.clientY + window.scrollY - 28) + "px");
                
            // Highlight the cell
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "var(--text-color)")
                .style("stroke-width", "2px");
        })
        .on("mousemove", function(event) {
            d3.select("#tooltip")
                .style("left", (event.clientX - 180) + "px")
                .style("top", (event.clientY + window.scrollY - 400) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .transition()
                .duration(300)
                .style("opacity", 0);
                
            // Remove highlight
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "none")
                .style("stroke-width", "0px");
        });
    
    // Add year separators
    const years = [...new Set(dates.map(d => new Date(d).getFullYear()))];
    years.forEach(year => {
        // Find the first date of each year in our dataset
        const firstDateOfYear = dates.find(d => new Date(d).getFullYear() === year);
        if (firstDateOfYear) {
            const xPosition = x(new Date(firstDateOfYear));
            
            // Add vertical line for year separator
            svg.append("line")
                .attr("x1", xPosition)
                .attr("y1", 0)
                .attr("x2", xPosition)
                .attr("y2", height)
                .attr("stroke", "var(--text-color)")
                .attr("stroke-opacity", 0.2)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5");
            
            // Add year label at the top
            svg.append("text")
                .attr("x", xPosition + 5)
                .attr("y", -10)
                .attr("text-anchor", "start")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .style("fill", "var(--text-color)")
                .text(year);
        }
    });
    
    // Add global events with staircase approach to prevent overlap
    // First, sort events by date
    const sortedEvents = [...GLOBAL_EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group events by month/year to handle events that happen close together
    const eventGroups = {};
    
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const monthYear = `${eventDate.getMonth()}-${eventDate.getFullYear()}`;
        
        if (!eventGroups[monthYear]) {
            eventGroups[monthYear] = [];
        }
        
        eventGroups[monthYear].push(event);
    });
    
    // Track the staircase level for each event
    let staircaseLevel = 0;
    const maxLevel = 2; // Maximum number of levels before resetting
    const levelHeight = 20; // Height between each level
    const baseYOffset = -45; // Starting Y position (moved closer to chart)
    const minTopMargin = 60; // Minimum margin at the top to prevent overflow (reduced from 120)
    
    // Keep track of label positions to check for overlaps
    const labelPositions = [];
    
    // Process each group of events
    Object.values(eventGroups).forEach(eventsInGroup => {
        // Sort events within the same month/year by date
        eventsInGroup.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // For each event in this group
        eventsInGroup.forEach(event => {
            const eventDate = new Date(event.date);
            
            // Find the closest date in our dataset
            const closestDate = dates.reduce((prev, curr) => {
                return Math.abs(new Date(curr) - eventDate) < Math.abs(new Date(prev) - eventDate) ? curr : prev;
            });
            
            const xPosition = x(new Date(closestDate));
            if (xPosition !== undefined) {
                // Calculate label width
                const labelWidth = event.event.length * 7 + 10;
                
                // Check if we can place this label at the bottom without overlapping
                let canPlaceAtBottom = true;
                const labelStart = xPosition + x.bandwidth()/2 + 8;
                const labelEnd = labelStart + labelWidth;
                
                // Check for overlap with existing labels
                for (const pos of labelPositions) {
                    if (!(labelEnd < pos.start - 10 || labelStart > pos.end + 10)) {
                        // Overlap detected at this level
                        if (pos.level === staircaseLevel) {
                            canPlaceAtBottom = false;
                            break;
                        }
                    }
                }
                
                // If we can't place at current level, increment the level
                if (!canPlaceAtBottom) {
                    staircaseLevel = (staircaseLevel + 1) % maxLevel;
                }
                
                // Calculate y position based on staircase level
                const yOffset = baseYOffset - (staircaseLevel * levelHeight);
                
                // Store this label's position
                labelPositions.push({
                    start: labelStart,
                    end: labelEnd,
                    level: staircaseLevel
                });
                
                // Add event line
                svg.append("line")
                    .attr("class", "event-line")
                    .attr("x1", xPosition + x.bandwidth()/2)
                    .attr("y1", yOffset)
                    .attr("x2", xPosition + x.bandwidth()/2)
                    .attr("y2", height)
                    .style("stroke", "var(--container-bg)")
                    .style("stroke-width", "1.5px")
                    .style("stroke-dasharray", "none")
                    .style("stroke-opacity", 0.8);
                
                // Add event marker
                svg.append("circle")
                    // .attr("class", "event-marker")
                    .attr("cx", xPosition + x.bandwidth()/2)
                    .attr("cy", yOffset)
                    .attr("r", 6)
                    .attr("fill", "var(--event-color)")
                    .attr("stroke", "var(--text-color)")
                    .style("filter", "drop-shadow(0 0 3px rgba(0, 0, 0, 0.4))")
                    .on("mouseover", function(e) {
                        const tooltip = d3.select("#tooltip");
                        tooltip.transition()
                            .duration(150)
                            .style("opacity", 1);
                            
                        tooltip.html(createEventTooltipContent(event))
                            .style("left", (e.clientX - 180) + "px")
                            .style("top", (e.clientY + window.scrollY - 400) + "px");
                            
                        // Highlight the marker
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 8);
                    })
                    .on("mouseout", function() {
                        d3.select("#tooltip")
                            .transition()
                            .duration(300)
                            .style("opacity", 0);
                            
                        // Return to original size
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", 6);
                    });
                    
                // Add background for event label
                svg.append("rect")
                    .attr("class", "event-label-bg")
                    .attr("x", xPosition + x.bandwidth()/2 + 8)
                    .attr("y", yOffset - 10)
                    .attr("width", labelWidth)
                    .attr("height", 20)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .style("fill", "var(--container-bg)")
                    .style("opacity", 0.8);

                // Add event name next to the dot
                svg.append("text")
                    // .attr("class", "event-label")
                    .attr("x", xPosition + x.bandwidth()/2 + 12)
                    .attr("y", yOffset)
                    .attr("text-anchor", "start")
                    .attr("dominant-baseline", "middle")
                    .attr("font-size", "12px")
                    .attr("font-weight", "600")
                    .style("fill", "var(--text-color)")
                    .text(event.event);
            }
        });
    });
    
    // Adjust the SVG height if needed to accommodate all events
    const topEventPosition = baseYOffset - (maxLevel * levelHeight);
    if (topEventPosition < -30) {
        const additionalHeight = Math.abs(topEventPosition) + 30;
        const svgElement = svg.node().parentNode;
        const currentHeight = parseInt(d3.select(svgElement).attr("height"), 10);
        d3.select(svgElement).attr("height", currentHeight + additionalHeight);
        
        // Get the current transform values
        const transform = svg.attr("transform");
        const translateX = parseFloat(transform.split("translate(")[1].split(",")[0]);
        const translateY = parseFloat(transform.split(",")[1].split(")")[0]) + additionalHeight;
        
        // Apply the new transform
        svg.attr("transform", `translate(${translateX},${translateY})`);
    }
}

/**
 * Add global events markers to the timeline
 */
function addGlobalEvents(svg, xScale, years, height) {
    // Add global event markers if we have events defined
    if (typeof GLOBAL_EVENTS !== 'undefined' && GLOBAL_EVENTS.length > 0) {
        // Filter events within our year range
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const relevantEvents = GLOBAL_EVENTS.filter(event => {
            const eventYear = new Date(event.date).getFullYear();
            return eventYear >= minYear && eventYear <= maxYear;
        }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
        
        // Group events by month/year to handle events that happen close together
        const eventGroups = {};
        
        relevantEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const monthYear = `${eventDate.getMonth()}-${eventDate.getFullYear()}`;
            
            if (!eventGroups[monthYear]) {
                eventGroups[monthYear] = [];
            }
            
            eventGroups[monthYear].push(event);
        });
        
        // Track the staircase level for each event
        let staircaseLevel = 0;
        const maxLevel = 2; // Maximum number of levels before resetting
        const levelHeight = 20; // Height between each level
        const baseYOffset = -25; // Starting Y position (moved closer to chart)
        const minTopMargin = 60; // Minimum margin at the top to prevent overflow (reduced from 120)
        
        // Keep track of label positions to check for overlaps
        const labelPositions = [];
        
        // Flatten grouped events back into an array with staircase levels
        const eventsWithLevels = [];
        
        Object.values(eventGroups).forEach(eventsInGroup => {
            // Sort events within the same month/year by date
            eventsInGroup.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // For each event in this group, assign a staircase level
            eventsInGroup.forEach(event => {
                const eventDate = new Date(event.date);
                const xPosition = xScale(eventDate.getFullYear());
                
                if (xPosition !== undefined) {
                    // Calculate label width
                    const labelWidth = event.event.length * 7 + 10;
                    
                    // Check if we can place this label at the bottom without overlapping
                    let canPlaceAtBottom = true;
                    const labelStart = xPosition + xScale.bandwidth()/2 + 8;
                    const labelEnd = labelStart + labelWidth;
                    
                    // Check for overlap with existing labels
                    for (const pos of labelPositions) {
                        if (!(labelEnd < pos.start - 10 || labelStart > pos.end + 10)) {
                            // Overlap detected at this level
                            if (pos.level === staircaseLevel) {
                                canPlaceAtBottom = false;
                                break;
                            }
                        }
                    }
                    
                    // If we can't place at current level, increment the level
                    if (!canPlaceAtBottom) {
                        staircaseLevel = (staircaseLevel + 1) % maxLevel;
                    }
                    
                    // Store this label's position
                    labelPositions.push({
                        start: labelStart,
                        end: labelEnd,
                        level: staircaseLevel
                    });
                    
                    eventsWithLevels.push({
                        ...event,
                        staircaseLevel: staircaseLevel
                    });
                }
            });
        });
        
        // Add event lines
        svg.selectAll(".event-line")
            .data(eventsWithLevels)
            .enter()
            .append("line")
            .attr("class", "event-line")
            .attr("x1", d => xScale(new Date(d.date).getFullYear()) + xScale.bandwidth() / 2)
            .attr("y1", d => {
                // Calculate y position based on staircase level
                return baseYOffset - (d.staircaseLevel * levelHeight);
            })
            .attr("x2", d => xScale(new Date(d.date).getFullYear()) + xScale.bandwidth() / 2)
            .attr("y2", height)
            .attr("stroke", "var(--container-bg)")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "none")
            .attr("stroke-opacity", 0.8)
            .style("pointer-events", "all")
        
        // Add event markers
        svg.selectAll(".event-marker")
            .data(eventsWithLevels)
            .enter()
            .append("circle")
            .attr("class", "event-marker")
            .attr("cx", d => xScale(new Date(d.date).getFullYear()) + xScale.bandwidth() / 2)
            .attr("cy", d => {
                // Calculate y position based on staircase level
                return baseYOffset - (d.staircaseLevel * levelHeight);
            })
            .attr("r", 5)
            .attr("fill", d => d.color || "var(--event-color)")
            .style("filter", "drop-shadow(0 0 3px rgba(0, 0, 0, 0.4))")
            .style("pointer-events", "all")
            .on("mouseover", function(event, d) {
                // Show event info in tooltip
                const tooltip = d3.select("#tooltip");
                tooltip.transition()
                    .duration(150)
                    .style("opacity", 1);
                    
                tooltip.html(createEventTooltipContent(d))
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
                    
                // Highlight the marker
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8);
            })
            .on("mousemove", function(event) {
                d3.select("#tooltip")
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").transition()
                    .duration(300)
                    .style("opacity", 0);
                    
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5);
            });
        
        // Add event label backgrounds
        svg.selectAll(".event-label-bg")
            .data(eventsWithLevels)
            .enter()
            .append("rect")
            .attr("class", "event-label-bg")
            .attr("x", d => xScale(new Date(d.date).getFullYear()) + xScale.bandwidth() / 2 + 8)
            .attr("y", d => {
                // Calculate y position based on staircase level
                return baseYOffset - (d.staircaseLevel * levelHeight) - 10;
            })
            .attr("width", d => d.event.length * 7 + 10)
            .attr("height", 20)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", "var(--container-bg)")
            .style("opacity", 0.8);

        // Add event labels next to markers
        svg.selectAll(".event-label")
            .data(eventsWithLevels)
            .enter()
            .append("text")
            .attr("class", "event-label")
            .attr("x", d => xScale(new Date(d.date).getFullYear()) + xScale.bandwidth() / 2 + 10)
            .attr("y", d => {
                // Calculate y position based on staircase level
                return baseYOffset - (d.staircaseLevel * levelHeight);
            })
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "600")
            .style("fill", "var(--text-color)")
            .text(d => d.event);
            
        // Adjust the SVG height if needed to accommodate all events
        const topEventPosition = baseYOffset - (maxLevel * levelHeight);
        if (topEventPosition < -30) {
            const additionalHeight = Math.abs(topEventPosition) + 30;
            const svgElement = svg.node().parentNode;
            const currentHeight = parseInt(d3.select(svgElement).attr("height"), 10);
            d3.select(svgElement).attr("height", currentHeight + additionalHeight);
            
            // Get the current transform values
            const transform = svg.attr("transform");
            const translateX = parseFloat(transform.split("translate(")[1].split(",")[0]);
            const translateY = parseFloat(transform.split(",")[1].split(")")[0]) + additionalHeight;
            
            // Apply the new transform
            svg.attr("transform", `translate(${translateX},${translateY})`);
        }
    }
}

/**
 * Helper function to lighten a color
 */
function lightenColor(color, amount) {
    // Remove any leading #
    if (color.startsWith('#')) {
        color = color.slice(1);
    }
    
    // Parse the color
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Lighten
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    
    return `${r}, ${g}, ${b}`;
}

/**
 * Helper function to darken a color
 */
function darkenColor(color, amount) {
    // Remove any leading #
    if (color.startsWith('#')) {
        color = color.slice(1);
    }
    
    // Parse the color
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Darken
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    
    return `${r}, ${g}, ${b}`;
} 