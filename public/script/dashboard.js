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
    const chart = new Chart(salesChart, {
        type: 'bar',
        data: {
            labels: [], // x-axis, years, weeks and daily hours 
            datasets: [{
                label: 'Sales by Month',
                data: [], // Leave this empty initially, it will be updated later
                backgroundColor: 'blue',
                borderColor: 'yellow', // Adjust the color as needed
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1000, // Set the maximum value for the y-axis
                    stepSize: 10, // Set the step size for the y-axis
                },
            },
        },
    });
   
//********************************************************************************
///Form event listener / fetching data from sales collection
//********************************************************************************
    formFilter.addEventListener('submit', async (event) => {
        event.preventDefault();
        const timeframe = timeframeSelect.value;
        let params = {};

        if (timeframe === 'daily') {
            params.date = document.getElementById('calendar').value;
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

                // Update the chart data based on the fetched salesData
                updateChartWithData(salesData.salesData, timeframe);
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
    function updateChartWithData(salesData, timeframe) {
        // Initialize variables to store labels and sales data

        console.log(salesData);
        let labels = [];
        let salesByPeriod = [];
   
        if (timeframe === 'daily') {

            // Display sales data on a daily basis
            labels = Array.from({ length: 24 }, (_, i) => {
                const hour = i % 12 === 0 ? 12 : i % 12; // Convert 0 to 12
                const period = i < 12 ? 'AM' : 'PM'; // Determine AM or PM
                return `${hour.toString().padStart(2, '0')}:00 ${period}`;
            });

            let dailySales = 0;
            let totalSold = 0;

            salesByPeriod = Array(24).fill(0); // Initialize sales data for each hour

            // Calculate the hour of the day for each sale and update salesByPeriod
            salesData.forEach(item => {
                const itemDate = new Date(item.created_at);
                const hour = itemDate.getHours();
                const itemSold = item.items[0].quantity;
                totalSold += itemSold;
                salesByPeriod[hour] += itemSold;
                dailySales += item.totalPrice;
            });

            chart.data.datasets[0].label = 'Sales by Date';
            salesDisplay.innerHTML = 
            `<p><strong>Daily Sales:</strong> 
                <span class='float-right-span'>${dailySales.toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>`;

            quantityDisplay.innerHTML = 
            `<p>
                <strong>Total Sold:</strong> 
                <span class='float-right-span'>${totalSold} item/s</span>
            </p>`;
        }        
        else if (timeframe === 'quarterly') {
            labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            let quarterlySales = [0, 0, 0, 0];
            let totalSold = 0;

            salesByPeriod = Array(4).fill(0);
        
            salesData.forEach(item => {
                const itemDate = new Date(item.created_at);
                const quarter = Math.floor(itemDate.getMonth() / 3); // 0, 1, 2, or 3
                const itemSold = item.items[0].quantity;
                totalSold += itemSold;
                // quarterlySales += item.totalPrice;
                quarterlySales[quarter] += item.totalPrice;
                salesByPeriod[quarter] += item.items[0].quantity;
            });
        
            chart.data.datasets[0].label = 'Sales by Quarter';
            salesDisplay.innerHTML = 
            `<p>
                <strong>Q1 Sales:</strong> <span class='float-right-span'>${quarterlySales[0].toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>

            <p>
                <strong>Q2 Sales:</strong> <span class='float-right-span'>${quarterlySales[1].toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>

            <p>
                <strong>Q3 Sales:</strong> <span class='float-right-span'>${quarterlySales[2].toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>

            <p>
                <strong>Q4 Sales:</strong> <span class='float-right-span'>${quarterlySales[3].toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>`;

            quantityDisplay.innerHTML = 
            `<p>
                <strong>Total Sold:</strong> 
                <span class='float-right-span'>${totalSold} item/s</span>
            </p>`;
        }
        else if (timeframe === 'yearly') {
       
            labels = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            let annualSales = 0;
            let totalSold = 0;

            salesByPeriod = Array(12).fill(0); // Initialize sales data for each month

            salesData.forEach(item => {
                const itemMonth = new Date(item.created_at).getMonth(); // Months are 0-indexed
                const itemSales = item.items[0].quantity;
                totalSold += itemSales;
                salesByPeriod[itemMonth] += itemSales;
                annualSales += item.totalPrice;
            });
            chart.data.datasets[0].label = 'Sales by Month';
            salesDisplay.innerHTML = 
            `<p>
                <strong>Annual Sales:</strong> 
                <span class='float-right-span'>${annualSales.toLocaleString('en-PH', { 
                    style: 'currency', 
                    currency: 'PHP' 
                })}</span>
            </p>`;

            quantityDisplay.innerHTML = 
            `<p>
                <strong>Total Sold:</strong> 
                <span class='float-right-span'>${totalSold} item/s</span>
            </p>`;
        }
        
        // Calculate the maximum value for the y-axis scale based on the data
        const maxY = Math.max(...salesByPeriod);
    
        // Check if maxY is less than 100, and if so, set it to 100
        const maxYWithMinimum = maxY < 100 ? 100 : maxY;

        // Round maxY up to the nearest hundreds value
        const maxYRounded = Math.ceil(maxYWithMinimum / 100) * 100;

        // Update the chart's data based on the selected option
        chart.data.labels = labels;
        chart.data.datasets[0].data = salesByPeriod;

        // Update the y-axis scale
        chart.options.scales.y.max = maxYRounded;

        // Update the chart
        chart.update();
    }
//********************************************************************************
///Auto load chart updates
//********************************************************************************
    timeframeSelect.value = "yearly";

    // Trigger the filter update
    toggleFilterVisibility();
  
    // Trigger the form submission
    formFilter.dispatchEvent(new Event('submit'));
//********************************************************************************
///End
//********************************************************************************
});
