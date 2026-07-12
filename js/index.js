
// Translations
const translations = {
    en: {
        home: "Home",
        lauds: "Lauds",
        midday: "Midday prayer",
        vespers: "Vespers",
        calendar: "Calendar",
        settings: "Settings",
        prayers: "Prayers",
        readings: "Compline",
        rosary: "Holy Rosary",
        requests: "Prayer Requests",
        scripture: "Office of Readings",
        sacraments: "Way of the Cross",
        saint: "Saint of the Day",
        quoteAdvent: "Prepare the way of the Lord!",
        quoteChristmas: "Glory to God in the highest!",
        quoteLent: "Repent and believe in the Gospel!",
        quoteEaster: "Christ is risen! Alleluia!",
        feast: "Tap to see upcoming feasts",
        quoteOrdinary: "May your prayers today bring you closer to God's grace and peace.",
        prayerMain: "<strong>Oh Lord</strong>, that by electing the servant of God Carmen Hernández as co-initiator of the Neocatechumenal Way, granted her a great love for Jesus Christ and the Church, for Holy Scripture and for liturgical prayer, a burning zeal for the itinerant announcement of the Gospel and fidelity to you in the trials of the cross; grant that I, through her intercession, may be faithful to the baptism I have received and, if it is your will, also grant the grace I ask of you. Through Jesus Christ, our Lord. Amen",
        prayerFinal: "<strong>Final:</strong> Our Father. Hail Mary. Glory be. ...",
        tapToViewPrayer: "Tap to view prayer",
        tapToView: "Tap to view",
        dailyReadings: "Daily Readings",
        installApp: "Install ipray App",
        copyright: "iPray App. All rights reserved.",
        options: "Options",
        morningPrayer: "Morning Prayer",
        officeOfReadings: "Office of Readings",
        middayPrayer: "Midday Prayer",
        eveningPrayer: "Evening Prayer",
        nightPrayer: "Night Prayer",
        holyRosary: "Holy Rosary",
        stationsOfCross: "Stations of the Cross",
        otherPrayers: "Other Prayers",
        carmenPrayer: "Prayer to Carmen Hernández",
        psalterWeek: "Psalter Week"
    },
    sw: {
        home: "Nyumbani",
        lauds: "Masifu",
        midday: "masifu ya Mchana",
        vespers: "Masifu ya Jioni",
        calendar: "Kalenda",
        settings: "Mipangilio",
        prayers: "Sala",
        readings: "Sala ya Usiku",
        rosary: "Rozari Takatifu",
        requests: "Maombi",
        scripture: "Ofisi ya Masomo",
        sacraments: "Njia ya Msalaba",
        saint: "Mtakatifu wa Leo",
        quoteAdvent: "Tayarishieni njia ya Bwana!",
        quoteChristmas: "Utukufu kwa Mungu mbinguni!",
        quoteLent: "Tubuni na muamini Injili!",
        quoteEaster: "Kristo amefufuka! Aleluya!",
        feast: "Gusa kuona sikukuu zijazo",
        quoteOrdinary: "Naomba maombi yako leo yakuweke karibu na neema na amani ya Mungu.",
        prayerMain: "<strong>Ee Bwana</strong>, ambaye kwa kumchagua mtumishi wa Mungu Carmen Hernández kama mwanzilishi mwenza wa Njia ya Neokatekumenali, ulimpa upendo mkubwa kwa Yesu Kristo na Kanisa, kwa Maandiko Matakatifu na kwa sala ya liturujia, bidii inayowaka kwa tangazo la Injili la kimisionari na uaminifu kwako katika majaribu ya msalaba; nitimizie mimi, kwa maombezi yake, niwe mwaminifu kwa ubatizo niliopokea na, kama ni mapenzi yako, nitimizie pia neema ninayokuomba. Kwa njia ya Yesu Kristo, Bwana wetu. Amina",
        prayerFinal: "<strong>Mwisho:</strong> Baba yetu. Salamu Maria. Atukuzwe Baba...",
        tapToViewPrayer: "Gusa kuona sala",
        tapToView: "Gusa kuona",
        dailyReadings: "Masomo ya Kila Siku",
        installApp: "Sakinisha App ya ipray",
        copyright: "App ya iPray. Haki zote zimehifadhiwa.",
        options: "Chaguo",
        morningPrayer: "Masifu ya Asubuhi",
        officeOfReadings: "Ofisi ya Masomo",
        middayPrayer: "Sala ya Mchana",
        eveningPrayer: "Masifu ya Jioni",
        nightPrayer: "Sala ya Usiku",
        holyRosary: "Rozari Takatifu",
        stationsOfCross: "Njia ya Msalaba",
        otherPrayers: "Sala Nyingine",
        carmenPrayer: "Sala kwa Carmen Hernández",
        psalterWeek: "Juma la Zaburi"
    }
};


function getLiturgicalInfoForToday(date = new Date()) {
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    let feast = null, feastType = null, color = 'green';
    const feastData = (LITURGICAL_FEASTS[month] || []).find(f => f.date === day);
    if (feastData) { feast = feastData.name; feastType = feastData.type; color = feastData.color; }
    const easter = calculateEasterForFeasts(year);
    const ashWednesday = new Date(easter); ashWednesday.setDate(easter.getDate() - 46);
    const pentecost = new Date(easter); pentecost.setDate(easter.getDate() + 49);
    const christmas = new Date(year, 11, 25);
    let season = 'Ordinary Time';
    if (date >= new Date(year, 11, 1) && date < christmas) { season = 'Advent'; color = 'purple'; }
    else if (date >= christmas && date < new Date(year + 1, 0, 8)) { season = 'Christmas'; color = 'white'; }
    else if (date >= ashWednesday && date < easter) { season = 'Lent'; color = 'purple'; }
    else if (date >= easter && date < pentecost) { season = 'Easter'; color = 'white'; }
    return { season, color, feast, feastType };
}

function getUpcomingFeasts(nextCount = 5) {
    const today = new Date();
    const year = today.getFullYear();
    let allFeasts = [];
    for (let m = 0; m < 12; m++) {
        (LITURGICAL_FEASTS[m] || []).forEach(f => {
            const d = new Date(year, m, f.date);
            if (d >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                allFeasts.push({ ...f, date: d });
            }
        });
    }
    return allFeasts
        .sort((a,b) => a.date - b.date)
        .slice(0, nextCount)
        .map(f => ({
            date: f.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            name: f.name,
            type: f.type,
            color: f.color
        }));
}

