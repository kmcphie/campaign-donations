/* * * * * * *  * * * *
*         Map         *
* * * * * * * * * * * */

/*
*  Helper function for custom Leaflet icons
*/
function createDivIconWithBorder(iconUrl) {
    return L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-with-border"><img src="' + iconUrl + '" width="32" height="32"></div>',
        iconSize: [36, 36],
        iconAnchor: [22, 22],
        popupAnchor: [-3, -25]
    });
}

// Create custom Leaflet marker icons for each professor
const barakIcon = createDivIconWithBorder('img/marker-barak.png');
const brennanIcon = createDivIconWithBorder('img/marker-brennan.png');
const chongIcon = createDivIconWithBorder('img/marker-chong.png');
const dworkIcon = createDivIconWithBorder('img/marker-dwork.png');
const kohlerIcon = createDivIconWithBorder('img/marker-kohler.png');
const mickensIcon = createDivIconWithBorder('img/marker-mickens.png');
const pfisterIcon = createDivIconWithBorder('img/marker-pfister.png');
const shieberIcon = createDivIconWithBorder('img/marker-shieber.png');
const sudanIcon = createDivIconWithBorder('img/marker-sudan.png');
const vadhanIcon = createDivIconWithBorder('img/marker-vadhan.png');
const waldoIcon = createDivIconWithBorder('img/marker-waldo.png');

class CustomMap {

    /*
     *  Constructor method
     */
    constructor(parentElement, data, mapCenter) {
        this.parentElement = parentElement;
        this.data = data;
        this.mapCenter = mapCenter;

        this.initVis();
    }

