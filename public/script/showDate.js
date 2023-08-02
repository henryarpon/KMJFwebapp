document.addEventListener("DOMContentLoaded", () => {

//********************************************************************************
//// DOM Element Selection
//********************************************************************************
const dateElements = document.querySelectorAll(".date");

//********************************************************************************
//// Date event listener - updates the format and calculate time passed since posted
//********************************************************************************
dateElements.forEach((dateElement) => {
    const createdTimestamp = new Date(dateElement.getAttribute("data-created"));
    const now = new Date();
    const diffInMilliseconds = now - createdTimestamp;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
        dateElement.textContent = "just now";
    } 
    else if (diffInMinutes < 60) {
        dateElement.textContent = diffInMinutes + " minutes ago";
    } 
    else if (diffInHours === 1) {
        dateElement.textContent = "1 hour ago";
    } 
    else if (diffInMinutes < 1440) {
        dateElement.textContent = diffInHours + " hours ago";
    } 
    else {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        
        const day = createdTimestamp.getDate();
        const monthIndex = createdTimestamp.getMonth();
        const year = createdTimestamp.getFullYear();
        const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;
        dateElement.textContent = formattedDate;
    }
    });
});