// Language Management
function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    const toggleBtn = document.getElementById('translationToggle');
    if (toggleBtn) {
        toggleBtn.textContent = lang === 'en' ? 'SW' : 'EN';
        toggleBtn.title = lang === 'en' ? 'Translate to Swahili' : 'Translate to English';
    }
    const subtitle = document.getElementById('appSubtitle');
    if (subtitle) subtitle.textContent = lang === 'sw' ? "Msaidizi wako Wa Sala" : "Your Prayer Companion";

    // Re-render the liturgical card and prayer menus in the selected language
    calculateLiturgicalDay(lang);
    renderPrayerMenus();

    const saintEl = document.getElementById('saintOfDay');
    if (saintEl && !saintEl.classList.contains('hidden')) {
        const info = getLiturgicalInfoForToday();
        if (info.feast) {
            saintEl.textContent = lang === 'sw'
                ? `Mtakatifu wa Leo: ${translateFeastName(info.feast)}`
                : `Saint of the Day: ${info.feast}`;
        }
    }

    // Update prayer text
    const prayerMain = document.getElementById('prayerMain');
    const prayerFinal = document.getElementById('prayerFinal');
    if (prayerMain) {
        prayerMain.innerHTML = translations[lang].prayerMain;
    }
    if (prayerFinal) {
        prayerFinal.innerHTML = translations[lang].prayerFinal;
    }
}