    /*
     *  Initialize map of addresses
     */
    initVis () {
        let vis = this;

        // Specify the path to the Leaflet images
        L.Icon.Default.imagePath = 'img/';

        // Create an array of locations referenced
        // note: coordinates from latlong.net (converted from addresses in the data)
        vis.locations = [];
        vis.locations.push({ name: "Shieber, Stuart", latlng: [42.348419, -71.123834], index: 0, icon: shieberIcon });
        vis.locations.push({ name: "Sudan, Madhu", latlng: [42.400741, -71.173409], index: 1, icon: sudanIcon });
        vis.locations.push({ name: "Dwork, Cynthia", latlng: [37.442613, -122.138750], index: 2, icon: dworkIcon });
        vis.locations.push({ name: "Chong, Stephen", latlng: [42.394319, -71.129341], index: 3, icon: chongIcon });
        vis.locations.push({ name: "Barak, Boaz", latlng: [42.387900, -71.126296], index: 4, icon: barakIcon });
        vis.locations.push({ name: "Mickens, James", latlng: [42.367039, -71.060087], index: 5, icon: mickensIcon });
        vis.locations.push({ name: "Kohler, Eddie", latlng: [42.386439, -71.118229], index: 6, icon: kohlerIcon });
        vis.locations.push({ name: "Pfister, Hanspeter", latlng: [42.406093, -71.153940], index: 7, icon: pfisterIcon });
        vis.locations.push({ name: "Vadhan, Salil", latlng: [42.342711, -71.132846], index: 8, icon: vadhanIcon });
        vis.locations.push({ name: "Brennan, Karen", latlng: [42.359874, -71.101001], index: 9, icon: brennanIcon });
        vis.locations.push({ name: "Waldo, James", latlng: [42.719921, -71.270761], index: 10, icon: waldoIcon });

        console.log("LOCATION DATA:");
        console.log(vis.locations);

        console.log("FULL DATA:");
        console.log(vis.data);

        // Define the map and set its center and zoom level
        vis.zoomLevel = 13;
        vis.map = L.map(vis.parentElement).setView(vis.mapCenter, vis.zoomLevel);

        // Load and display a tile layer on the map
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        }).addTo(vis.map);
        // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        //     attribution: 'OpenStreetMap'
        // }).addTo(vis.map);

        // Create a LayerGroup to hold the markers
        vis.addressLayer = L.layerGroup().addTo(vis.map);

        vis.wrangleData();

        // Create a space for the images to go
        vis.imgWidth = 500;
        vis.imgHeight = 225;
        d3.select("#place-img").append("svg").attr("width",vis.imgWidth).attr("height",vis.imgHeight);
    }

    /*
     * Update description based on selected professor
     */
    updateDescription(professor) {
        let vis = this;

        if (!professor) {
            console.error("Invalid professor passed to updateDescription.");
            return;
        } else {
            console.log("Professor is: ", professor);
        }

        // // Find the professor name based on the clicked location
        // let profName;
        // profName = vis.findProfessorName(clickedLocation);

        let clickedProfessor = vis.locations.find(entry => entry.name === professor);
        let index;
        index = vis.findIndex(L.latLng(clickedProfessor.latlng));
        console.log("Professor index: ", index);

        // Find the lyrics data for the clicked location name
        const selectedProf = vis.data.find(entry => 
            entry["contributor_name"] &&
            entry["contributor_name"].trim().toLowerCase() === professor.trim().toLowerCase()
        );

        // Filter contributions by selectedProf
        const professorContributions = vis.data.filter(entry => 
            (entry["contributor_name"] || "").trim().toLowerCase() === selectedProf.contributor_name.trim().toLowerCase()
        );

        // Group contributions by report year
        const contributionsByYear = d3.rollup(
            professorContributions,
            group => d3.sum(group, d => d.contribution_receipt_amount),
            d => d.report_year
        );

        // Convert grouped data to array
        const yearSummary = Array.from(contributionsByYear, ([year, total]) => ({
            year,
            total
        }));

        // Extract unique committee names
        const committeeNames = Array.from(
            new Set(professorContributions.map(d => d.committee_name))
        );

        // Update the content of professor div
        const professorDiv = document.getElementById('professor-description');
        if (selectedProf) {
            if (professorContributions.length > 0) {
                // Build the inner HTML dynamically
                let htmlContent = `<p><b>Professor:</b> ${selectedProf.contributor_name}</p>
                                   <p><b>Address:</b> ${professorContributions[0].contributor_street_1}</p>
                                   <p>${professorContributions[0].contributor_city}, ${professorContributions[0].contributor_state}</p>
                                   <p><b>Total Contributions:</b> $${d3.sum(professorContributions, d => d.contribution_receipt_amount).toLocaleString()}</p>
                                   <p><b>Yearly Summary:</b></p>
                                   <ul>`;
                
                // Add the yearly summaries as a list
                yearSummary.forEach(summary => {
                    htmlContent += `<li><b>${summary.year}:</b> $${summary.total.toLocaleString()}</li>`;
                });
        
                htmlContent += `</ul>
                                <p><b>Committees Donated To:</b></p>`;
                professorDiv.innerHTML = htmlContent;
                // Add the committee names as a list
                committeeNames.forEach(name => {
                    htmlContent += `<li>${name}</li>`;
                });

                htmlContent += `</ul>`;
                professorDiv.innerHTML = htmlContent;
            } else {
                professorDiv.innerHTML = '<p>No contributions found for this professor.</p>';
            }
            // Update image of house
            let place_img_path = "img/place-" + index.toString() + ".png";
            console.log("place_img_path is: ", place_img_path);

            // Remove old image if applicable
            d3.select("#place").selectAll("svg").remove();

            // Scale new image
            const img = new Image();
            img.onload = function () {
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;

            const scale = Math.min(vis.imgWidth / imgWidth, vis.imgHeight / imgHeight);

            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            console.log(`Original Dimensions: ${imgWidth}x${imgHeight}`);
            console.log(`Scaled Dimensions: ${scaledWidth}x${scaledHeight}`);

            // Add new image
            d3.select("#place")
                .append("svg")
                .attr("width", vis.imgWidth)
                .attr("height", vis.imgHeight)
                .append("image")
                .attr("x", 0)
                .attr("y", (vis.imgHeight - scaledHeight) / 2)
                .attr("width", scaledWidth)
                .attr("height", scaledHeight)
                .attr("class", "place-1")
                .attr("xlink:href", place_img_path);
            };
            img.src = place_img_path;
        } else {
            professorDiv.innerHTML = '<p>Click on a picture to learn more about the professor who lives there!</p>';
        }
    }

    /*
     * Find professor name based on clicked location (helper function)
     */
    findProfessorName(clickedLocation) {
        let vis = this;

        if (!clickedLocation) {
            console.error("Invalid clickedLocation passed to findProfessorName.");
            return null;
        }    

        let closestLocation;

        // Loop through locations and find the closest based on distance
        closestLocation = vis.locations.reduce((closest, current) => {
            const closestDistance = clickedLocation.distanceTo(closest.latlng);
            const currentDistance = clickedLocation.distanceTo(current.latlng);
            return currentDistance < closestDistance ? current : closest;
        }, vis.locations[0]); // Assume the first entry as the initial closest

        return closestLocation.name;
    }

    /*
     * Find index based on clicked location (helper function)
     */
    findIndex(clickedLocation) {
        let vis = this;

        let closestLocation;

        // Loop through locations and find the closest based on distance
        closestLocation = vis.locations.reduce((closest, current) => {
            const closestDistance = clickedLocation.distanceTo(closest.latlng);
            const currentDistance = clickedLocation.distanceTo(current.latlng);
            return currentDistance < closestDistance ? current : closest;
        }, vis.locations[0]); // Assume the first entry as the initial closest

        return closestLocation.index;
    }

    /*
     * Event handler for location click
     */
    professorClickHandler(professor) {
        let vis = this;

        // Find the clicked professor
        let clickedProfessor = vis.locations.find(entry => entry.name === professor);

        // Update professor description if applicable
        if (clickedProfessor) {
            // vis.updateDescription(L.latLng(clickedProfessor.latlng));
            vis.updateDescription(professor);
        } else {
            console.log("No professor found for the clicked location.");
        }
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;

        // No data wrangling/filtering needed

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear the existing markers from the LayerGroup
        vis.addressLayer.clearLayers();

        // Add each location referenced to map
        vis.locations.forEach(object => {
            const marker = L.marker(object.latlng, { icon: object.icon });
            const popup = L.popup({ closeButton: false }).setContent(object.name);
        
            marker.bindPopup(popup);
            console.log(`Adding marker for: ${object.name}`);

            marker.on('mouseover', function () {
                this.openPopup();
            });
            marker.on('mouseout', function () {
                this.closePopup();
            });
            marker.addTo(vis.map);
        
            marker.on('click', function () {
                vis.professorClickHandler(object.name);
            });
        });


        // Set up event listener for map clicks
        vis.map.on('click', function (event) {
            // Check if the click is not on a marker
            if (!event.layer) {
                const clickedProfessor = vis.findProfessorName(event.latlng);
                vis.professorClickHandler(clickedProfessor);
            }
        });
    }
}