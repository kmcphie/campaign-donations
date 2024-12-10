/* * * * * * * * * * * * * * 
*      TOP RECIPIENTS      *
* * * * * * * * * * * * * */

class TopRecipients {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Aggregate data by recipient name
        vis.donorData = Array.from(
            d3.rollup(
                vis.data,
                v => d3.sum(v, d => d.contribution_receipt_amount),
                d => d.committee_name
            ),
            ([name, total]) => ({ name, total })
        ).sort((a, b) => d3.descending(a.total, b.total))
         .slice(0, 10); // Take top 10 recipients/committees

        // Set dimensions
        vis.margin = { top: 20, right: 30, bottom: 40, left: 250 };
        vis.width = 900 - vis.margin.left - vis.margin.right;
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
            .domain([0, d3.max(vis.donorData, d => d.total)])
            .range([0, vis.width]);

        vis.y = d3.scaleBand()
            .domain(vis.donorData.map(d => d.name))
            .range([0, vis.height])
            .padding(0.1);

        // Axes
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x));

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.y));

        // Bars
        vis.svg.selectAll(".bar")
            .data(vis.donorData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => vis.y(d.name))
            .attr("width", d => vis.x(d.total))
            .attr("height", vis.y.bandwidth())
            .attr("fill", "#249421");
    }
}