function translateFeastName(name) {
    const feastMap = {
        "All Saints": "Watakatifu Wote",
        "Mary, Mother of God": "Maria, Mama wa Mungu",
        "Epiphany": "Epifania",
        "Conversion of Paul, Apostle": "Kuongoka kwa Paulo, Mtume",
        "Annunciation of the Lord": "Kupashwa habari kwa Bwana",
        "Nativity of the Lord": "Kuzaliwa kwa Bwana",
        "Assumption of the Blessed Virgin Mary": "Kupalizwa kwa Bikira ",
        "Presentation of the Lord": "Kutolewa kwa Bwana Hekaluni",
        "Birth of John the Baptist": "Kuzaliwa kwa Yohana Mbatizaji",
        "Sts. Michael, Gabriel, and Raphael": "Mikaele, Gabarieli, na Rafaele",
        "All Souls": "Marehemu Wote",
        "Basil the Great and Gregory Nazianzen": "Basil Mkuu na Gregory wa Nazianzus",
        "Most Holy Name of Jesus": "Jina Takatifu Zaidi la Yesu",
        "Elizabeth Ann Seton": "Elizabeth Ann Seton",
        "John Neumann": "John Neumann",
        "Raymond of Penyafort": "Raymond wa Penyafort",
        "Hilary of Poitiers": "Hilary wa Poitiers",
        "Anthony of Egypt": "Anthony wa Misri",
        "Vincent, deacon and martyr": "Vincent, shemasi na shahidi",
        "Agnes, virgin and martyr": "Agnes, bikira na shahidi",
        "Marianne Cope": "Marianne Cope",
        "Francis de Sales": "Francis de Sales",
        "Timothy and Titus": "Timotheo na Tito",
        "Angela Merici": "Angela Merici",
        "Thomas Aquinas": "Thomas Aquinas",
        "John Bosco": "John Bosco",
        "Blase, bishop and martyr": "Blase, askofu na shahidi",
        "Agatha, virgin and martyr": "Agatha, bikira na shahidi",
        "Paul Miki and companions": "Paul Miki na wenzake",
        "Josephine Bakhita": "Josephine Bakhita",
        "Scholastica": "Scholastica",
        "Our Lady of Lourdes": "Mama Yetu wa Lourdes",
        "Cyril and Methodius": "Cyril na Methodius",
        "Peter Damian": "Peter Damian",
        "Chair of Peter": "Kiti cha Peter",
        "Polycarp": "Polycarp",
        "Katharine Drexel": "Katharine Drexel",
        "Casimir": "Casimir",
        "Perpetua and Felicity": "Perpetua na Felicity",
        "John of God": "John wa Mungu",
        "Frances of Rome": "Frances wa Roma",
        "Patrick": "Patrick",
        "Cyril of Jerusalem": "Cyril wa Yerusalemu",
        "Joseph, Husband of Mary": "Joseph, Mume wa Maria",
        "Turibius of Mogrovejo": "Turibius wa Mogrovejo",
        "Francis of Paola": "Francis wa Paola",
        "Isidore": "Isidore",
        "Vincent Ferrer": "Vincent Ferrer",
        "John Baptist de la Salle": "John Baptist de la Salle",
        "Stanislaus": "Stanislaus",
        "Martin I": "Martin I",
        "Anselm of Canterbury": "Anselm wa Canterbury",
        "George or Adalbert": "George au Adalbert",
        "Fidelis of Sigmaringen": "Fidelis wa Sigmaringen",
        "Mark the Evangelist": "Marko Mwinjilisti",
        "Peter Chanel or Louis de Montfort": "Peter Chanel au Louis de Montfort",
        "Catherine of Siena": "Catherine wa Siena",
        "Pius V": "Pius V",
        "Joseph the Worker": "Joseph Mfanyakazi",
        "Athanasius": "Athanasius",
        "Philip and James, Apostles": "Philip na James, Mitume",
        "Damien de Veuster": "Damien de Veuster",
        "Our Lady of Fatima": "Mama Yetu wa Fatima",
        "Matthias the Apostle": "Matthias Mtume",
        "Isidore the Farmer": "Isidore Mkulima",
        "John I": "John I",
        "Bernardine of Siena": "Bernardine wa Siena",
        "Christopher Magallanes and companions": "Christopher Magallanes na wenzake",
        "Rita of Cascia": "Rita wa Cascia",
        "Bede or Gregory VII or Mary Magdalene de Pazzi": "Bede au Gregory VII au Mary Magdalene de Pazzi",
        "Philip Neri": "Philip Neri",
        "Augustine of Canterbury": "Augustine wa Canterbury",
        "Visitation of the Blessed Virgin Mary": "Ziara ya Bikira Maria",
        "Justin Martyr": "Justin Shahidi",
        "Charles Lwanga and companions": "Charles Lwanga na wenzake",
        "Boniface": "Boniface",
        "Ephrem": "Ephrem",
        "Barnabas the Apostle": "Barnabas Mtume",
        "Anthony of Padua": "Anthony wa Padua",
        "Romuald": "Romuald",
        "Aloysius Gonzaga": "Aloysius Gonzaga",
        "Paulinus or John Fisher and Thomas More": "Paulinus au John Fisher na Thomas More",
        "Irenaeus": "Irenaeus",
        "Peter and Paul, Apostles": "Peter na Paul, Mitume",
        "First Martyrs of the Church of Rome": "Washahidi wa Kwanza wa Kanisa la Roma",
        "Junípero Serra": "Junípero Serra",
        "Thomas the Apostle": "Thomas Mtume",
        "Anthony Zaccaria or Elizabeth of Portugal": "Anthony Zaccaria au Elizabeth wa Ureno",
        "Maria Goretti": "Maria Goretti",
        "Augustine Zhao Rong and companions": "Augustine Zhao Rong na wenzake",
        "Benedict": "Benedict",
        "Henry": "Henry",
        "Camillus de Lellis or Kateri Tekakwitha": "Camillus de Lellis au Kateri Tekakwitha",
        "Bonaventure": "Bonaventure",
        "Our Lady of Mount Carmel": "Mama Yetu wa Mlima Karmeli",
        "Apollinaris": "Apollinaris",
        "Lawrence of Brindisi": "Lawrence wa Brindisi",
        "Mary Magdalene": "Mary Magdalene",
        "James, Apostle": "James, Mtume",
        "Joachim and Anne": "Joakim na Anna",
        "Martha": "Martha",
        "Peter Chrysologus": "Peter Chrysologus",
        "Ignatius of Loyola": "Ignatius wa Loyola",
        "Alphonsus Maria de Liguori": "Alphonsus Maria de Liguori",
        "Jean Vianney": "Jean Vianney",
        "Dedication of Mary Major": "Kujitolea kwa Mary Mkuu",
        "Transfiguration of the Lord": "Ubadilishaji wa Bwana",
        "Sixtus II or Cajetan": "Sixtus II au Cajetan",
        "Dominic": "Dominic",
        "Teresa Benedicta of the Cross": "Teresa Benedicta wa Msalaba",
        "Lawrence, deacon and martyr": "Lawrence, shemasi na shahidi",
        "Clare": "Clare",
        "Jane Frances de Chantal": "Jane Frances de Chantal",
        "Pontian and Hippolytus": "Pontian na Hippolytus",
        "Maximilian Kolbe": "Maximilian Kolbe",
        "Stephen of Hungary": "Stephen wa Hungaria",
        "John Eudes": "John Eudes",
        "Bernard of Clairvaux": "Bernard wa Clairvaux",
        "Pius X": "Pius X",
        "Queenship of Blessed Virgin Mary": "Ufalme wa Bikira Maria",
        "Rose of Lima": "Rose wa Lima",
        "Bartholomew the Apostle": "Bartholomew Mtume",
        "Louis or Joseph of Calasanz": "Louis au Joseph wa Calasanz",
        "Monica": "Monica",
        "Augustine of Hippo": "Augustine wa Hippo",
        "Beheading of John the Baptist": "Kukata Kichwa cha Yohana Mbatizaji",
        "Gregory the Great": "Gregory Mkuu",
        "Birth of the Blessed Virgin Mary": "Kuzaliwa kwa Bikira Maria",
        "Peter Claver": "Peter Claver",
        "Holy Name of the Blessed Virgin Mary": "Jina Takatifu la Bikira Maria",
        "John Chrysostom": "John Chrysostom",
        "Exaltation of the Holy Cross": "Kuinuliwa kwa Msalaba Mtakatifu",
        "Our Lady of Sorrows": "Mama Yetu wa Huzuni",
        "Cornelius and Cyprian": "Cornelius na Cyprian",
        "Robert Bellarmine": "Robert Bellarmine",
        "Januarius": "Januarius",
        "Andrew Kim and companions": "Andrew Kim na wenzake",
        "Matthew the Evangelist": "Matthew Mwinjilisti",
        "Padre Pio": "Padre Pio",
        "Cosmas and Damian": "Cosmas na Damian",
        "Vincent de Paul": "Vincent de Paul",
        "Wenceslaus or Lawrence Ruiz and companions": "Wenceslaus au Lawrence Ruiz na wenzake",
        "Jerome": "Jerome",
        "Thérèse of the Child Jesus": "Thérèse wa Mtoto Yesu",
        "Guardian Angels": "Malaika Walinzi",
        "Francis of Assisi": "Francis wa Assisi",
        "Francis Xavier Seelos": "Francis Xavier Seelos",
        "Bruno or Marie-Rose Durocher": "Bruno au Marie-Rose Durocher",
        "Denis or John Leonardi": "Denis au John Leonardi",
        "John XXIII": "John XXIII",
        "Callistus I": "Callistus I",
        "Teresa of Jesus": "Teresa wa Yesu",
        "Hedwig or Margaret Mary Alacoque": "Hedwig au Margaret Mary Alacoque",
        "Ignatius of Antioch": "Ignatius wa Antiokia",
        "Luke the Evangelist": "Luke Mwinjilisti",
        "Jean de Brébeuf and companions": "Jean de Brébeuf na wenzake",
        "Paul of the Cross": "Paul wa Msalaba",
        "John Paul II": "John Paul II",
        "John of Capistrano": "John wa Capistrano",
        "Anthony Mary Claret": "Anthony Mary Claret",
        "Simon and Jude": "Simon na Jude",
        "Martin de Porres": "Martin de Porres",
        "Charles Borromeo": "Charles Borromeo",
        "Dedication of the Lateran Basilica": "Kujitolea kwa Basilica ya Lateran",
        "Leo the Great": "Leo Mkuu",
        "Martin of Tours": "Martin wa Tours",
        "Josaphat": "Josaphat",
        "Frances Xavier Cabrini": "Frances Xavier Cabrini",
        "Albert the Great": "Albert Mkuu",
        "Margaret of Scotland or Gertrude": "Margaret wa Scotland au Gertrude",
        "Elizabeth of Hungary": "Elizabeth wa Hungaria",
        "Rose Philippine Duchesne": "Rose Philippine Duchesne",
        "Presentation of the Blessed Virgin Mary": "Utoaji wa Bikira Maria",
        "Cecilia": "Cecilia",
        "Clement I or Columban or Miguel Pro": "Clement I au Columban au Miguel Pro",
        "Andrew Dung-Lac and companions": "Andrew Dung-Lac na wenzake",
        "Catherine of Alexandria": "Catherine wa Alexandria",
        "Andrew the Apostle": "Andrew Mtume",
        "Francis Xavier": "Francis Xavier",
        "John Damascene": "John Damascene",
        "Nicholas": "Nicholas",
        "Ambrose": "Ambrose",
        "Immaculate Conception": "Ujauzito Usio na Dhambi",
        "Juan Diego": "Juan Diego",
        "Damasus I": "Damasus I",
        "Our Lady of Guadalupe": "Mama Yetu wa Guadalupe",
        "Lucy": "Lucy",
        "John of the Cross": "John wa Msalaba",
        "Peter Canisius": "Peter Canisius",
        "John of Kanty": "John wa Kanty",
        "Stephen, First Martyr": "Stephen, Shahidi wa Kwanza",
        "John the Apostle": "John Mtume",
        "Holy Innocents": "Watoto Watakatifu",
        "Thomas Becket": "Thomas Becket",
        "Sylvester I": "Sylvester I"
    };
    return feastMap[name] || name;
}

