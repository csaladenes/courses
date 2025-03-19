/**
 * Parallel Coordinates plot visualization for the Wheat Price Carpet Plot
 */

/**
 * Create the parallel coordinates visualization
 * @param {Array} data - The dataset to visualize
 */
function createParallelCoordinates(data) {
    // Clear previous content
    d3.select("#parallel-plot").html("");
    
    // If no data or too little data, show a message
    if (!data || data.length < 2) {
        d3.select("#parallel-plot")
            .append("div")
            .attr("class", "no-data-message")
            .style("text-align", "center")
            .style("padding", "50px")
            .style("color", "var(--wheat-dark)")
            .html("<i class='fa-solid fa-triangle-exclamation'></i> Not enough data to display parallel coordinates. Please adjust your filters.");
        return;
    }
    
    // Set up dimensions
    const margin = {top: 40, right: 50, bottom: 40, left: 50};
    const container = document.getElementById('parallel-plot');
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    // Get tooltip element
    const tooltip = d3.select("#tooltip");
    
    // Dimensions to visualize
    const dimensions = ["Country", "Name", "Price", "Month", "Year"];
    
    // Extract month and year from dates
    data.forEach(d => {
        const date = new Date(d.Date);
        d.Month = date.getMonth() + 1; // 1-12
        d.Year = date.getFullYear();
    });
    
    // Get unique countries for coloring
    const countries = [...new Set(data.map(d => d.Country))].sort();
    
    // Create color scale for countries - Using royal blue to cyclamen palette
    // Colors following Lisa Charlotte Muth's principles
    const pastelColors = [
        "#4573c2", "#6b8fd4", "#977ec6", "#b378ae", "#d2758e", 
        "#df9774", "#e1b770", "#c6c76b", "#95c681", "#63be9a", 
        "#5baeb3", "#5d94c5", "#7f7cba", "#a66ba6", "#c76289",
        "#dc7d69", "#e09f64", "#d3c265", "#a4ca79", "#71b99e"
    ];
    
    const colorScale = d3.scaleOrdinal()
        .domain(countries)
        .range(pastelColors);
    
    // Create SVG
    const svg = d3.select("#parallel-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales for each dimension
    const y = {};
    dimensions.forEach(dimension => {
        if (dimension === "Country" || dimension === "Name") {
            // For categorical dimensions, create a point scale
            const uniqueValues = [...new Set(data.map(d => d[dimension]))];
            y[dimension] = d3.scalePoint()
                .domain(uniqueValues)
                .range([height, 0])
                .padding(0.5);
        } else {
            // For numerical dimensions, create a linear scale
            const extent = d3.extent(data, d => d[dimension]);
            y[dimension] = d3.scaleLinear()
                .domain(extent)
                .range([height, 0]);
            
            // Make sure Year uses only integers
            if (dimension === "Year") {
                // Use integers for years (min and max years)
                const minYear = Math.floor(extent[0]);
                const maxYear = Math.ceil(extent[1]);
                y[dimension].domain([minYear, maxYear]);
            }
        }
    });
    
    // Position of each axis
    const x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions)
        .padding(0.1);
    
    // Add a light gray background to the entire plot
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "var(--plot-background)")
        .attr("rx", 8)
        .attr("ry", 8);
        
    // Add subtle gridlines
    dimensions.forEach(dimension => {
        if (dimension !== "Country" && dimension !== "Name") {
            const gridLines = y[dimension].ticks(5);
            gridLines.forEach(tick => {
                svg.append("line")
                    .attr("x1", x(dimension))
                    .attr("x2", width)
                    .attr("y1", y[dimension](tick))
                    .attr("y2", y[dimension](tick))
                    .attr("stroke", "var(--grid-line-color)")
                    .attr("stroke-dasharray", "3,3");
            });
        }
    });
    
    // Add axes
    const axisGroups = svg.selectAll("g.axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "parallel-axis")
        .attr("transform", d => `translate(${x(d)}, 0)`);
    
    // Add axis lines and labels
    axisGroups.each(function(d) {
        let axis = d3.axisLeft(y[d]);
        
        // For categorical axes, show fewer ticks
        if (d === "Country" || d === "Name") {
            const uniqueValues = [...new Set(data.map(item => item[d]))];
            if (uniqueValues.length > 10) {
                axis.tickValues(uniqueValues.filter((_, i) => i % Math.ceil(uniqueValues.length / 10) === 0));
            }
        }
        
        // For Year, ensure integer ticks
        if (d === "Year") {
            const domain = y[d].domain();
            const ticks = [];
            for (let i = domain[0]; i <= domain[1]; i++) {
                ticks.push(i);
            }
            axis.tickValues(ticks).tickFormat(d3.format("d"));
        }
        
        d3.select(this).call(axis);
        
        // Rotate labels for categorical axes
        if (d === "Country" || d === "Name") {
            d3.select(this).selectAll("text")
                .style("text-anchor", "end")
                .style("fill", "var(--text-color)")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");
        } else {
            d3.select(this).selectAll("text")
                .style("fill", "var(--text-color)");
        }
        
        // Style the axis paths and lines
        d3.select(this).selectAll(".domain, .tick line")
            .style("stroke", "var(--text-color)")
            .style("opacity", 0.5);
    });
    
    // Add dimension labels
    axisGroups.append("text")
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .text(d => d)
        .style("fill", "var(--text-color)")
        .style("font-weight", "600")
        .style("font-size", "14px");
    
    // Draw the lines
    const line = d3.line()
        .defined(d => d !== null)
        .x((d, i) => x(dimensions[i]))
        .y(d => d)
        .curve(d3.curveMonotoneX); // Reduced curvature to avoid data distortion
    
    // Create paths
    const paths = svg.selectAll(".parallel-path")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "parallel-path")
        .attr("d", d => {
            return line(dimensions.map(dimension => {
                return y[dimension](d[dimension]);
            }));
        })
        .attr("stroke", d => colorScale(d.Country))
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.7)
        .attr("fill", "none")
        .on("mouseover", function(event, d) {
            // Highlight this path
            d3.select(this)
                .classed("highlighted", true)
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 1);
                
            // Show tooltip
            tooltip.transition()
                .duration(150)
                .style("opacity", 1);
                
            tooltip.html(createTooltipContent(d))
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function(event) {
            // Update tooltip position
            tooltip.style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function() {
            // Remove highlighting
            d3.select(this)
                .classed("highlighted", false)
                .attr("stroke-width", 1.5)
                .attr("stroke-opacity", 0.7);
                
            // Hide tooltip
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });
    
    // Object to store active brushes for each dimension
    const activeBrushes = {};
    
    // Function to update the display based on all active brushes
    function updatePathsDisplay() {
        svg.selectAll(".parallel-path")
            .style("display", d => {
                // Check if the data point passes all active brush filters
                for (const [dimension, selection] of Object.entries(activeBrushes)) {
                    const value = d[dimension];
                    
                    if (dimension === "Country" || dimension === "Name") {
                        // For categorical values, get the y-position of this value
                        const yPos = y[dimension](value);
                        // Check if this y-position is within the brushed range
                        if (!(yPos >= selection[0] && yPos <= selection[1])) {
                            return "none"; // Hide if it doesn't pass this filter
                        }
                    } else {
                        // For numerical values, check if value is within range
                        const brushMin = y[dimension].invert(selection[1]);
                        const brushMax = y[dimension].invert(selection[0]);
                        if (!(value >= brushMin && value <= brushMax)) {
                            return "none"; // Hide if it doesn't pass this filter
                        }
                    }
                }
                return null; // Show if it passes all filters
            });
    }
    
    // Add brushes
    axisGroups.each(function(dimension) {
        const brush = d3.brushY()
            .extent([[-10, 0], [10, height]])
            .on("brush", function(event) {
                // Get the selection boundary
                const selection = event.selection;
                if (!selection) {
                    // If brush is cleared on this dimension, remove it from active brushes
                    delete activeBrushes[dimension];
                } else {
                    // Store the active brush for this dimension
                    activeBrushes[dimension] = selection;
                }
                
                // Update paths based on all active brushes
                updatePathsDisplay();
            })
            .on("end", function(event) {
                // If the brush is cleared, remove it from active brushes
                if (!event.selection) {
                    delete activeBrushes[dimension];
                    
                    // If no active brushes remain, show all paths
                    if (Object.keys(activeBrushes).length === 0) {
                        svg.selectAll(".parallel-path").style("display", null);
                    } else {
                        // Otherwise, update based on remaining brushes
                        updatePathsDisplay();
                    }
                }
            });
            
        d3.select(this).call(brush);
        
        // If this is the Price dimension, apply a default brush for the 450-550 range
        if (dimension === "Price") {
            // Convert price values to y-coordinates
            const y0 = y[dimension](550);
            const y1 = y[dimension](450);
            
            // Store the brush for this dimension
            const brushGroup = d3.select(this);
            
            // Apply the brush programmatically
            brushGroup.call(brush.move, [y0, y1]);
            
            // Store the initial brush in active brushes
            activeBrushes[dimension] = [y0, y1];
        }
    });
    
    // Add a legend for countries with proper spacing
    const legendContainer = d3.select("#parcoords-legend");
    
    // Clear any existing legend items
    legendContainer.html("");
    
    // Create legend items for each country
    countries.forEach(country => {
        const legendItem = legendContainer.append("div")
            .attr("class", "legend-item")
            .on("mouseover", function() {
                // Highlight paths for this country, dim others
                svg.selectAll(".parallel-path")
                    .style("stroke-opacity", d => d.Country === country ? 1 : 0.1)
                    .style("stroke-width", d => d.Country === country ? 3 : 1);
                
                // Highlight this legend item
                d3.select(this)
                    .style("font-weight", "bold")
                    .style("transform", "translateY(-2px)");
            })
            .on("mouseout", function() {
                // Reset all paths
                svg.selectAll(".parallel-path")
                    .style("stroke-opacity", 0.7)
                    .style("stroke-width", 1.5);
                
                // Reset this legend item
                d3.select(this)
                    .style("font-weight", "normal")
                    .style("transform", "translateY(0)");
            });
        
        // Add color swatch
        legendItem.append("div")
            .attr("class", "legend-color")
            .style("background-color", colorScale(country));
        
        // Add country name
        legendItem.append("span")
            .text(country);
    });
} 