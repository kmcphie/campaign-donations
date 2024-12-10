/* * * * * * * * * * * * * * * * * 
*      TOTAL CONTRIBUTIONS       *
* * * * * * * * * * * * * * * * */

class TotalContributions {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;
    
        // Aggregate contributions by candidate and type
        vis.groupedData = Array.from(
            d3.group(vis.data, d => d.candidate),
            ([candidate, records]) => ({
                candidate,
                types: Array.from(
                    d3.rollup(
                        records,
                        v => d3.sum(v, d => d.total_raised),
                        d => d.type
                    ),
                    ([type, total]) => ({ type, total })
                )
            })
        );
    
        console.log("Grouped Data:", vis.groupedData);
    
        // Types (matched w colors)
        vis.types = ["SuperPAC", "Campaign", "Carey", "Leadership PAC"];
    
        // Calculate totals for each type
        const typeTotals = vis.types.map(type => ({
            type,
            total: d3.sum(vis.groupedData, d => d.types.find(t => t.type === type)?.total || 0)
        }));
    
        console.log("Type Totals:", typeTotals);
    
        // Sort types by total contributions (descending)
        vis.types.sort((a, b) => {
            const totalA = typeTotals.find(t => t.type === a).total;
            const totalB = typeTotals.find(t => t.type === b).total;
            return d3.descending(totalA, totalB);
        });
    
        console.log("Sorted Types:", vis.types);
    
        // Prepare stacked data
        vis.stackedData = d3.stack()
            .keys(vis.types)
            .value((d, key) => d.types.find(t => t.type === key)?.total || 0)
            (vis.groupedData);
    
        console.log("Stacked Data:", vis.stackedData);
    
        // Dimensions
        vis.margin = { top: 20, right: 30, bottom: 50, left: 200 };
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;
    
        // Create SVG
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);
    
        // Scales
        vis.x = d3.scaleLinear()
            .domain([0, d3.max(vis.stackedData, layer => d3.max(layer, d => d[1]))])
            .range([0, vis.width]);
    
        vis.y = d3.scaleBand()
            .domain(vis.groupedData.map(d => d.candidate))
            .range([0, vis.height])
            .padding(0.1);
    
        // Colors
        const customColors = ["#249421", "#1a6117", "#103d0e", "#3dd435"];
        vis.color = d3.scaleOrdinal()
            .domain(vis.types) // Map each type to a custom color
            .range(customColors);
    
        // Axes
        vis.xAxis = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x).ticks(5).tickFormat(d3.format("$,.2s")));
    
        vis.yAxis = vis.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.y));
    
        // Add layers for stacked bars
        vis.bars = vis.svg.selectAll(".layer")
            .data(vis.stackedData)
            .enter()
            .append("g")
            .attr("class", "layer")
            .attr("fill", d => vis.color(d.key));
    
        // Add rectangles to each layer
        vis.bars.selectAll("rect")
            .data((layer, layerIndex) => layer.map(d => ({ ...d, type: vis.types[layerIndex] }))) // Attach `type` to each segment
            .enter()
            .append("rect")
            .attr("class", "bar-segment")
            .attr("x", d => vis.x(d[0]))
            .attr("y", (d, i) => vis.y(vis.groupedData[i].candidate))
            .attr("width", d => vis.x(d[1]) - vis.x(d[0]))
            .attr("height", vis.y.bandwidth())
            .on("mouseover", function(event, d) {
                vis.tooltip
                    .style("opacity", 0.9)
                    .html(`
                        <strong>Type:</strong> ${d.type}<br>
                        <strong>Value:</strong> $${(d[1] - d[0]).toLocaleString()}
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                vis.tooltip.style("opacity", 0);
            });
    
        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}