// Accessibility Features
function setTextSize(size) {
    document.body.classList.remove('text-small', 'text-large', 'text-xlarge');
    if (size !== 'normal') {
        document.body.classList.add(`text-${size}`);
    }
    localStorage.setItem('textSize', size);
}

function initAccessibility() {
    document.getElementById('accessibilityToggle').addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = document.getElementById('accessibilityMenu');
        const isHidden = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        this.setAttribute('aria-expanded', !isHidden);
    });
    document.addEventListener('click', function() {
        document.getElementById('accessibilityMenu').classList.add('hidden');
    });
    document.getElementById('highContrastToggle').addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    });
    document.getElementById('textSizeSmall').addEventListener('click', function() {
        setTextSize('small');
    });
    document.getElementById('textSizeNormal').addEventListener('click', function() {
        setTextSize('normal');
    });
    document.getElementById('textSizeLarge').addEventListener('click', function() {
        setTextSize('large');
    });
    document.getElementById('textSizeExtraLarge').addEventListener('click', function() {
        setTextSize('xlarge');
    });
    document.getElementById('reminderToggle').addEventListener('click', function() {
        togglePrayerReminders();
        this.textContent = localStorage.getItem('prayerReminders') === 'false' ? 'Enable Prayer Reminders' : 'Disable Prayer Reminders';
    });
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    const textSize = localStorage.getItem('textSize') || 'normal';
    setTextSize(textSize);
}


// ---------------------------------------------------------------------------
// Prayer menu: single source for the Prayers bottom sheet and the Options
// panel dropdown. Items with `type` get their link computed for today.
// ---------------------------------------------------------------------------
const PRAYER_MENU = [
    { id: 'lauds', key: 'morningPrayer', icon: 'fa-sun', iconColor: 'text-yellow-500', type: 'hours', suffix: '' },
    { id: 'scripture', key: 'officeOfReadings', icon: 'fa-book-open', iconColor: 'text-orange-500', link: 'pages/prayer-hour.html?hour=readings' },
    { id: 'midday', key: 'middayPrayer', icon: 'fa-cloud-sun', iconColor: 'text-amber-500', link: 'pages/prayer-hour.html?hour=sext' },
    { id: 'vespers', key: 'eveningPrayer', icon: 'fa-moon', iconColor: 'text-indigo-500', link: 'pages/prayer-hour.html?hour=vespers' },
    { id: 'readings', key: 'nightPrayer', icon: 'fa-star', iconColor: 'text-blue-500', link: 'pages/compline.html' },
    { id: 'rosary', key: 'holyRosary', icon: 'fa-hands-praying', iconColor: 'text-red-500', link: 'pages/holy-rosary.html' },
    { id: 'sacraments', key: 'stationsOfCross', icon: 'fa-cross', iconColor: 'text-pink-500', link: 'pages/via-cruce.html' },
    { id: 'morning', key: 'otherPrayers', icon: 'fa-book', iconColor: 'text-green-600', link: 'pages/prayer.html' },
    { id: 'carmen-page', key: 'carmenPrayer', icon: 'fa-heart', iconColor: 'text-purple-500', link: 'pages/carmen.html' }
];

function resolvePrayerLink(item) {
    if (item.type === 'hours') {
        const { dayPrefix, week } = getCurrentWeekAndDay();
        return `pages/${getPrayerFileName(dayPrefix, week, item.suffix)}`;
    }
    return item.link;
}

function renderPrayerMenus() {
    const lang = localStorage.getItem('preferredLanguage') || 'en';

    const sheetList = document.getElementById('prayersSheetList');
    if (sheetList) {
        sheetList.innerHTML = '';
        PRAYER_MENU.forEach(item => {
            const label = translations[lang][item.key] || translations.en[item.key];
            const link = resolvePrayerLink(item);
            const a = document.createElement('a');
            a.href = link;
            a.className = 'prayer-menu-item';
            a.innerHTML = `
                <span class="prayer-menu-icon"><i class="fas ${item.icon} ${item.iconColor}" aria-hidden="true"></i></span>
                <span class="prayer-menu-label" data-translate="${item.key}">${label}</span>
                <svg class="w-4 h-4 prayer-menu-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            `;
            a.addEventListener('click', () => {
                savePrayerAccess(item.id, translations.en[item.key], link);
            });
            sheetList.appendChild(a);
        });
    }

    // Options panel: each prayer as a circular icon (no rows/labels-as-list), wrapping horizontally and vertically
    const optionsList = document.getElementById('optionsPrayerList');
    if (optionsList) {
        optionsList.innerHTML = '';
        PRAYER_MENU.forEach(item => {
            const label = translations[lang][item.key] || translations.en[item.key];
            const link = resolvePrayerLink(item);
            const a = document.createElement('a');
            a.href = link;
            a.className = 'options-quicklink';
            a.title = label;
            a.setAttribute('aria-label', label);
            a.innerHTML = `
                <span class="options-quicklink-icon"><i class="fas ${item.icon} ${item.iconColor}" aria-hidden="true"></i></span>
                <span class="options-quicklink-label" data-translate="${item.key}">${label}</span>
            `;
            a.addEventListener('click', () => {
                savePrayerAccess(item.id, translations.en[item.key], link);
            });
            optionsList.appendChild(a);
        });
    }
}

