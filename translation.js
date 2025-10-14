/**
 * Translation functionality for i-pray app
 * Provides English to Swahili translation for the app content
 */

// Dictionary of English to Swahili translations
// Using window object to make it globally accessible for GitHub Pages
window.translations = {
    // App title and navigation
    "ipray": "ninaomba",
    "Your Prayer Companion": "Msaidizi Wako wa Maombi",
    "Install ipray App": "Sakinisha Programu ya ninaomba",
    
    // Navigation and buttons
    "Tap to see upcoming feasts": "Gusa kuona sherehe zinazokuja",
    "Calendar": "Kalenda",
    
    // Common liturgical terms
    "ordinary": "ya kawaida",
    "Feast of All Saints": "Sikukuu ya Watakatifu Wote",
    "Loading...": "Inapakia...",
    
    // Common prayer terms
    "prayer": "maombi",
    "amen": "amina",
    "holy": "takatifu",
    "saint": "mtakatifu",
    "saints": "watakatifu",
    "blessed": "mbarikiwa",
    "Lord": "Bwana",
    "God": "Mungu",
    "Jesus": "Yesu",
    "Christ": "Kristo",
    "Holy Spirit": "Roho Mtakatifu",
    "Mary": "Maria",
    "Joseph": "Yosefu",
    
    // Common UI elements
    "Settings": "Mipangilio",
    "Prayer": "Sala",
    "Sacraments": "Sakramenti",
    "Holy Rosary": "Rosari Takatifu",
    "Way of the Cross": "Njia ya Msalaba",
    "Compline": "Sala ya Usiku",
    "Lauds": "Sala ya Asubuhi",
    "Antiphons": "Antifona",
    "Dark Mode": "Hali ya Giza",
    "Light Mode": "Hali ya Mwanga",
    "Translate to Swahili": "Tafsiri kwa Kiswahili",
    "Translate to English": "Tafsiri kwa Kiingereza",
    
    // Days of the week
    "Monday": "Jumatatu",
    "Tuesday": "Jumanne",
    "Wednesday": "Jumatano",
    "Thursday": "Alhamisi",
    "Friday": "Ijumaa",
    "Saturday": "Jumamosi",
    "Sunday": "Jumapili",
    
    // Months
    "January": "Januari",
    "February": "Februari",
    "March": "Machi",
    "April": "Aprili",
    "May": "Mei",
    "June": "Juni",
    "July": "Julai",
    "August": "Agosti",
    "September": "Septemba",
    "October": "Oktoba",
    "November": "Novemba",
    "December": "Desemba",

    // Prayer.html specific translations
    "daily prayers": "Sala za kila siku",
    "Home": "Nyumbani",
    "Daily Prayers": "Sala za Kila Siku",
    "Evening": "Jioni",
    "Rosary": "Rozari",
    "The Apostles' Creed": "Nasadiki ya Mitume",
    "The Lord's Prayer": "Sala ya Bwana",
    "The Hail Mary": "Sikukuu ya Maria",
    "The Glory Be": "Utukufu Wa Milele",
    "The Hail Holy Queen": "Sikukuu ya Malkia Mtakatifu",
    "Morning Offering": "Sadaka ya Asubuhi",
    "Act of Contrition": "Kitendo cha Kutubu",
    "Prayer to St. Michael": "Sala kwa Mtakatifu Mikaeli",
    "The Hail Mary": "Sikukuu ya Maria",
    "The Glory Be": "Utukufu Wa Milele",
    "The Hail Holy Queen": "Sikukuu ya Malkia Mtakatifu",
    "Morning Offering": "Sadaka ya Asubuhi",
    "Act of Contrition": "Kitendo cha Kutubu",
    "Prayer to St. Michael": "Sala kwa Mtakatifu Mikaeli",
    "Favorite Prayers": "Maombi Nipendayo",
    "Pray without ceasing.": "Omba bila kukoma.",
    "Install iPray App?": "Sakinisha Programu ya iPray?",
    "Access prayers offline": "Fikia maombi nje ya mtandao",
    "Later": "Baadaye",
    "Install": "Sakinisha"
};

// State to track current language - using window object for GitHub Pages compatibility
window.currentLanguage = 'english'; // Default language

// Self-executing function to initialize translation functionality
(function() {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initTranslation);
    } else {
        // DOM already loaded, initialize immediately
        window.initTranslation();
    }
    
    // Add additional initialization for GitHub Pages
    window.addEventListener('hashchange', window.initTranslation);
    window.addEventListener('load', window.initTranslation);
    
    // Try to initialize after a short delay as a fallback
    setTimeout(window.initTranslation, 1000);
})();

/**
 * Toggle between English and Swahili translations
 * This function is exposed globally for GitHub Pages compatibility
 */
