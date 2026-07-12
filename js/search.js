// Enhanced Search functionality for prayers and readings
class EnhancedPrayerSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchData = [];
        this.fuse = null;
        this.searchHistory = [];
        this.currentFilters = {
            type: 'all',
            season: 'all',
            saint: 'all'
        };
        this.init();
    }

    async init() {
        if (!this.searchInput) return;

        // Load search data
        await this.loadSearchData();

        // Initialize Fuse.js
        this.initializeFuse();

        // Setup event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => this.showResults());

        // Search filter buttons
        document.querySelectorAll('.search-filter').forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });

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

        // Load search history
        this.loadSearchHistory();
    }

    async loadSearchData() {
        // Comprehensive search index with full content
        const searchItems = [
            // Main prayers and devotions
            {
                id: 'office-readings',
                title: 'Office of Readings',
                link: 'pages/prayer-hour.html?hour=readings',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Scripture readings office of readings masomo daily readings bible scripture liturgy',
                keywords: ['scripture', 'readings', 'office', 'masomo', 'bible', 'liturgy', 'daily']
            },
            {
                id: 'compline',
                title: 'Compline (Evening Prayer)',
                link: 'pages/compline.html',
                type: 'liturgical',
                season: 'all',
                content: 'Compline evening prayer night prayer sala ya usiku bedtime prayer sleep peace rest',
                keywords: ['compline', 'evening', 'night', 'prayer', 'sala ya usiku', 'bedtime', 'peace']
            },
            {
                id: 'holy-rosary',
                title: 'Holy Rosary',
                link: 'pages/holy-rosary.html',
                type: 'devotional',
                season: 'all',
                content: 'Rosary Mary Virgin Hail Mary Ave Maria mysteries joyful sorrowful glorious luminous',
                keywords: ['rosary', 'rozari', 'mary', 'virgin', 'hail mary', 'mysteries', 'joyful', 'sorrowful']
            },
            {
                id: 'carmen-prayer',
                title: 'Prayer to Carmen Hernández',
                link: 'pages/carmen.html',
                type: 'devotional',
                season: 'all',
                saint: 'carmen',
                content: 'Carmen Hernández Neocatechumenal Way co-founder Jesus Christ Church Holy Scripture liturgical prayer Gospel mission cross fidelity baptism grace',
                keywords: ['carmen', 'hernandez', 'neocatechumenal', 'prayer', 'jesus', 'church', 'scripture']
            },
            {
                id: 'morning-prayer',
                title: 'Morning Prayer (Lauds)',
                link: 'pages/prayer.html',
                type: 'liturgical',
                season: 'all',
                content: 'Morning prayer lauds masifu asubuhi dawn sunrise day begin morning office liturgy',
                keywords: ['morning', 'lauds', 'masifu', 'prayer', 'dawn', 'sunrise', 'office']
            },
            {
                id: 'way-of-cross',
                title: 'Way of the Cross',
                link: 'pages/via-cruce.html',
                type: 'devotional',
                season: 'lent',
                content: 'Stations of the Cross Passion Via Crucis Calvary Jesus suffering crucifixion salvation',
                keywords: ['stations', 'cross', 'passion', 'via cruce', 'njia ya msalaba', 'jesus', 'suffering']
            },
            // Lauds for each day
            {
                id: 'lauds-monday',
                title: 'Lauds - Monday',
                link: 'pages/jumatatu1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Monday morning prayer jumatatu liturgy office morning praise psalm',
                keywords: ['lauds', 'monday', 'jumatatu', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-tuesday',
                title: 'Lauds - Tuesday',
                link: 'pages/jumanne1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Tuesday morning prayer jumanne liturgy office morning praise psalm',
                keywords: ['lauds', 'tuesday', 'jumanne', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-wednesday',
                title: 'Lauds - Wednesday',
                link: 'pages/jumatano1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Wednesday morning prayer jumatano liturgy office morning praise psalm',
                keywords: ['lauds', 'wednesday', 'jumatano', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-thursday',
                title: 'Lauds - Thursday',
                link: 'pages/alhamisi1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Thursday morning prayer alhamisi liturgy office morning praise psalm',
                keywords: ['lauds', 'thursday', 'alhamisi', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-friday',
                title: 'Lauds - Friday',
                link: 'pages/ijumaa1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Friday morning prayer ijumaa liturgy office morning praise psalm',
                keywords: ['lauds', 'friday', 'ijumaa', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-saturday',
                title: 'Lauds - Saturday',
                link: 'pages/jumamosi1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Saturday morning prayer jumamosi liturgy office morning praise psalm',
                keywords: ['lauds', 'saturday', 'jumamosi', 'morning', 'prayer', 'office']
            },
            {
                id: 'lauds-sunday',
                title: 'Lauds - Sunday',
                link: 'pages/jumapili1.html',
                type: 'liturgical',
                season: 'ordinary',
                content: 'Lauds Sunday morning prayer jumapili dominika liturgy office morning praise psalm',
                keywords: ['lauds', 'sunday', 'dominika', 'morning', 'prayer', 'office']
            },
            // PDF Documents (metadata only, since we can't extract text client-side)
            {
                id: 'mass-readings-august',
                title: 'Mass Readings - August 2025',
                link: 'docs/pdfs/Mass-Readings-August-2025-PDF-Download.pdf',
                type: 'document',
                season: 'ordinary',
                content: 'Mass readings August 2025 liturgy scripture gospel epistle sunday monday tuesday wednesday thursday friday saturday',
                keywords: ['mass', 'readings', 'august', '2025', 'liturgy', 'scripture', 'gospel']
            },
            {
                id: 'mass-readings-september',
                title: 'Mass Readings - September 2025',
                link: 'docs/pdfs/Mass-Readings-September-2025-PDF-Download.pdf',
                type: 'document',
                season: 'ordinary',
                content: 'Mass readings September 2025 liturgy scripture gospel epistle sunday monday tuesday wednesday thursday friday saturday',
                keywords: ['mass', 'readings', 'september', '2025', 'liturgy', 'scripture', 'gospel']
            },
            {
                id: 'mass-readings-october',
                title: 'Mass Readings - October 2025',
                link: 'docs/pdfs/Mass-Readings-October-2025-PDF-Download.pdf',
                type: 'document',
                season: 'ordinary',
                content: 'Mass readings October 2025 liturgy scripture gospel epistle sunday monday tuesday wednesday thursday friday saturday',
                keywords: ['mass', 'readings', 'october', '2025', 'liturgy', 'scripture', 'gospel']
            },
            {
                id: 'mass-readings-november',
                title: 'Mass Readings - November 2025',
                link: 'docs/pdfs/Mass-Readings-November-2025-PDF-Download.pdf',
                type: 'document',
                season: 'ordinary',
                content: 'Mass readings November 2025 liturgy scripture gospel epistle sunday monday tuesday wednesday thursday friday saturday',
                keywords: ['mass', 'readings', 'november', '2025', 'liturgy', 'scripture', 'gospel']
            },
            {
                id: 'mass-readings-december',
                title: 'Mass Readings - December 2025',
                link: 'docs/pdfs/Mass-Readings-December-2025-PDF-Download.pdf',
                type: 'document',
                season: 'advent',
                content: 'Mass readings December 2025 advent christmas liturgy scripture gospel epistle sunday monday tuesday wednesday thursday friday saturday',
                keywords: ['mass', 'readings', 'december', '2025', 'advent', 'christmas', 'liturgy']
            },
            // Liturgical seasons and special documents
            {
                id: 'advent-readings',
                title: 'Advent Readings',
                link: 'docs/pdfs/advent 1.pdf',
                type: 'document',
                season: 'advent',
                content: 'Advent readings preparation christmas john baptist mary elizabeth zachary isaiah jeremiah',
                keywords: ['advent', 'readings', 'preparation', 'christmas', 'john baptist']
            },
            {
                id: 'christmas-readings',
                title: 'Christmas Readings',
                link: 'docs/pdfs/christmas.pdf',
                type: 'document',
                season: 'christmas',
                content: 'Christmas readings nativity jesus mary joseph shepherds angels gloria peace goodwill',
                keywords: ['christmas', 'readings', 'nativity', 'jesus', 'mary', 'joseph']
            },
            {
                id: 'lent-readings',
                title: 'Lent Readings',
                link: 'docs/pdfs/lent.pdf',
                type: 'document',
                season: 'lent',
                content: 'Lent readings repentance fasting prayer desert temptation jesus satan forty days',
                keywords: ['lent', 'readings', 'repentance', 'fasting', 'prayer', 'desert']
            },
            {
                id: 'easter-readings',
                title: 'Easter Readings',
                link: 'docs/pdfs/easter 1.pdf',
                type: 'document',
                season: 'easter',
                content: 'Easter readings resurrection jesus tomb mary magdalene disciples alleluia paschal mystery',
                keywords: ['easter', 'readings', 'resurrection', 'jesus', 'alleluia', 'paschal']
            },
            {
                id: 'pentecost-readings',
                title: 'Pentecost Readings',
                link: 'docs/pdfs/pentecost.pdf',
                type: 'document',
                season: 'ordinary',
                content: 'Pentecost readings holy spirit tongues fire apostles peter paul mission church',
                keywords: ['pentecost', 'readings', 'holy spirit', 'tongues', 'fire', 'apostles']
            }
        ];

        this.searchData = searchItems;
    }

    initializeFuse() {
        const options = {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'content', weight: 0.3 },
                { name: 'keywords', weight: 0.3 }
            ],
            threshold: 0.3,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2
        };

        this.fuse = new Fuse(this.searchData, options);
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.displaySearchHistory();
            this.showResults();
            return;
        }

        const results = this.search(query);
        this.displayResults(results);
        this.showResults();

        // Add to search history
        this.addToSearchHistory(query);
    }

    search(query) {
        if (!this.fuse) return [];

        let results = this.fuse.search(query);

        // Apply filters
        results = results.filter(result => {
            const item = result.item;
            if (this.currentFilters.type !== 'all' && item.type !== this.currentFilters.type) return false;
            if (this.currentFilters.season !== 'all' && item.season !== this.currentFilters.season && item.season !== 'all') return false;
            if (this.currentFilters.saint !== 'all' && item.saint !== this.currentFilters.saint) return false;
            return true;
        });

        return results.slice(0, 10); // Limit to 10 results
    }

    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-title">No results found</div>
                    <div class="search-result-snippet">Try different keywords or adjust filters</div>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(result => {
            const item = result.item;
            const score = result.score;
            const typeIcon = this.getTypeIcon(item.type);
            const seasonBadge = item.season !== 'all' ? `<span class="season-badge">${item.season}</span>` : '';

            return `
                <div class="search-result-item" data-link="${item.link}" data-type="${item.type}">
                    <div class="search-result-header">
                        <div class="search-result-title">
                            ${typeIcon} ${this.highlightMatch(item.title, this.searchInput.value)}
                            ${seasonBadge}
                        </div>
                        <div class="search-result-type">${item.type}</div>
                    </div>
                    <div class="search-result-snippet">${this.getSnippet(item, this.searchInput.value)}</div>
                    <div class="search-result-meta">
                        ${item.keywords.slice(0, 3).join(' • ')}
                    </div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = resultsHtml;

        // Add click handlers
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const link = item.getAttribute('data-link');
                if (link) {
                    // Track click for analytics
                    this.trackSearchResultClick(link);
                    window.location.href = link;
                }
            });
        });
    }

    displaySearchHistory() {
        const history = this.getSearchHistory();
        if (history.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-title">Start typing to search...</div>
                    <div class="search-result-snippet">Search prayers, readings, and documents</div>
                </div>
            `;
            return;
        }

        const historyHtml = `
            <div class="search-history-header">
                <div class="search-result-title">Recent Searches</div>
                <button class="clear-history-btn" onclick="searchInstance.clearSearchHistory()">Clear</button>
            </div>
            ${history.map(term => `
                <div class="search-result-item history-item" data-query="${term}">
                    <div class="search-result-title">🔍 ${term}</div>
                    <div class="search-result-snippet">Click to search again</div>
                </div>
            `).join('')}
        `;

        this.searchResults.innerHTML = historyHtml;

        // Add click handlers for history items
        this.searchResults.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.getAttribute('data-query');
                this.searchInput.value = query;
                this.handleSearch(query);
            });
        });
    }

    getTypeIcon(type) {
        const icons = {
            liturgical: '⛪',
            devotional: '🙏',
            document: '📄',
            saint: '✝️'
        };
        return icons[type] || '📖';
    }

    getSnippet(item, query) {
        // Create a snippet from content or keywords
        const text = item.content || item.keywords.join(' ');
        const words = text.split(' ');
        const queryWords = query.toLowerCase().split(' ');

        // Find the best matching section
        for (let i = 0; i < words.length - 5; i++) {
            const snippet = words.slice(i, i + 10).join(' ');
            if (queryWords.some(q => snippet.toLowerCase().includes(q))) {
                return this.highlightMatch(snippet + '...', query);
            }
        }

        // Fallback to first part of content
        return this.highlightMatch(text.substring(0, 100) + '...', query);
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }

    // Search History Management
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('prayerSearchHistory');
            this.searchHistory = history ? JSON.parse(history) : [];
        } catch (e) {
            this.searchHistory = [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('prayerSearchHistory', JSON.stringify(this.searchHistory));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    addToSearchHistory(query) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== query);

        // Add to beginning
        this.searchHistory.unshift(query);

        // Keep only last 10
        this.searchHistory = this.searchHistory.slice(0, 10);

        this.saveSearchHistory();
    }

    getSearchHistory() {
        return this.searchHistory.slice(0, 5); // Return last 5
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.displaySearchHistory();
    }

    // Analytics tracking
    trackSearchResultClick(link) {
        // Simple tracking - could be enhanced with analytics service
        try {
            if (window.plausible) {
                window.plausible('search_result_click', {
                    props: { link: link }
                });
            }
        } catch (e) {
            // Ignore tracking errors
        }
    }

    // Filter methods (for future UI implementation)
    setFilter(type, value) {
        this.currentFilters[type] = value;
    }

    getFilters() {
        return { ...this.currentFilters };
    }

    resetFilters() {
        this.currentFilters = {
            type: 'all',
            season: 'all',
            saint: 'all'
        };
    }

    showResults() {
        if (this.searchResults.innerHTML.trim()) {
            this.searchResults.classList.add('active');
        }
    }

    hideResults() {
        this.searchResults.classList.remove('active');
    }

    handleFilterClick(e) {
        const button = e.target;
        const filterType = button.getAttribute('data-filter');
        const filterValue = button.getAttribute('data-value');

        // Update active filter button
        document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update current filters
        this.currentFilters[filterType] = filterValue;

        // Re-run search if there's a query
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
            this.handleSearch(query);
        } else {
            this.displaySearchHistory();
            this.showResults();
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.hideResults();
            this.searchInput.blur();
        } else if (e.key === 'Enter') {
            // Could implement quick action for first result
            const firstResult = this.searchResults.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.click();
            }
        }
    }
}

// Initialize search when DOM is ready
let searchInstance;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        searchInstance = new EnhancedPrayerSearch();
        // Make instance globally available for history clearing
        window.searchInstance = searchInstance;
    });
} else {
    searchInstance = new EnhancedPrayerSearch();
    window.searchInstance = searchInstance;
}