// Favorites Management
const FavoritesManager = {
    getFavorites() {
        return JSON.parse(localStorage.getItem('favorites') || '[]');
    },
    
    addFavorite(itemId, title, link) {
        const favorites = this.getFavorites();
        if (!favorites.find(f => f.id === itemId)) {
            favorites.push({ id: itemId, title, link, date: new Date().toISOString() });
            localStorage.setItem('favorites', JSON.stringify(favorites));
            this.updateFavoriteUI(itemId, true);
            this.showToast('Added to favorites');
            if (typeof loadFavorites === 'function') {
                loadFavorites();
            }
        }
    },
    
    removeFavorite(itemId) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(f => f.id !== itemId);
        localStorage.setItem('favorites', JSON.stringify(filtered));
        this.updateFavoriteUI(itemId, false);
        this.showToast('Removed from favorites');
        if (typeof loadFavorites === 'function') {
            loadFavorites();
        }
    },
    
    isFavorite(itemId) {
        return this.getFavorites().some(f => f.id === itemId);
    },
    
    updateFavoriteUI(itemId, isFavorite) {
        const btn = document.querySelector(`[data-favorite-id="${itemId}"]`);
        if (btn) {
            if (isFavorite) {
                btn.classList.add('active');
                btn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>';
            }
        }
    },
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg toast-notification z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// Show skeleton loaders
function showSkeletonLoaders() {
    const skeletonGrid = document.getElementById('navGridSkeleton');
    if (!skeletonGrid) return;
    
    skeletonGrid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card p-6 rounded-2xl';
        skeleton.innerHTML = `
            <div class="skeleton-image mb-4"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
        `;
        skeletonGrid.appendChild(skeleton);
    }
    skeletonGrid.style.display = 'grid';
}

// Hide skeleton loaders
function hideSkeletonLoaders() {
    const skeletonGrid = document.getElementById('navGridSkeleton');
    if (skeletonGrid) {
        skeletonGrid.style.display = 'none';
    }
}

// Loading overlay control
function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Load and display favorites
function loadFavorites() {
    const favorites = FavoritesManager.getFavorites();
    const favoritesSection = document.getElementById('favoritesSection');
    const favoritesList = document.getElementById('favoritesList');
    
    if (!favoritesSection || !favoritesList) return;
    
    if (favorites.length === 0) {
        favoritesSection.classList.add('hidden');
        return;
    }
    
    favoritesSection.classList.remove('hidden');
    favoritesList.innerHTML = favorites.map(fav => `
        <a href="${fav.link}" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex-1">
                <h3 class="font-semibold text-gray-800">${fav.title}</h3>
                <p class="text-sm text-gray-500">${new Date(fav.date).toLocaleDateString()}</p>
            </div>
            <button class="favorite-btn active ml-2" 
                    onclick="event.preventDefault(); event.stopPropagation(); FavoritesManager.removeFavorite('${fav.id}'); loadFavorites();"
                    aria-label="Remove from favorites">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
            </button>
        </a>
    `).join('');
    
    // Clear all favorites button
    const clearBtn = document.getElementById('clearFavorites');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Clear all favorites?')) {
                localStorage.removeItem('favorites');
                loadFavorites();
                FavoritesManager.showToast('All favorites cleared');
            }
        };
    }
}

// Helper function to get the correct file name based on day and week
function getPrayerFileName(dayPrefix, week, suffix = '') {
    const suffixPart = suffix ? `-${suffix}` : '';
    return `${dayPrefix}${week}${suffixPart}.html`;
}

