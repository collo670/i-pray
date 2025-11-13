// Function to handle daily readings navigation
function navigateToDailyReading() {
    try {
        const today = new Date();
        const day = today.getDate();
        const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = today.getMonth();
        const shortMonth = shortMonths[monthIndex];
        const longMonth = longMonths[monthIndex];
        
        // Format filename to match actual files (with space)
        const fileName = `${day} ${shortMonth}.html`;
        
        // Check if running locally or on GitHub Pages
        const baseUrl = window.location.hostname === "collo670.github.io" ? "/i-pray" : "";
        
        // Navigate to the daily reading file in the current month's folder
        const readingPath = `${baseUrl}/assets/months/${longMonth}/${fileName}`;
        console.log('Attempting to load readings from:', readingPath);
        window.location.href = readingPath;
    } catch (error) {
        console.error('Error navigating to daily readings:', error);
        alert('Unable to load daily readings. Please try again later.');
    }
}