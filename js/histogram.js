/* * * * * * * * * * * 
*      HISTOGRAM     *
* * * * * * * * * * */

class Histogram {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // PDimensions and margins
        vis.margin = { top: 20, right: 30, bottom: 50, left: 50 };
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // SVG container
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // X-axis scale
        const thresholds = d3.range(0, 550, 25); // Include 500 as upper bound
        vis.x = d3.scaleLinear()
            .domain([0, d3.max(thresholds)]) // Align with thresholds
            .range([0, vis.width]);

        // Y-axis scale
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Axes
        vis.xAxis = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.yAxis = vis.svg.append("g")
            .attr("class", "y-axis");

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Wrangle data and draw the visualization
        vis.wrangleData();
    }

    wrangleData() {
        const vis = this;
    
        // Define thresholds with a final bin for 500+
        const thresholds = [...d3.range(0, 500, 25), 500];
        const histogram = d3.histogram()
            .value(d => Math.min(d.contribution_receipt_amount, 500)) // Cap values for regular bins
            .domain([0, 500]) // Exclude outliers from standard bins
            .thresholds(thresholds);
    
        vis.bins = histogram(vis.data);
    
        // Add a custom "500+" bin
        const outliers = vis.data.filter(d => d.contribution_receipt_amount > 500);
        vis.bins.push({
            x0: 500, // Bin start
            x1: 500, // Bin end (same as start to avoid misrepresentation)
            length: outliers.length, // Count of outliers
            values: outliers // Optional: list of values in this bin
        });
    
        // Update y-scale based on bin counts
        vis.y.domain([0, d3.max(vis.bins, d => d.length)]);
    
        // Update the visualization
        vis.updateVis();
    }
    
    updateVis() {
        const vis = this;
    
        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.call(d3.axisLeft(vis.y));
    
        // Bind data to bars
        const bars = vis.svg.selectAll(".bar")
            .data(vis.bins);
    
        // Enter + Update
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(bars)
            .attr("x", d => vis.x(d.x0) + 1)
            .attr("y", d => vis.y(d.length))
            .attr("width", d => d.x1 === 500 ? vis.x(25) - vis.x(0) - 1 : vis.x(d.x1) - vis.x(d.x0) - 1) // Adjust "500+" bin width
            .attr("height", d => vis.height - vis.y(d.length))
            .attr("fill", "white")
            .on("mouseover", function(event, d) {
                vis.tooltip
                    .style("opacity", 0.9)
                    .html(d.x1 === 500
                        ? `Range: 500+<br>Count: ${d.length}`
                        : `Range: $${Math.floor(d.x0)} - $${Math.floor(d.x1)}<br>Count: ${d.length}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                vis.tooltip.style("opacity", 0);
            });
    
        // Exit
        bars.exit().remove();
    }
}