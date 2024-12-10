/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Global variable to store cleaned data
let cleanedData;

// Load FEC and Campaign Committee data
let promises = [
    d3.csv("data/cleaned_fec_data.csv"),
    d3.csv("data/campaign_committees_outside_groups.csv")
];

Promise.all(promises)
    .then(function(data) {
        // Clean and process data
        let fecData = data[0];
        cleanedData = fecData.map(d => ({
            committee_id: d.committee_id,
            file_number: +d.file_number,
            committee_name: d.committee_name,
            report_year: +d.report_year,
            contributor_name: d.contributor_name,
            recipient_committee_type: d.recipient_committee_type,
            contributor_street_1: d.contributor_street_1,
            contributor_street_2: d.contributor_street_2,
            contributor_city: d.contributor_city,
            contributor_state: d.contributor_state,
            contributor_zip: d.contributor_zip,
            contributor_employer: d.contributor_employer,
            contributor_occupation: d.contributor_occupation,
            contribution_receipt_date: d3.timeParse("%Y-%m-%d")(d.contribution_receipt_date),
            contribution_receipt_amount: +d.contribution_receipt_amount
        }));

        let ccogData = data[1];
        ccogData = ccogData.map(d => ({
            candidate: d.candidate,
            organization: d.organization,
            type: d.type,
            total_raised: +d.total_raised.replace(/[$,]/g, "")
        }));

        // Log data to console (view on page with cmd+shift+i)
        console.log("Cleaned Data:", cleanedData);
        console.log("Campaign Committee & Outside Contributions Data:", ccogData);

        // Initialize visualizations
        const topDonorsVis = new TopDonors("top-donors", cleanedData);
        const topRecipientsVis = new TopRecipients("top-recipients", cleanedData);
        const histogramVis = new Histogram("histogram", cleanedData);
        const totalContributionsVis = new TotalContributions("total-contributions", ccogData);
        const contributionsOverTimeVis = new ContributionsOverTime("contributions-over-time", cleanedData);
        
        // Initialize the map vis
        const mapVis = new CustomMap("map", cleanedData, [42.373611, -71.109733]); // Centered on Cambridge
    })
    .catch(function(err) {
        console.error("Error loading data:", err);
    });