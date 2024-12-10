/* * * * * * * * * * * * * * * * * * * 
*      CONTRIBUTIONS OVER TIME       *
* * * * * * * * * * * * * * * * * * */

class ContributionsOverTime {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Aggregate data by date
        vis.aggregatedData = Array.from(
            d3.group(vis.data, d => d.contribution_receipt_date),
            ([date, values]) => ({
                date: date,
                total: d3.sum(values, v => v.contribution_receipt_amount)
            })
        );

        // Set dimensions
        vis.margin = { top: 20, right: 30, bottom: 40, left: 50 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Create SVG
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.x = d3.scaleTime()
            .domain(d3.extent(vis.aggregatedData, d => new Date(d.date)))
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.aggregatedData, d => d.total)])
            .range([vis.height, 0]);

        // Axes
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x));

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.y));

        // Line
        vis.line = d3.line()
            .x(d => vis.x(new Date(d.date)))
            .y(d => vis.y(d.total));

        vis.svg.append("path")
            .datum(vis.aggregatedData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", vis.line);
    }
}