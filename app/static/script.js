// Fetch data from Flask API
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        const width = 800;
        const height = 400;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.contributor_name))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.contribution_receipt_amount)])
            .range([height, 0]);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.contributor_name))
            .attr("y", d => yScale(d.contribution_receipt_amount))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.contribution_receipt_amount))
            .attr("fill", "steelblue");
    });