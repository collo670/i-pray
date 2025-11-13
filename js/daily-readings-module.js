// Daily Readings Module
const DailyReadings = {
    // Format the date as a human-readable string
    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    // Get the file path for today's reading
    getTodayReadingPath() {
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
        return `${baseUrl}/assets/${longMonth}/${fileName}`;
    },

    // Create the daily readings card
    createReadingsCard(translations, lang) {
        const readingsCard = document.createElement('div');
        readingsCard.className = 'rounded-2xl p-6 bg-white shadow-lg card-hover cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center h-32';
        readingsCard.innerHTML = `
            <h3 class="text-xl font-bold text-purple-600">${translations[lang].dailyReadings}</h3>
            <p class="text-xs font-medium text-gray-500 mt-2">${translations[lang].tapToView}</p>
        `;
        
        // Add click handler
        readingsCard.addEventListener('click', () => {
            try {
                const readingPath = this.getTodayReadingPath();
                console.log('Attempting to load readings from:', readingPath);
                window.location.href = readingPath;
            } catch (error) {
                console.error('Error loading daily readings:', error);
                alert('Unable to load daily readings. Please try again later.');
            }
        });

        return readingsCard;
    }
};

// Export the module
window.DailyReadings = DailyReadings;