window.toggleTranslation = function() {
    try {
        console.log('Toggle translation called');
        const translationToggle = document.getElementById('translationToggle');
        console.log('Current language:', window.currentLanguage);
        
        if (window.currentLanguage === 'english') {
            // Switch to Swahili
            window.translateToSwahili();
            window.currentLanguage = 'swahili';
            if (translationToggle) {
                translationToggle.title = 'Translate to English';
                translationToggle.textContent = 'SW';
                console.log('Changed to Swahili');
            }
        } else {
            // Switch to English
            window.translateToEnglish();
            window.currentLanguage = 'english';
            if (translationToggle) {
                translationToggle.title = 'Translate to Swahili';
                translationToggle.textContent = 'EN';
                console.log('Changed to English');
            }
        }
        
        // Save language preference with a base path-independent key
        // This ensures it works regardless of GitHub Pages deployment path
        try {
            localStorage.setItem('iprayLanguage', window.currentLanguage);
        } catch (storageError) {
            console.error('Error saving language preference:', storageError);
        }
    } catch (error) {
        console.error('Error in toggleTranslation:', error);
    }
}

/**
 * Translate page content to Swahili
 */
window.translateToSwahili = function() {
    try {
        // First, handle elements with data-translate attributes
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (window.translations[key]) {
                if (!element.hasAttribute('data-original-text')) {
                    element.setAttribute('data-original-text', element.textContent);
                }
                element.textContent = window.translations[key];
            }
        });

        // Get all text nodes in the document
        const textNodes = getTextNodes(document.body);

        // Translate each text node
        textNodes.forEach(node => {
            if (!node || !node.nodeValue) return;

            const originalText = node.nodeValue.trim();
            if (originalText && originalText.length > 0) {
                // Skip if parent has data-translate (already handled above)
                if (node.parentNode && node.parentNode.hasAttribute('data-translate')) {
                    return;
                }

                // Store original text if not already stored
                if (!node.hasAttribute) return; // Skip if node doesn't support attributes

                if (!node.hasAttribute('data-original-text')) {
                    node.setAttribute('data-original-text', originalText);
                }

                // Translate text
                node.nodeValue = translateText(originalText);
            }
        });

        // Translate attributes (like placeholders, titles, etc.)
        translateAttributes();

        console.log('Translation to Swahili completed');
    } catch (error) {
        console.error('Error in translateToSwahili:', error);
    }
}

/**
 * Restore original English text
 */
window.translateToEnglish = function() {
    // First, restore elements with data-translate attributes
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        if (element.hasAttribute('data-original-text')) {
            element.textContent = element.getAttribute('data-original-text');
        }
    });

    // Get all text nodes in the document
    const textNodes = getTextNodes(document.body);

    // Restore original text for each node
    textNodes.forEach(node => {
        // Skip if parent has data-translate (already handled above)
        if (node.parentNode && node.parentNode.hasAttribute('data-translate')) {
            return;
        }

        if (node.hasAttribute('data-original-text')) {
            node.nodeValue = node.getAttribute('data-original-text');
        }
    });

    // Restore original attributes
    restoreAttributes();
}

/**
 * Translate a text string to Swahili
 * @param {string} text - The text to translate
 * @return {string} - Translated text
 */
function translateText(text) {
    // Check if exact match exists in dictionary
    if (window.translations[text]) {
        return window.translations[text];
    }
    
    // Try to translate individual words
    let translatedText = text;
    Object.keys(window.translations).forEach(englishWord => {
        // Create a regex that matches the word with word boundaries
        const regex = new RegExp(`\\b${englishWord}\\b`, 'gi');
        translatedText = translatedText.replace(regex, window.translations[englishWord]);
    });
    
    return translatedText;
}

/**
 * Get all text nodes under a specific element
 * @param {Element} element - The parent element
 * @return {Array} - Array of text nodes
 */
function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        // Skip script and style elements
        if (!isInScriptOrStyle(node)) {
            textNodes.push(node);
        }
    }
    
    return textNodes;
}

/**
 * Check if node is inside script or style element
 * @param {Node} node - The node to check
 * @return {boolean} - True if in script or style
 */
function isInScriptOrStyle(node) {
    let parent = node.parentNode;
    while (parent) {
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
            return true;
        }
        parent = parent.parentNode;
    }
    return false;
}

/**
 * Translate attributes like title, placeholder, and aria-label
 */
