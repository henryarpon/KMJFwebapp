document.addEventListener('DOMContentLoaded', () => {
    // Get references to the filter select elements
    const timeframeSelect = document.getElementById("timeframe");
    const yearlyFilter = document.querySelector(".yearly-filter");
    const monthlyFilter = document.querySelector(".monthly-filter");
    const dailyFilter = document.querySelector(".daily-filter");
    const yearSelect = document.getElementById("year");
    const monthSelect = document.getElementById("monthly");
    const formFilter = document.getElementById("form-filter");
    const salesDisplay = document.getElementById("sales-display");
    const quantityDisplay = document.getElementById("quantity-display");
    const rangeFilter = document.getElementById("range-filter");
    const applyFilterButton = document.getElementById("apply-filter");
    const timeframeDisplay = document.querySelector(".timeframe_display");
    const totalDisplay = document.querySelector(".total_display");
    const pdfButton = document.getElementById('generate-pdf-btn')
    let calendarInput = document.getElementById('calendar');

    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 20; 
    let pdfFileName;

//********************************************************************************
///Filter Handler
//********************************************************************************

    function toggleFilterVisibility() {
        const selectedTimeframe = timeframeSelect.value;
        
        yearlyFilter.style.display = "none";
        monthlyFilter.style.display = "none";
        dailyFilter.style.display = "none";

        if (selectedTimeframe === "yearly") {
            yearlyFilter.style.display = "block";
        } 
        else if (selectedTimeframe === "monthly") {
            monthlyFilter.style.display = "block";
        } 
        else if (selectedTimeframe === "daily") {
            dailyFilter.style.display = "block";
            // applyFilterButton.disabled = true;

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
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    months.forEach((month, index) => {
        const monthOption = createOption(index + 1, month);
        monthSelect.appendChild(monthOption);
    });

    timeframeSelect.addEventListener("change", toggleFilterVisibility);
     
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
        } else if (timeframe === 'monthly') {
            params.monthly = document.getElementById('monthly').value;
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
             
                populateTable(salesData.salesData, timeframe);
                
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
<<<<<<< HEAD
    function updateChartWithData(salesData, timeframe) {
        // Initialize variables to store labels and sales data

        console.log(salesData);
        let labels = [];
        let salesByPeriod = [];
   
        if (timeframe === 'daily') {
=======
>>>>>>> dashboard

    const capitalizeFirstLetter = (string) => {
        return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
    };

    const currencyFormatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    });

    function populateTable(salesData, timeframe) {
        const tableBody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
        let monthIndex = document.getElementById('monthly').value;
        let totalSales = 0;
    
        // Clear existing rows
        tableBody.innerHTML = '';
    
        // Loop through each sale object in the salesData array
        salesData.forEach(sale => {
    
            // Loop through each item in the sale object
            sale.items.forEach(item => {
    
                const row = document.createElement('tr');
    
                // Create cells for each column
                const skuCell = document.createElement('td');
                skuCell.textContent = item.sku;
                row.appendChild(skuCell);
    
                const productNameCell = document.createElement('td');
                productNameCell.textContent = item.productName;
                row.appendChild(productNameCell);
    
                const quantityCell = document.createElement('td');
                quantityCell.textContent = item.quantity;
                row.appendChild(quantityCell);
    
                const priceCell = document.createElement('td');
                priceCell.textContent = item.price
                row.appendChild(priceCell);
    
                const totalPriceCell = document.createElement('td');
                totalPriceCell.textContent = item.price * item.quantity;
                row.appendChild(totalPriceCell);
        
                // Append the row to the table body
                tableBody.appendChild(row);
            });
    
            totalSales += sale.totalPrice;
        });
    
        if (timeframe === "daily") {
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            timeframeDisplay.textContent = `Daily Sales Report as of ${formattedDate}`;
            pdfFileName = timeframeDisplay.textContent;
        }
        else if (timeframe === "monthly") {
            const currentMonth = months[monthIndex -1]; // Get the month name from the array using the monthIndex
            const currentYear = new Date().getFullYear();
            timeframeDisplay.textContent = `Monthly Sales Report for ${currentMonth} ${currentYear}`;
            pdfFileName = timeframeDisplay.textContent;
        }
        else if (timeframe === "yearly") {
            const currentYear = new Date().getFullYear();
            timeframeDisplay.textContent = `Annual Sales Report for ${currentYear}`;
            pdfFileName = timeframeDisplay.textContent;
        }
        
        salesDisplay.textContent = `Timeframe: ${capitalizeFirstLetter(timeframe)}`;
        quantityDisplay.textContent = `Total Sales: ${currencyFormatter.format(totalSales)}`;
        totalDisplay.textContent = `TOTAL SALES: ${currencyFormatter.format(totalSales)}`;
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
/// Generate PDF to print
//********************************************************************************
    pdfButton.addEventListener('click', function() {
        const elementsToPrint = document.getElementById('document');

        const filename = `${pdfFileName}.pdf`;

        const options = {
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(options).from(elementsToPrint).save();
    });
//********************************************************************************
///End
//********************************************************************************
});
