document.addEventListener('DOMContentLoaded', () => {
    // Get references to the filter select elements
    const timeframeSelect = document.getElementById("timeframe");
    const yearlyFilter = document.querySelector(".yearly-filter");
    const quarterlyFilter = document.querySelector(".quarterly-filter");
    const dailyFilter = document.querySelector(".daily-filter");
    const yearSelect = document.getElementById("year");
    const quarterSelect = document.getElementById("quarter");
    const formFilter = document.getElementById("form-filter");
    const salesDisplay = document.getElementById("sales-display");
    const quantityDisplay = document.getElementById("quantity-display");
    const rangeFilter = document.getElementById("range-filter");
    const applyFilterButton = document.getElementById("apply-filter");
    let calendarInput = document.getElementById('calendar');

    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 20; 

//********************************************************************************
///Filter Handler
//********************************************************************************
    function toggleFilterVisibility() {
        const selectedTimeframe = timeframeSelect.value;

        yearlyFilter.style.display = "none";
        quarterlyFilter.style.display = "none";
        dailyFilter.style.display = "none";

        if (selectedTimeframe === "yearly") {
            yearlyFilter.style.display = "block";
        } 
        else if (selectedTimeframe === "quarterly") {
            quarterlyFilter.style.display = "block";
        } 
        else if (selectedTimeframe === "daily") {
            dailyFilter.style.display = "block";
            applyFilterButton.disabled = true;

            rangeFilter.addEventListener('change', () => {
                applyFilterButton.disabled = false;
            });
        } 
    }

    function createOption(value, text) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        return option;
    }

    for (let year = currentYear; year <= endYear; year++) {
        const yearOption = createOption(year, year);
        yearSelect.appendChild(yearOption);

        const quarterOption = createOption(year, year); 
        quarterSelect.appendChild(quarterOption);
    }

    timeframeSelect.addEventListener("change", toggleFilterVisibility);
   
//********************************************************************************
///Sales Chart Display 
//********************************************************************************
    // const chart = new Chart(salesChart, {
    //     type: 'bar',
    //     data: {
    //         labels: [], // x-axis, years, weeks and daily hours 
    //         datasets: [{
    //             label: 'Sales by Month',
    //             data: [], // Leave this empty initially, it will be updated later
    //             backgroundColor: 'blue',
    //             borderColor: 'yellow', // Adjust the color as needed
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //                 max: 1000, // Set the maximum value for the y-axis
    //                 stepSize: 10, // Set the step size for the y-axis
    //             },
    //         },
    //     },
    // });
   
//********************************************************************************
///Form event listener / fetching data from sales collection
//********************************************************************************
    formFilter.addEventListener('submit', async (event) => {
        event.preventDefault();
        const timeframe = timeframeSelect.value;
        let params = {};

        if (calendarInput.value === '') {
            // Set the default value of the date input field to the current date
            calendarInput.valueAsDate = new Date();
        }

        if (timeframe === 'daily') {
            // params.date = document.getElementById('calendar').value;
            params.date = calendarInput.value;
        } else if (timeframe === 'quarterly') {
            params.quarter = document.getElementById('quarter').value;
        } else if (timeframe === 'yearly') {
            params.year = document.getElementById('year').value;
        }
        
        // Create the URL for the /getSalesData endpoint with the query string
        const queryString = new URLSearchParams(params).toString();

        const getSalesDataURL = `/getSalesData?${queryString}`;
        try {
            const response = await fetch(getSalesDataURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const salesData = await response.json();
                console.log(salesData);
                // Update the chart data based on the fetched salesData
                // updateChartWithData(salesData.salesData, timeframe);
                populateTable(salesData);
            } else {
                console.error('Failed to fetch sales data');
            }
        } 
        catch (error) {
            console.error('An error occurred while fetching sales data', error);
        }
    });

//********************************************************************************
///Update Chart 
//********************************************************************************
function populateTable(data) {
  
}


//********************************************************************************
///Auto load chart updates
//********************************************************************************
    timeframeSelect.value = "daily";

    // Trigger the filter update
    toggleFilterVisibility();
  
    // Trigger the form submission
    formFilter.dispatchEvent(new Event('submit'));
//********************************************************************************
///End
//********************************************************************************
});
