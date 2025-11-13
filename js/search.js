// Search functionality for prayers and readings
class PrayerSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchData = [];
        this.init();
    }

    async init() {
        if (!this.searchInput) return;
        
        // Load search data
        await this.loadSearchData();
        
        // Setup event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => this.showResults());
        
        // Mobile search button
        const mobileSearchBtn = document.getElementById('mobileSearchBtn');
        if (mobileSearchBtn) {
            mobileSearchBtn.addEventListener('click', () => {
                const searchContainer = this.searchInput.closest('.search-container');
                if (searchContainer) {
                    searchContainer.classList.toggle('hidden');
                    if (!searchContainer.classList.contains('hidden')) {
                        this.searchInput.focus();
                    }
                }
            });
        }
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideResults();
            }
        });

        // Handle keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    async loadSearchData() {
        // Build search index from navigation items
        const navItems = [
            { title: 'Office of Readings', link: 'pages/ofisi ya masomo/index.html', keywords: ['scripture', 'readings', 'office', 'masomo'] },
            { title: 'Compline', link: 'pages/compline.html', keywords: ['compline', 'evening', 'night', 'prayer', 'sala ya usiku'] },
            { title: 'Holy Rosary', link: 'pages/holy-rosary.html', keywords: ['rosary', 'rozari', 'mary', 'virgin', 'hail mary'] },
            { title: 'Prayer to Carmen', link: 'pages/carmen.html', keywords: ['carmen', 'hernandez', 'neocatechumenal', 'prayer'] },
            { title: 'Morning Prayer', link: 'pages/prayer.html', keywords: ['morning', 'lauds', 'masifu', 'prayer'] },
            { title: 'Way of the Cross', link: 'pages/via-cruce.html', keywords: ['stations', 'cross', 'passion', 'via cruce', 'njia ya msalaba'] },
            { title: 'Lauds - Monday', link: 'pages/jumatatu1.html', keywords: ['lauds', 'monday', 'jumatatu', 'morning'] },
            { title: 'Lauds - Tuesday', link: 'pages/jumanne1.html', keywords: ['lauds', 'tuesday', 'jumanne', 'morning'] },
            { title: 'Lauds - Wednesday', link: 'pages/jumatano1.html', keywords: ['lauds', 'wednesday', 'jumatano', 'morning'] },
            { title: 'Lauds - Thursday', link: 'pages/alhamisi1.html', keywords: ['lauds', 'thursday', 'alhamisi', 'morning'] },
            { title: 'Lauds - Friday', link: 'pages/ijumaa1.html', keywords: ['lauds', 'friday', 'ijumaa', 'morning'] },
            { title: 'Lauds - Saturday', link: 'pages/jumamosi1.html', keywords: ['lauds', 'saturday', 'jumamosi', 'morning'] },
            { title: 'Lauds - Sunday', link: 'pages/jumapili1.html', keywords: ['lauds', 'sunday', 'dominika', 'morning'] },
        ];

        this.searchData = navItems;
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideResults();
            return;
        }

        const results = this.search(query.toLowerCase());
        this.displayResults(results);
        this.showResults();
    }

    search(query) {
        return this.searchData.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query);
            const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(query));
            return titleMatch || keywordMatch;
        }).slice(0, 8); // Limit to 8 results
    }

    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-title">No results found</div>
                    <div class="search-result-snippet">Try different keywords</div>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" data-link="${item.link}">
                <div class="search-result-title">${this.highlightMatch(item.title, this.searchInput.value)}</div>
                <div class="search-result-snippet">${item.keywords.slice(0, 2).join(' • ')}</div>
            </div>
        `).join('');

        // Add click handlers
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const link = item.getAttribute('data-link');
                if (link) {
                    window.location.href = link;
                }
            });
        });
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }

    showResults() {
        if (this.searchResults.innerHTML.trim()) {
            this.searchResults.classList.add('active');
        }
    }

    hideResults() {
        this.searchResults.classList.remove('active');
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.hideResults();
            this.searchInput.blur();
        }
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PrayerSearch();
    });
} else {
    new PrayerSearch();
}