// Helper function to calculate current week and day
// Weeks cycle: 1, 2, 3, 4 (repeating)
// Weeks start on Sunday and end on Saturday
// If today is Saturday of week 4, tomorrow (Sunday) will be week 1
function getCurrentWeekAndDay() {
    const now = new Date();
    const dayToPrefix = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
    const dayPrefix = dayToPrefix[now.getDay()];

    // Psalter week follows the liturgical week number (week 1 → 1, week 5 → 1, ...)
    const info = getLiturgicalToday(now);
    if (info.psalterWeek) {
        return { dayPrefix, week: info.psalterWeek };
    }

    // Fallback (Christmas season / days after Ash Wednesday): rolling 4-week
    // cycle from a known Week-1 Sunday (October 19, 2025)
    const currentSunday = litSundayOf(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const referenceWeek1Sunday = new Date(2025, 9, 19);
    const weeksSinceRef = Math.floor((currentSunday - referenceWeek1Sunday) / MS_PER_WEEK);
    const week = ((weeksSinceRef % 4) + 4) % 4 + 1;
    return { dayPrefix, week };
}

// Masifu ya Asubuhi dynamic link
const masifuAsubuhiLink = document.getElementById('masifuAsubuhiLink');
if (masifuAsubuhiLink) {
    masifuAsubuhiLink.addEventListener('click', function() {
        const { dayPrefix, week } = getCurrentWeekAndDay();
        const fileName = getPrayerFileName(dayPrefix, week);
        savePrayerAccess('lauds', 'Lauds', fileName);
        window.location.href = `pages/${fileName}`;
    });
}

// Sala ya Mchana (Saa Sita) dynamic link
const saaSitaLink = document.getElementById('saaSitaLink');
if (saaSitaLink) {
    saaSitaLink.addEventListener('click', function() {
        const { dayPrefix, week } = getCurrentWeekAndDay();
        const fileName = getPrayerFileName(dayPrefix, week, 'saa-sita');
        savePrayerAccess('midday', 'Sala ya Mchana', fileName);
        window.location.href = `pages/${fileName}`;
    });
}

// Masifu ya Jioni (Vespers) dynamic link
const masifuJioniLink = document.getElementById('masifuJioniLink');
if (masifuJioniLink) {
    masifuJioniLink.addEventListener('click', function() {
        const { dayPrefix, week } = getCurrentWeekAndDay();
        const fileName = getPrayerFileName(dayPrefix, week, 'jioni');
        savePrayerAccess('vespers', 'Masifu ya Jioni', fileName);
        window.location.href = `pages/${fileName}`;
    });
}

// Update liturgical quote (element may be absent in the redesigned home)
function updateLiturgicalQuote(season, lang) {
    const quoteElement = document.getElementById('liturgicalQuote');
    if (!quoteElement) return;
    let quoteKey = 'quoteOrdinary';
    if (season === 'Advent') quoteKey = 'quoteAdvent';
    else if (season === 'Christmas') quoteKey = 'quoteChristmas';
    else if (season === 'Lent') quoteKey = 'quoteLent';
    else if (season === 'Easter') quoteKey = 'quoteEaster';
    quoteElement.textContent = translations[lang || 'en'][quoteKey];
}

// Liturgical Calendar Logic: fills the liturgical date card dynamically
function calculateLiturgicalDay(lang = 'en') {
    const today = new Date();
    const info = getLiturgicalToday(today, lang);
    const feastInfo = getLiturgicalInfoForToday(today);

    // Solemnities and feasts take their own liturgical colour
    let color = info.color;
    if (feastInfo.feast && (feastInfo.feastType === 'Solemnity' || feastInfo.feastType === 'Feast')) {
        color = feastInfo.color;
    }

    const seasonNamesSw = {
        'Ordinary Time': 'Kipindi cha Mwaka',
        'Advent': 'Majilio',
        'Christmas': 'Noeli',
        'Lent': 'Kwaresima',
        'Easter': 'Pasaka'
    };
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('season', lang === 'sw' ? (seasonNamesSw[info.season] || info.season) : info.season);
    setText('liturgicalYear', today.getFullYear());
    setText('liturgicalDay', info.weekdayName);
    setText('liturgicalWeek', info.dayLabel);
    setText('currentDate', today.toLocaleDateString(
        lang === 'sw' ? 'sw' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
    ));

    const psalterEl = document.getElementById('psalterWeek');
    if (psalterEl) {
        if (info.psalterWeek) {
            const roman = ['I', 'II', 'III', 'IV'][info.psalterWeek - 1];
            psalterEl.textContent = `${translations[lang].psalterWeek} ${roman}`;
            psalterEl.classList.remove('hidden');
        } else {
            psalterEl.classList.add('hidden');
        }
    }

    const card = document.getElementById('liturgicalCard');
    if (card) card.dataset.color = color;

    const feastElement = document.getElementById('feastDay');
    if (feastElement) {
        if (feastInfo.feast) {
            feastElement.textContent = lang === 'sw' ? translateFeastName(feastInfo.feast) : feastInfo.feast;
            feastElement.classList.remove('hidden');
        } else {
            feastElement.classList.add('hidden');
        }
    }
    updateLiturgicalQuote(info.season, lang);
}

// Fetch Saint of the Day
async function fetchSaintOfTheDay() {
    try {
        const saints = [
            {
                name: "Carmen Hernandez",
                prayer: "",
                image: "assets/images/carmen.jpg",
                bio: ""
            },
        ];
        const today = new Date();
        const saint = saints[today.getDate() % saints.length];
        document.getElementById('saintCard').classList.remove('hidden');
        document.getElementById('saintName').textContent = saint.name;
        document.getElementById('saintFeast').textContent = `Feast Day: ${saint.feast || today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        document.getElementById('saintImage').src = saint.image;
        document.getElementById('saintImage').alt = saint.name;
    } catch (error) {
        console.error('Failed to fetch saint:', error);
    }
}

// Fetch Daily Readings
async function fetchDailyReadings() {
    try {
        const today = new Date();
        const day = today.getDate();
        const monthIndex = today.getMonth();
        
        // Only July to December
        if (monthIndex < 6) {
            console.warn("Readings only available from July onward.");
            return;
        }
        
        const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const shortMonth = shortMonths[monthIndex];
        const longMonth = longMonths[monthIndex];
        
        // Format filename to match actual files (with space)
        const fileName = `${day} ${shortMonth}.html`;
        
        // Check if running locally or on GitHub Pages
        const baseUrl = window.location.hostname === "collo670.github.io" ? "/i-pray" : "";
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        const readingsCard = document.createElement('div');
        readingsCard.className = 'rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg card-hover cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center h-32';
        readingsCard.innerHTML = `
            <h3 class="text-xl font-bold text-purple-600 dark:text-purple-300">${translations[lang].dailyReadings}</h3>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">${translations[lang].tapToView}</p>
        `;
        // Click: Fetch and display daily readings
        readingsCard.addEventListener('click', async () => {
            try {
                const today = new Date();
                const day = today.getDate();
                const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                const monthIndex = today.getMonth();
                const shortMonth = shortMonths[monthIndex];
                const longMonth = longMonths[monthIndex];
                const fileName = `${day} ${shortMonth}.html`;

                // Check if running locally or on GitHub Pages
                const baseUrl = window.location.hostname === "collo670.github.io" ? "/i-pray" : "";
                // Navigate to the daily reading file in the current month's folder
                const readingPath = `${baseUrl}/assets/months/${longMonth}/${fileName}`;
                console.log('Daily Readings - Today:', today.toISOString(), 'MonthIndex:', monthIndex, 'LongMonth:', longMonth, 'FileName:', fileName, 'ReadingPath:', readingPath); // Enhanced debugging
                window.location.href = readingPath;
            } catch (error) {
                console.error('Error fetching daily readings:', error);
                alert('Unable to load daily readings. Please try again later.');
            }
        });
        // Insert into the dedicated slot in homeView
        const dailyReadingsSlot = document.getElementById('dailyReadingsSlot');
        if (dailyReadingsSlot) {
            dailyReadingsSlot.innerHTML = '';
            dailyReadingsSlot.appendChild(readingsCard);
        }
    } catch (error) {
        console.error('Failed to fetch readings:', error);
    }
}

// Prayer Reminders
let reminderTimeouts = [];
function setupPrayerReminders() {
    if (!('Notification' in window)) return;
    const remindersEnabled = localStorage.getItem('prayerReminders') !== 'false';
    if (!remindersEnabled) return;
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            scheduleDailyReminder(6, 0, 'Morning Prayer: Start your day with God');
            scheduleDailyReminder(12, 0, 'Angelus: Let us pray the Angelus together');
            scheduleDailyReminder(15, 0, 'Divine Mercy Hour: Remember God\'s mercy at 3 PM');
        }
    });
}

function scheduleDailyReminder(hour, minute, message) {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);
    if (now > reminderTime) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    const timeout = reminderTime - now;
    const timeoutId = setTimeout(() => {
        const notification = new Notification('iPray Reminder', {
            body: message,
            icon: 'assets/images/favicon.ico.jpg',
            actions: [{ action: 'snooze', title: 'Snooze 10 min' }]
        });
        notification.onclick = () => window.focus();
        notification.onclose = () => scheduleDailyReminder(hour, minute, message);
        notification.addEventListener('click', (event) => {
            if (event.action === 'snooze') {
                setTimeout(() => scheduleDailyReminder(hour, minute, message), 10 * 60 * 1000);
            }
        });
    }, timeout);
    reminderTimeouts.push(timeoutId);
}

function togglePrayerReminders() {
    const enabled = localStorage.getItem('prayerReminders') !== 'false';
    localStorage.setItem('prayerReminders', !enabled);
    if (enabled) {
        // Disable
        reminderTimeouts.forEach(clearTimeout);
        reminderTimeouts = [];
    } else {
        // Enable
        setupPrayerReminders();
    }
}

// PWA Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/i-pray/js/service-worker.js', { 
                scope: '/i-pray/',
                updateViaCache: 'none' // Always check the network for updates
            })
            .then(registration => {
                console.log('SW registered:', registration.scope);
                
                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                    console.log('Checking for SW updates');
                }, 60 * 60 * 1000);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is installed but waiting to activate
                            if (confirm('New version available! Reload to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(err => console.log('SW registration failed:', err));
        });
        
        // Detect controller change (service worker update)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed');
        });
    }
}

// Install Prompt Handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    const installButton = document.getElementById('installButton');
    const installContainer = document.getElementById('installContainer');
    installButton.classList.remove('hidden');
    installContainer.classList.remove('hidden');
    // Listen for button click
    installButton.addEventListener('click', () => {
        // Hide the button once clicked
        installButton.classList.add('hidden');
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
});
// Detect iOS and show manual install instructions
function showInstallPrompt() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Don't show if already installed
    if (isStandalone) return;
    if (isIOS) {
        // Show install instruction modal/banner
        const installContainer = document.getElementById('installContainer');
        const installButton = document.getElementById('installButton');
        installContainer.classList.remove('hidden');
        installButton.classList.remove('hidden');
        installButton.textContent = "Tap Share → 'Add to Home Screen'";
        installButton.onclick = () => {
            // Optional: show a modal with image instructions
            alert("To install: Tap the SHARE button below, then select 'Add to Home Screen'");
        };
    }
}
// Call after DOM loads
document.addEventListener('DOMContentLoaded', showInstallPrompt);
// Optionally: Hide install button if already installed
window.addEventListener('appinstalled', () => {
    const installContainer = document.getElementById('installContainer');
    installContainer.classList.add('hidden');
    console.log('App installed successfully');
});

// Toggle translation function
window.toggleTranslation = function() {
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    const newLang = currentLang === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
};

// Initialize the app
// Initialize page transitions and loading
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading overlay after page loads
    setTimeout(() => {
        hideLoadingOverlay();
    }, 500);
    
    // Add page transition class to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('page-transition');
    }
    
    // Initialize navigation and features
    renderPrayerMenus();
    initAccessibility();
    initPrayerDB();
    const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
    calculateLiturgicalDay(preferredLang);
    setupPrayerReminders();
    registerServiceWorker();
    // Populate Saint of the Day just below the date
    const saintEl = document.getElementById('saintOfDay');
    if (saintEl) {
        const info = getLiturgicalInfoForToday();
        if (info.feast) {
            saintEl.textContent = preferredLang === 'sw'
                ? `Mtakatifu wa Leo: ${translateFeastName(info.feast)}`
                : `Saint of the Day: ${info.feast}`;
            saintEl.classList.remove('hidden');
        }
    }
    // Upcoming feasts toggle behavior
    const toggleUpcoming = document.getElementById('toggleUpcomingFeasts');
    const feastsList = document.getElementById('upcomingFeastsList');
    if (toggleUpcoming && feastsList) {
        let loaded = false;
        toggleUpcoming.addEventListener('click', () => {
            feastsList.classList.toggle('hidden');
            if (!loaded) {
                const items = getUpcomingFeasts(5);
                if (!items.length) {
                    feastsList.innerHTML = '<p class="text-sm text-gray-600">No upcoming feasts.</p>';
                } else {
                    const container = document.createElement('div');
                    container.className = 'space-y-2';
                    items.forEach(e => {
                        const el = document.createElement('div');
                        el.className = 'flex items-center p-2 bg-white/70 dark:bg-black/20 rounded-lg shadow-sm';
                        el.innerHTML = `
                            <span class="text-xs font-medium w-16 text-gray-600 dark:text-gray-300">${e.date}</span>
                            <div class="flex-1">
                                <div class="font-medium text-gray-800 dark:text-gray-100">${e.name}</div>
                                <div class="text-xs text-gray-600 dark:text-gray-300">${e.type}</div>
                            </div>
                        `;
                        container.appendChild(el);
                    });
                    feastsList.appendChild(container);
                }
                loaded = true;
            }
        });
    }
    // Set language
    setLanguage(preferredLang);
    window.addEventListener('storage', (e) => {
        if (e.key === 'preferredLanguage' || e.key === 'langUpdatedAt') {
            const lang = localStorage.getItem('preferredLanguage') || 'en';
            setLanguage(lang);
        }
        if (e.key === 'textSize') {
            const size = e.newValue || 'normal';
            setTextSize(size);
        }
    });
    // Footer year
    const cy = document.getElementById('copyrightYear');
    if (cy) { cy.textContent = new Date().getFullYear(); }
    // Add event listener for translation toggle button
    const translationToggle = document.getElementById('translationToggle');
    if (translationToggle) {
        translationToggle.addEventListener('click', toggleTranslation);
    }
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterNavItems(e.target.value);
        });
    }
    // Enhance accessibility for small text
    enhanceSmallTextAccessibility();
});

// Function to open Office of the Readings for Mwaka 2
function openOfficeReadingsMwaka2() {
    window.location.href = "mwaka2.html";
}

// Function to open Office of the Readings for Mwaka 3
function openOfficeReadingsMwaka3() {
    window.location.href = "mwaka3.html";
}

// Offline Prayer History and Favorites using IndexedDB
let prayerDB;
function initPrayerDB() {
    const request = indexedDB.open('PrayerAppDB', 1);
    request.onerror = () => console.error('IndexedDB error');
    request.onsuccess = (event) => {
        prayerDB = event.target.result;
        loadPrayerHistory();
        loadFavorites();
    };
    request.onupgradeneeded = (event) => {
        prayerDB = event.target.result;
        if (!prayerDB.objectStoreNames.contains('prayers')) {
            prayerDB.createObjectStore('prayers', { keyPath: 'id' });
        }
        if (!prayerDB.objectStoreNames.contains('favorites')) {
            prayerDB.createObjectStore('favorites', { keyPath: 'id' });
        }
    };
}

function savePrayerAccess(prayerId, title, url) {
    if (!prayerDB) return;
    const transaction = prayerDB.transaction(['prayers'], 'readwrite');
    const store = transaction.objectStore('prayers');
    const prayer = { id: prayerId, title, url, lastAccessed: new Date() };
    store.put(prayer);
}

function toggleFavorite(prayerId, title, url) {
    if (!prayerDB) return;
    const transaction = prayerDB.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    const getRequest = store.get(prayerId);
    getRequest.onsuccess = () => {
        if (getRequest.result) {
            store.delete(prayerId);
        } else {
            store.put({ id: prayerId, title, url, added: new Date() });
        }
        loadFavorites();
    };
}

function loadPrayerHistory() {
    if (!prayerDB) return;
    const transaction = prayerDB.transaction(['prayers'], 'readonly');
    const store = transaction.objectStore('prayers');
    const request = store.getAll();
    request.onsuccess = () => {
        const history = request.result.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)).slice(0, 10);
        displayPrayerHistory(history);
    };
}

function loadFavorites() {
    if (!prayerDB) return;
    const transaction = prayerDB.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');
    const request = store.getAll();
    request.onsuccess = () => {
        displayFavorites(request.result);
    };
}

function displayPrayerHistory(history) {
    const historyEl = document.getElementById('prayerHistory');
    if (!historyEl) return;
    historyEl.innerHTML = '<h3 class="text-lg font-bold mb-4 dark:text-gray-100">Recent Prayers</h3>';
    if (history.length === 0) {
        historyEl.innerHTML += '<p class="text-gray-500 dark:text-gray-400">No recent prayers</p>';
        return;
    }
    history.forEach(prayer => {
        const item = document.createElement('a');
        item.href = prayer.url;
        item.className = 'block p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm mb-2 hover:bg-gray-50 dark:hover:bg-gray-600';
        item.innerHTML = `<div class="font-medium dark:text-gray-100">${prayer.title}</div><div class="text-sm text-gray-500 dark:text-gray-400">${new Date(prayer.lastAccessed).toLocaleDateString()}</div>`;
        historyEl.appendChild(item);
    });
}

function displayFavorites(favorites) {
    const favEl = document.getElementById('prayerFavorites');
    if (!favEl) return;
    favEl.innerHTML = '<h3 class="text-lg font-bold mb-4 dark:text-gray-100">Favorite Prayers</h3>';
    if (favorites.length === 0) {
        favEl.innerHTML += '<p class="text-gray-500 dark:text-gray-400">No favorites yet</p>';
        return;
    }
    favorites.forEach(prayer => {
        const item = document.createElement('a');
        item.href = prayer.url;
        item.className = 'block p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm mb-2 hover:bg-gray-50 dark:hover:bg-gray-600';
        item.innerHTML = `<div class="font-medium dark:text-gray-100">${prayer.title}</div>`;
        favEl.appendChild(item);
    });
}

// Prayer Streaks and Progress Tracking
function getPrayerStreak() {
    const prayedDates = JSON.parse(localStorage.getItem('prayedDates') || '[]');
    const today = new Date().toDateString();
    if (!prayedDates.includes(today)) return 0;
    let streak = 0;
    let checkDate = new Date();
    while (prayedDates.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
}

function markPrayerCompleted() {
    const today = new Date().toDateString();
    let prayedDates = JSON.parse(localStorage.getItem('prayedDates') || '[]');
    if (!prayedDates.includes(today)) {
        prayedDates.push(today);
        localStorage.setItem('prayedDates', JSON.stringify(prayedDates));
        updateStreakDisplay();
        if (window.plausible) window.plausible('Prayer Completed');
    }
}

function updateStreakDisplay() {
    const streakCount = document.getElementById('streakCount');
    const streakProgress = document.getElementById('streakProgress');
    if (!streakCount || !streakProgress) return;
    const streak = getPrayerStreak();
    streakCount.textContent = `${streak} days`;
    const progress = Math.min(streak / 7 * 100, 100); // Weekly goal
    streakProgress.style.width = `${progress}%`;
}

// Search and Filtering
function filterNavItems(query) {
    const items = document.querySelectorAll('.nav-item');
    items.forEach(item => {
        const title = item.getAttribute('data-title');
        const text = translations['en'][title] || '';
        if (text.toLowerCase().includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Social Sharing
window.sharePrayer = function(title, text, url = window.location.href) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            if (window.plausible) window.plausible('Prayer Shared');
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${title}\n${text}\n${url}`).then(() => {
            alert('Prayer link copied to clipboard!');
            if (window.plausible) window.plausible('Prayer Shared');
        });
    }
}

