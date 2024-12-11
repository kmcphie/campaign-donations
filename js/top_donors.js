/* * * * * * * * * * * * 
*      TOP DONORS      *
* * * * * * * * * * * */

class TopDonors {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Create an array of party affiliation for color coding bars
        vis.party_affiliations = [];
        vis.party_affiliations.push({ name: "Segel, Arthur", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Tushnet, Mark", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Gilmartin, Raymond", color: "#eb4034" });
        vis.party_affiliations.push({ name: "Minow, Martha", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Klarman, Michael", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Porter, Michael", color: "white" });
        vis.party_affiliations.push({ name: "Dupre, Denise", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Summers, Lawrence", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Lorsch, Jay", color: "#3449eb" });
        vis.party_affiliations.push({ name: "Hiatt, Howard", color: "#3449eb" });

        // Aggregate data by donor name
        vis.donorData = Array.from(
            d3.rollup(
                vis.data,
                v => d3.sum(v, d => d.contribution_receipt_amount),
                d => d.contributor_name
            ),
            ([name, total]) => ({ name, total })
        ).sort((a, b) => d3.descending(a.total, b.total))
         .slice(0, 10); // Take top 10 donors

        // Set dimensions
        vis.margin = { top: 20, right: 30, bottom: 40, left: 100 };
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
            .attr("fill", d => {
                // Find the donor in the party_affiliations array
                const affiliation = vis.party_affiliations.find(aff => aff.name === d.name);
                // Return the corresponding color or default to green
                return affiliation ? affiliation.color : "#249421";
            });

        // Add legend
        const legendData = [
            { label: "Democrat", color: "#3449eb" },
            { label: "Republican", color: "#eb4034" },
            { label: "Bipartisan", color: "white" }
        ];

        // Append a legend group
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - 150}, 0)`); // Position top-right

        // Add legend rectangles
        legend.selectAll(".legend-rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("class", "legend-rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20 + 60)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => d.color)
            .attr("stroke", "black");

        // Add legend labels
        legend.selectAll(".legend-label")
            .data(legendData)
            .enter()
            .append("text")
            .attr("class", "legend-label")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 72)
            .text(d => d.label)
            .attr("font-size", "12px")
            .attr("fill", "white");
    }
}