window.translateAttributes = function() {
    try {
        console.log('Translating attributes');
        // Translate title attributes
        const elementsWithTitle = document.querySelectorAll('[title]');
        elementsWithTitle.forEach(element => {
            if (!element.hasAttribute('data-original-title')) {
                element.setAttribute('data-original-title', element.getAttribute('title'));
            }
            element.setAttribute('title', translateText(element.getAttribute('data-original-title')));
        });
        
        // Translate placeholder attributes
        const elementsWithPlaceholder = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        elementsWithPlaceholder.forEach(element => {
            if (!element.hasAttribute('data-original-placeholder')) {
                element.setAttribute('data-original-placeholder', element.getAttribute('placeholder'));
            }
            element.setAttribute('placeholder', translateText(element.getAttribute('data-original-placeholder')));
        });
        
        // Translate aria-label attributes
        const elementsWithAriaLabel = document.querySelectorAll('[aria-label]');
        elementsWithAriaLabel.forEach(element => {
            if (!element.hasAttribute('data-original-aria-label')) {
                element.setAttribute('data-original-aria-label', element.getAttribute('aria-label'));
            }
            element.setAttribute('aria-label', translateText(element.getAttribute('data-original-aria-label')));
        });
        
        console.log('Attributes translated');
    } catch (error) {
        console.error('Error in translateAttributes:', error);
    }
}

/**
 * Restore original attribute values
 */
window.restoreAttributes = function() {
    // Restore placeholders
    document.querySelectorAll('[data-original-placeholder]').forEach(element => {
        element.setAttribute('placeholder', element.getAttribute('data-original-placeholder'));
    });
    
    // Restore titles
    document.querySelectorAll('[data-original-title]').forEach(element => {
        element.setAttribute('title', element.getAttribute('data-original-title'));
    });
    
    // Restore aria-label attributes
    document.querySelectorAll('[data-original-aria-label]').forEach(element => {
        element.setAttribute('aria-label', element.getAttribute('data-original-aria-label'));
    });
}

/**
 * Initialize translation functionality
 */
window.initTranslation = function() {
    console.log('Initializing translation');
    const translationToggle = document.getElementById('translationToggle');
    
    if (translationToggle) {
        console.log('Translation toggle button found');
        
        // Remove any existing event listeners to prevent duplicates
        const newToggle = translationToggle.cloneNode(true);
        translationToggle.parentNode.replaceChild(newToggle, translationToggle);
        
        // Add event listener to the new button
        newToggle.addEventListener('click', window.toggleTranslation);
        
        // Also add onclick handler as a fallback for GitHub Pages
        newToggle.onclick = window.toggleTranslation;
        
        // Check saved language preference
        const savedLanguage = localStorage.getItem('iprayLanguage');
        console.log('Saved language:', savedLanguage);
        
        if (savedLanguage === 'swahili') {
            window.currentLanguage = 'swahili';
            window.translateToSwahili();
            newToggle.textContent = 'SW';
            newToggle.title = 'Translate to English';
            console.log('Initialized with Swahili');
        } else {
            window.currentLanguage = 'english';
            newToggle.textContent = 'EN';
            newToggle.title = 'Translate to Swahili';
            console.log('Initialized with English');
        }
    } else {
        console.log('Translation toggle button not found, will retry');
        // If button not found, try again after a short delay
        setTimeout(() => {
            const retryToggle = document.getElementById('translationToggle');
            if (retryToggle) {
                console.log('Translation toggle button found on retry');
                retryToggle.addEventListener('click', window.toggleTranslation);
                retryToggle.onclick = window.toggleTranslation;
                
                // Check saved language preference
                const savedLanguage = localStorage.getItem('iprayLanguage');
                if (savedLanguage === 'swahili') {
                    window.currentLanguage = 'swahili';
                    window.translateToSwahili();
                    retryToggle.textContent = 'SW';
                    retryToggle.title = 'Translate to English';
                } else {
                    window.currentLanguage = 'english';
                    retryToggle.textContent = 'EN';
                    retryToggle.title = 'Translate to Swahili';
                }
            } else {
                console.error('Translation toggle button not found after retry');
            }
        }, 1000);
    }
}

// Self-executing function to ensure script runs regardless of where it's loaded from
(function() {
    // Initialize translation when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded fired');
        initTranslation();
    });
    
    // Alternative initialization for cases where DOMContentLoaded might have already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document already loaded, initializing translation');
        setTimeout(initTranslation, 1);
    }
    
    // Add a direct event listener to the button as a fallback
    window.addEventListener('load', function() {
        console.log('Window load event fired');
        const translationToggle = document.getElementById('translationToggle');
        if (translationToggle) {
            console.log('Adding click event listener directly on window load');
            translationToggle.addEventListener('click', toggleTranslation);
        }
    });
    
    // GitHub Pages specific initialization
    // This helps with potential path issues in subdirectory deployments
    window.addEventListener('hashchange', function() {
        setTimeout(initTranslation, 100);
    });
})();