// Accessibility enhancement for small text elements
function enhanceSmallTextAccessibility() {
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
        if (el.children.length > 0 || !el.textContent.trim()) return; // skip if has children or no text
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 14) { // small text threshold
            const color = style.color;
            const bgColor = getBackgroundColor(el);
            const contrast = calculateContrast(color, bgColor);
            // contrast is null when a colour can't be evaluated reliably
            // (oklch/oklab from Tailwind 4, or semi-transparent backgrounds)
            if (contrast !== null && contrast < 4.5) {
                // Enhance contrast by setting high contrast colors
                el.style.color = '#000000';
                el.style.backgroundColor = '#ffffff';
                // Add ARIA label for screen readers
                if (!el.getAttribute('aria-label')) {
                    el.setAttribute('aria-label', el.textContent.trim());
                }
            }
            // Ensure screen reader accessibility
            if (!el.getAttribute('aria-hidden') && !el.getAttribute('role')) {
                el.setAttribute('role', 'text');
            }
        }
    });
}

function getBackgroundColor(el) {
    let bg = window.getComputedStyle(el).backgroundColor;
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        let parent = el.parentElement;
        while (parent) {
            bg = window.getComputedStyle(parent).backgroundColor;
            if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') break;
            parent = parent.parentElement;
        }
    }
    return bg || '#ffffff'; // default to white
}

// Parse an rgb()/rgba() colour into [r, g, b]; returns null for other colour
// formats (oklch, named colours) or semi-transparent colours, where the real
// rendered contrast cannot be computed here.
function parseRgbColor(color) {
    const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(color);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) < 1) return null;
    return [+m[1], +m[2], +m[3]];
}

function calculateContrast(color1, color2) {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    if (l1 === null || l2 === null) return null;
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getLuminance(color) {
    const rgb = parseRgbColor(color);
    if (!rgb) return null;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}