
// Translations
const translations = {
    en: {
        home: "Home",
        lauds: "Lauds",
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
        copyright: "iPray App. All rights reserved."
    },
    sw: {
        home: "Nyumbani",
        lauds: "Masifu",
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
        dailyReadings: "Masomo ya Siku",
        installApp: "Sakinisha App ya ipray",
        copyright: "App ya iPray. Haki zote zimehifadhiwa."
    }
};

// Liturgical Feasts Data (fixed-date) copied from calendar for consistency
const LITURGICAL_FEASTS = {
    0:[{date:1,name:"Mary, Mother of God",type:"Solemnity",color:"white"},{date:2,name:"Basil the Great and Gregory Nazianzen",type:"Memorial",color:"white"},{date:3,name:"Most Holy Name of Jesus",type:"Optional Memorial",color:"white"},{date:4,name:"Elizabeth Ann Seton",type:"Memorial",color:"white",country:"US"},{date:5,name:"John Neumann",type:"Memorial",color:"white",country:"US"},{date:6,name:"Epiphany",type:"Solemnity",color:"white"},{date:7,name:"Raymond of Penyafort",type:"Optional Memorial",color:"white"},{date:13,name:"Hilary of Poitiers",type:"Optional Memorial",color:"white"},{date:17,name:"Anthony of Egypt",type:"Memorial",color:"white"},{date:20,name:"Vincent, deacon and martyr",type:"Optional Memorial",color:"red"},{date:21,name:"Agnes, virgin and martyr",type:"Memorial",color:"red"},{date:22,name:"Vincent, deacon and martyr",type:"Optional Memorial",color:"red"},{date:23,name:"Marianne Cope",type:"Optional Memorial",color:"white",country:"US"},{date:24,name:"Francis de Sales",type:"Memorial",color:"white"},{date:25,name:"Conversion of Paul, Apostle",type:"Feast",color:"white"},{date:26,name:"Timothy and Titus",type:"Memorial",color:"white"},{date:27,name:"Angela Merici",type:"Optional Memorial",color:"white"},{date:28,name:"Thomas Aquinas",type:"Memorial",color:"white"},{date:31,name:"John Bosco",type:"Memorial",color:"white"}],
    1:[{date:2,name:"Presentation of the Lord",type:"Feast",color:"white"},{date:3,name:"Blase, bishop and martyr",type:"Optional Memorial",color:"red"},{date:4,name:"Agatha, virgin and martyr",type:"Memorial",color:"red"},{date:6,name:"Paul Miki and companions",type:"Memorial",color:"red"},{date:8,name:"Josephine Bakhita",type:"Optional Memorial",color:"white"},{date:10,name:"Scholastica",type:"Memorial",color:"white"},{date:11,name:"Our Lady of Lourdes",type:"Optional Memorial",color:"white"},{date:14,name:"Cyril and Methodius",type:"Memorial",color:"white"},{date:21,name:"Peter Damian",type:"Optional Memorial",color:"white"},{date:22,name:"Chair of Peter",type:"Feast",color:"white"},{date:23,name:"Polycarp",type:"Memorial",color:"red"}],
    2:[{date:3,name:"Katharine Drexel",type:"Optional Memorial",color:"white",country:"US"},{date:4,name:"Casimir",type:"Optional Memorial",color:"white"},{date:7,name:"Perpetua and Felicity",type:"Memorial",color:"red"},{date:8,name:"John of God",type:"Optional Memorial",color:"white"},{date:9,name:"Frances of Rome",type:"Optional Memorial",color:"white"},{date:17,name:"Patrick",type:"Optional Memorial",color:"green"},{date:18,name:"Cyril of Jerusalem",type:"Optional Memorial",color:"white"},{date:19,name:"Joseph, Husband of Mary",type:"Solemnity",color:"white"},{date:23,name:"Turibius of Mogrovejo",type:"Optional Memorial",color:"white"},{date:25,name:"Annunciation of the Lord",type:"Solemnity",color:"white"}],
    3:[{date:2,name:"Francis of Paola",type:"Optional Memorial",color:"white"},{date:4,name:"Isidore",type:"Optional Memorial",color:"white"},{date:5,name:"Vincent Ferrer",type:"Optional Memorial",color:"white"},{date:7,name:"John Baptist de la Salle",type:"Memorial",color:"white"},{date:11,name:"Stanislaus",type:"Memorial",color:"red"},{date:13,name:"Martin I",type:"Optional Memorial",color:"red"},{date:21,name:"Anselm of Canterbury",type:"Optional Memorial",color:"white"},{date:23,name:"George or Adalbert",type:"Optional Memorial",color:"red"},{date:24,name:"Fidelis of Sigmaringen",type:"Optional Memorial",color:"red"},{date:25,name:"Mark the Evangelist",type:"Feast",color:"white"},{date:28,name:"Peter Chanel or Louis de Montfort",type:"Optional Memorial",color:"red"},{date:29,name:"Catherine of Siena",type:"Memorial",color:"white"},{date:30,name:"Pius V",type:"Optional Memorial",color:"white"}],
    4:[{date:1,name:"Joseph the Worker",type:"Optional Memorial",color:"white"},{date:2,name:"Athanasius",type:"Memorial",color:"white"},{date:3,name:"Philip and James, Apostles",type:"Feast",color:"white"},{date:10,name:"Damien de Veuster",type:"Optional Memorial",color:"white",country:"US"},{date:13,name:"Our Lady of Fatima",type:"Optional Memorial",color:"white"},{date:14,name:"Matthias the Apostle",type:"Feast",color:"white"},{date:15,name:"Isidore the Farmer",type:"Optional Memorial",color:"white",country:"US"},{date:18,name:"John I",type:"Optional Memorial",color:"red"},{date:20,name:"Bernardine of Siena",type:"Optional Memorial",color:"white"},{date:21,name:"Christopher Magallanes and companions",type:"Optional Memorial",color:"red"},{date:22,name:"Rita of Cascia",type:"Optional Memorial",color:"white"},{date:24,name:"Bede or Gregory VII or Mary Magdalene de Pazzi",type:"Optional Memorial",color:"white"},{date:25,name:"Philip Neri",type:"Memorial",color:"white"},{date:26,name:"Augustine of Canterbury",type:"Optional Memorial",color:"white"},{date:31,name:"Visitation of the Blessed Virgin Mary",type:"Feast",color:"white"}],
    5:[{date:1,name:"Justin Martyr",type:"Memorial",color:"red"},{date:3,name:"Charles Lwanga and companions",type:"Memorial",color:"red"},{date:5,name:"Boniface",type:"Memorial",color:"red"},{date:9,name:"Ephrem",type:"Optional Memorial",color:"white"},{date:11,name:"Barnabas the Apostle",type:"Memorial",color:"white"},{date:13,name:"Anthony of Padua",type:"Memorial",color:"white"},{date:19,name:"Romuald",type:"Optional Memorial",color:"white"},{date:21,name:"Aloysius Gonzaga",type:"Memorial",color:"white"},{date:22,name:"Paulinus or John Fisher and Thomas More",type:"Optional Memorial",color:"red"},{date:24,name:"Birth of John the Baptist",type:"Solemnity",color:"white"},{date:28,name:"Irenaeus",type:"Memorial",color:"red"},{date:29,name:"Peter and Paul, Apostles",type:"Solemnity",color:"white"},{date:30,name:"First Martyrs of the Church of Rome",type:"Optional Memorial",color:"red"}],
    6:[{date:1,name:"Junípero Serra",type:"Optional Memorial",color:"white",country:"US"},{date:3,name:"Thomas the Apostle",type:"Feast",color:"white"},{date:5,name:"Anthony Zaccaria or Elizabeth of Portugal",type:"Optional Memorial",color:"white"},{date:6,name:"Maria Goretti",type:"Optional Memorial",color:"red"},{date:9,name:"Augustine Zhao Rong and companions",type:"Optional Memorial",color:"red"},{date:11,name:"Benedict",type:"Memorial",color:"white"},{date:13,name:"Henry",type:"Optional Memorial",color:"white"},{date:14,name:"Camillus de Lellis or Kateri Tekakwitha",type:"Optional Memorial",color:"white"},{date:15,name:"Bonaventure",type:"Memorial",color:"white"},{date:16,name:"Our Lady of Mount Carmel",type:"Optional Memorial",color:"white"},{date:18,name:"Camillus de Lellis",type:"Optional Memorial",color:"white",country:"US"},{date:20,name:"Apollinaris",type:"Optional Memorial",color:"red"},{date:21,name:"Lawrence of Brindisi",type:"Optional Memorial",color:"white"},{date:22,name:"Mary Magdalene",type:"Feast",color:"white"},{date:25,name:"James, Apostle",type:"Feast",color:"red"},{date:26,name:"Joachim and Anne",type:"Memorial",color:"white"},{date:29,name:"Martha",type:"Memorial",color:"white"},{date:30,name:"Peter Chrysologus",type:"Optional Memorial",color:"white"},{date:31,name:"Ignatius of Loyola",type:"Memorial",color:"white"}],
    7:[{date:1,name:"Alphonsus Maria de Liguori",type:"Memorial",color:"white"},{date:4,name:"Jean Vianney",type:"Memorial",color:"white"},{date:5,name:"Dedication of Mary Major",type:"Optional Memorial",color:"white"},{date:6,name:"Transfiguration of the Lord",type:"Feast",color:"white"},{date:7,name:"Sixtus II or Cajetan",type:"Optional Memorial",color:"red"},{date:8,name:"Dominic",type:"Memorial",color:"white"},{date:9,name:"Teresa Benedicta of the Cross",type:"Optional Memorial",color:"red"},{date:10,name:"Lawrence, deacon and martyr",type:"Feast",color:"red"},{date:11,name:"Clare",type:"Memorial",color:"white"},{date:12,name:"Jane Frances de Chantal",type:"Optional Memorial",color:"white"},{date:13,name:"Pontian and Hippolytus",type:"Optional Memorial",color:"red"},{date:14,name:"Maximilian Kolbe",type:"Memorial",color:"red"},{date:15,name:"Assumption of the Blessed Virgin Mary",type:"Solemnity",color:"white"},{date:16,name:"Stephen of Hungary",type:"Optional Memorial",color:"white"},{date:19,name:"John Eudes",type:"Optional Memorial",color:"white"},{date:20,name:"Bernard of Clairvaux",type:"Memorial",color:"white"},{date:21,name:"Pius X",type:"Memorial",color:"white"},{date:22,name:"Queenship of Blessed Virgin Mary",type:"Memorial",color:"white"},{date:23,name:"Rose of Lima",type:"Optional Memorial",color:"white"},{date:24,name:"Bartholomew the Apostle",type:"Feast",color:"white"},{date:25,name:"Louis or Joseph of Calasanz",type:"Optional Memorial",color:"white"},{date:27,name:"Monica",type:"Memorial",color:"white"},{date:28,name:"Augustine of Hippo",type:"Memorial",color:"white"},{date:29,name:"Beheading of John the Baptist",type:"Memorial",color:"red"}],
    8:[{date:3,name:"Gregory the Great",type:"Memorial",color:"white"},{date:8,name:"Birth of the Blessed Virgin Mary",type:"Feast",color:"white"},{date:9,name:"Peter Claver",type:"Memorial",color:"white",country:"US"},{date:12,name:"Holy Name of the Blessed Virgin Mary",type:"Optional Memorial",color:"white"},{date:13,name:"John Chrysostom",type:"Memorial",color:"white"},{date:14,name:"Exaltation of the Holy Cross",type:"Feast",color:"red"},{date:15,name:"Our Lady of Sorrows",type:"Memorial",color:"white"},{date:16,name:"Cornelius and Cyprian",type:"Memorial",color:"red"},{date:17,name:"Robert Bellarmine",type:"Optional Memorial",color:"white"},{date:19,name:"Januarius",type:"Optional Memorial",color:"red"},{date:20,name:"Andrew Kim and companions",type:"Memorial",color:"red"},{date:21,name:"Matthew the Evangelist",type:"Feast",color:"white"},{date:23,name:"Padre Pio",type:"Memorial",color:"white"},{date:26,name:"Cosmas and Damian",type:"Optional Memorial",color:"red"},{date:27,name:"Vincent de Paul",type:"Memorial",color:"white"},{date:28,name:"Wenceslaus or Lawrence Ruiz and companions",type:"Optional Memorial",color:"red"},{date:29,name:"Michael, Gabriel, and Raphael",type:"Feast",color:"white"},{date:30,name:"Jerome",type:"Memorial",color:"white"}],
    9:[{date:1,name:"Thérèse of the Child Jesus",type:"Memorial",color:"white"},{date:2,name:"Guardian Angels",type:"Memorial",color:"white"},{date:3,name:"Francis of Assisi",type:"Memorial",color:"white"},{date:5,name:"Francis Xavier Seelos",type:"Optional Memorial",color:"white",country:"US"},{date:6,name:"Bruno or Marie-Rose Durocher",type:"Optional Memorial",color:"white"},{date:7,name:"Our Lady of the Rosary",type:"Memorial",color:"white"},{date:9,name:"Denis or John Leonardi",type:"Optional Memorial",color:"red"},{date:11,name:"John XXIII",type:"Optional Memorial",color:"white"},{date:14,name:"Callistus I",type:"Optional Memorial",color:"red"},{date:15,name:"Teresa of Jesus",type:"Memorial",color:"white"},{date:16,name:"Hedwig or Margaret Mary Alacoque",type:"Optional Memorial",color:"white"},{date:17,name:"Ignatius of Antioch",type:"Memorial",color:"red"},{date:18,name:"Luke the Evangelist",type:"Feast",color:"white"},{date:19,name:"Jean de Brébeuf and companions",type:"Memorial",color:"red",country:"US"},{date:20,name:"Paul of the Cross",type:"Optional Memorial",color:"white"},{date:22,name:"John Paul II",type:"Optional Memorial",color:"white"},{date:23,name:"John of Capistrano",type:"Optional Memorial",color:"white"},{date:24,name:"Anthony Mary Claret",type:"Optional Memorial",color:"white"},{date:28,name:"Simon and Jude",type:"Feast",color:"white"}],
    10:[{date:1,name:"All Saints",type:"Solemnity",color:"white"},{date:2,name:"Commemoration of All Souls",type:"Solemnity",color:"white"},{date:3,name:"Martin de Porres",type:"Optional Memorial",color:"white"},{date:4,name:"Charles Borromeo",type:"Memorial",color:"white"},{date:9,name:"Dedication of the Lateran Basilica",type:"Feast",color:"white"},{date:10,name:"Leo the Great",type:"Memorial",color:"white"},{date:11,name:"Martin of Tours",type:"Memorial",color:"white"},{date:12,name:"Josaphat",type:"Memorial",color:"red"},{date:13,name:"Frances Xavier Cabrini",type:"Memorial",color:"white",country:"US"},{date:15,name:"Albert the Great",type:"Optional Memorial",color:"white"},{date:16,name:"Margaret of Scotland or Gertrude",type:"Optional Memorial",color:"white"},{date:17,name:"Elizabeth of Hungary",type:"Memorial",color:"white"},{date:18,name:"Rose Philippine Duchesne",type:"Optional Memorial",color:"white",country:"US"},{date:21,name:"Presentation of the Blessed Virgin Mary",type:"Memorial",color:"white"},{date:22,name:"Cecilia",type:"Memorial",color:"red"},{date:23,name:"Clement I or Columban or Miguel Pro",type:"Optional Memorial",color:"red"},{date:24,name:"Andrew Dung-Lac and companions",type:"Memorial",color:"red"},{date:25,name:"Catherine of Alexandria",type:"Optional Memorial",color:"red"},{date:30,name:"Andrew the Apostle",type:"Feast",color:"white"}],
    11:[{date:3,name:"Francis Xavier",type:"Memorial",color:"white"},{date:4,name:"John Damascene",type:"Optional Memorial",color:"white"},{date:6,name:"Nicholas",type:"Optional Memorial",color:"white"},{date:7,name:"Ambrose",type:"Memorial",color:"white"},{date:8,name:"Immaculate Conception",type:"Solemnity",color:"white"},{date:9,name:"Juan Diego",type:"Optional Memorial",color:"white"},{date:11,name:"Damasus I",type:"Optional Memorial",color:"white"},{date:12,name:"Our Lady of Guadalupe",type:"Memorial",color:"white",country:"US"},{date:13,name:"Lucy",type:"Memorial",color:"red"},{date:14,name:"John of the Cross",type:"Memorial",color:"white"},{date:21,name:"Peter Canisius",type:"Optional Memorial",color:"white"},{date:23,name:"John of Kanty",type:"Optional Memorial",color:"white"},{date:25,name:"Nativity of the Lord",type:"Solemnity",color:"white"},{date:26,name:"Stephen, First Martyr",type:"Feast",color:"red"},{date:27,name:"John the Apostle",type:"Feast",color:"white"},{date:28,name:"Holy Innocents",type:"Feast",color:"red"},{date:29,name:"Thomas Becket",type:"Optional Memorial",color:"red"},{date:31,name:"Sylvester I",type:"Optional Memorial",color:"white"}]
};

function calculateEasterForFeasts(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

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

function togglePrayer() {
    const prayerText = document.getElementById('prayerText');
    const toggleBtn = document.getElementById('togglePrayerBtn');
    prayerText.classList.toggle('hidden');
    if (!prayerText.classList.contains('hidden')) {
        toggleBtn.classList.add('hidden'); // Hide "Tap to view" after expanding
    }
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
    document.getElementById('appSubtitle').textContent = lang === 'sw' ? "Msaidizi wako Wa Sala" : "Your Prayer Companion";
    const season = document.getElementById('season').textContent.trim();
    updateLiturgicalQuote(season, lang);
   
    // Update dynamic liturgical content
    const feastEl = document.getElementById('feastDay');
    if (feastEl && !feastEl.classList.contains('hidden')) {
        const info = getLiturgicalInfoForToday();
        if (info.feast) {
            feastEl.textContent = lang === 'sw' ? translateFeastName(info.feast) : info.feast;
        }
    }
   
    const saintEl = document.getElementById('saintOfDay');
    if (saintEl && !saintEl.classList.contains('hidden')) {
        const info = getLiturgicalInfoForToday();
        if (info.feast) {
            saintEl.textContent = lang === 'sw'
                ? `Mtakatifu wa Leo: ${translateFeastName(info.feast)}`
                : `Saint of the Day: ${info.feast}`;
        }
    }
   
    // Update date format
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString(
        lang === 'sw' ? 'sw' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );

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

// Navigation
const navItemsData = [
    // Scripture (Office of Readings) → Document/Text icon
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />`, title: 'scripture', color: 'text-orange-600', id: 'scripture', link: 'pages/ofisi ya masomo/index.html' },
    // Readings (Compline) → Moon icon
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`, title: 'readings', color: 'text-blue-600', id: 'readings', link: 'pages/compline.html' },
    // Rosary → Heart (devotional)
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />`, title: 'rosary', color: 'text-red-600', id: 'rosary', link: 'pages/holy-rosary.html' },
    // Prayer Requests → Community/users icon (unchanged)
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />`, title: 'requests', color: 'text-green-600', id: 'prayers', link: 'pages/carmen.html' },
    // Morning Prayer → Sun icon (unchanged)
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`, title: 'prayers', color: 'text-yellow-600', id: 'morning', link: 'pages/prayer.html' },
    // Way of the Cross → Cross (plus) icon
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />`, title: 'sacraments', color: 'text-pink-600', id: 'sacraments', link: 'pages/via-cruce.html' },
    // Midday Prayer → Sun icon
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`, title: 'midday', color: 'text-orange-500', id: 'midday', link: '#' },
    // Vespers / Evening Prayer → Moon icon
    { icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`, title: 'vespers', color: 'text-indigo-600', id: 'vespers', link: '#' }
];

function getCurrentWeekNumber() {
    const today = new Date();
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    currentSunday.setHours(0, 0, 0, 0);
    // Week 18 starts on Sunday, August 3, 2025
    const referenceSunday = new Date(2025, 7, 3); // August = 7 (0-based)
    referenceSunday.setHours(0, 0, 0, 0);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksSinceRef = Math.round((currentSunday - referenceSunday) / msPerWeek);
    return 18 + weeksSinceRef;
}

function initNavigation() {
    const navGrid = document.getElementById('navGrid');
    navGrid.innerHTML = '';
    navItemsData.forEach(item => {
        const navItem = document.createElement('a');
        // Set href - will be overridden for items with custom handlers
        navItem.href = item.link;
        navItem.className = 'nav-item block p-6 rounded-2xl cursor-pointer card-hover bg-white transition-all duration-300';
        navItem.setAttribute('data-title', item.title);
        // Only prevent default for Scripture, Midday, and Vespers (they have custom handlers)
        if (item.title === 'scripture' || item.title === 'midday' || item.title === 'vespers') {
            navItem.href = '#'; // Prevent default navigation
        }
        navItem.innerHTML = `
            <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-gray-100">
                    <svg class="w-8 h-8 ${item.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        ${item.icon}
                    </svg>
                </div>
                <h3 class="font-semibold text-lg text-gray-800" data-translate="${item.title}">
                    ${translations['en'][item.title]}
                </h3>
            </div>
        `;
        // Special handling for Scripture card (Office of Readings)
        if (item.title === 'scripture') {
            navItem.addEventListener('click', function (e) {
                e.preventDefault();
                const today = new Date();
                const currentDay = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
                // Find the Sunday of the current week
                const currentSunday = new Date(today);
                currentSunday.setDate(today.getDate() - currentDay);
                // Reference Sunday for week 24: September 14, 2025
                const referenceSunday = new Date(2025, 8, 14); // September is 8 (0-based), 14
                const msPerWeek = 7 * 24 * 60 * 60 * 1000;
                const weeksDiff = Math.floor((currentSunday - referenceSunday) / msPerWeek);
                const week = 24 + weeksDiff;
                // Ensure within range 21 to 34
                if (week < 21 || week > 34) {
                    alert("Office of Readings for this week is not available.");
                    return;
                }
                const filename = `mwaka3-week${week}.html`;
                window.location.href = filename;
            });
        }
        // Special handling for Midday Prayer card
        if (item.title === 'midday') {
            navItem.addEventListener('click', function (e) {
                e.preventDefault();
                const { dayPrefix, week } = getCurrentWeekAndDay();
                const fileName = getPrayerFileName(dayPrefix, week, 'saa-sita');
                savePrayerAccess('midday', 'Sala ya Mchana', fileName);
                window.location.href = `pages/${fileName}`;
            });
        }
        // Special handling for Vespers card
        if (item.title === 'vespers') {
            navItem.addEventListener('click', function (e) {
                e.preventDefault();
                const { dayPrefix, week } = getCurrentWeekAndDay();
                const fileName = getPrayerFileName(dayPrefix, week, 'jioni');
                savePrayerAccess('vespers', 'Masifu ya Jioni', fileName);
                window.location.href = `pages/${fileName}`;
            });
        }
        navGrid.appendChild(navItem);
        // Save prayer access (only for items without custom handlers)
        if (item.title !== 'scripture' && item.title !== 'midday' && item.title !== 'vespers') {
            navItem.addEventListener('click', () => {
                savePrayerAccess(item.id, translations['en'][item.title], item.link);
            });
        }
    });
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
    const day = new Date().getDay();
    const dayToPrefix = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
    
    // Find the most recent Sunday (start of the current liturgical week)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceSunday = today.getDay(); // 0=Sunday, 6=Saturday
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - daysSinceSunday);
    currentSunday.setHours(0, 0, 0, 0);
    
    // Reference Sunday for week 1
    // Using a known Sunday where we know it's week 1
    // Adjust this date to match when week 1 actually starts in your cycle
    const referenceWeek1Sunday = new Date(2025, 7, 10); // August 10, 2025 (Sunday) - adjust as needed
    referenceWeek1Sunday.setHours(0, 0, 0, 0);
    
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksSinceRef = Math.floor((currentSunday - referenceWeek1Sunday) / msPerWeek);
    
    // Calculate week number (1, 2, 3, or 4) using modulo 4
    // weeksSinceRef = 0 → week 1, 1 → week 2, 2 → week 3, 3 → week 4, 4 → week 1 (cycle repeats)
    // Add 4 before modulo to handle negative numbers correctly, then add 1 to convert 0-3 to 1-4
    const week = ((weeksSinceRef % 4) + 4) % 4 + 1;
    
    const dayPrefix = dayToPrefix[day];
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

// Update liturgical quote
function updateLiturgicalQuote(season, lang) {
    const quoteElement = document.getElementById('liturgicalQuote');
    let quoteKey = 'quoteOrdinary';
    if (season === 'Advent') quoteKey = 'quoteAdvent';
    else if (season === 'Christmas') quoteKey = 'quoteChristmas';
    else if (season === 'Lent') quoteKey = 'quoteLent';
    else if (season === 'Easter') quoteKey = 'quoteEaster';
    quoteElement.textContent = translations[lang || 'sw'][quoteKey];
}

// Liturgical Calendar Logic
function calculateLiturgicalDay(lang = 'sw') {
    const today = new Date();
    const year = today.getFullYear();
    function calculateEaster(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }
    const easter = calculateEaster(year);
    const christmas = new Date(year, 11, 25);
    const ashWednesday = new Date(easter);
    ashWednesday.setDate(easter.getDate() - 46);
    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49);
    const adventStart = new Date(year, 11, 25);
    while (adventStart.getDay() !== 0) {
        adventStart.setDate(adventStart.getDate() - 1);
    }
    adventStart.setDate(adventStart.getDate() - 21);
    let season = 'Ordinary Time';
    let feast = null;
    let seasonImage = 'assets/images/maria-mdogo.jpg';
    let liturgicalColor = 'green';
    if (today.getMonth() === 11 && today.getDate() === 25) {
        season = 'Christmas';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        feast = 'Nativity of the Lord';
        liturgicalColor = 'white';
    } else if (today.getMonth() === 0 && today.getDate() === 1) {
        season = 'Christmas';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        feast = 'Mary, Mother of God';
        liturgicalColor = 'white';
    } else if (today.getMonth() === 0 && today.getDate() === 6) {
        season = 'Christmas';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        feast = 'Epiphany of the Lord';
        liturgicalColor = 'white';
    } else if (today >= adventStart && today < christmas) {
        season = 'Advent';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'purple';
    } else if (today >= christmas && today < new Date(year, 0, 8)) {
        season = 'Christmas';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'white';
    } else if (today >= new Date(year, 0, 8) && today < ashWednesday) {
        season = 'Ordinary Time';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'green';
    } else if (today >= ashWednesday && today < easter) {
        season = 'Lent';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'purple';
    } else if (today >= easter && today < pentecost) {
        season = 'Easter';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'white';
    } else if (today >= pentecost && today < adventStart) {
        season = 'Ordinary Time';
        seasonImage = 'assets/images/maria-mdogo.jpg';
        liturgicalColor = 'green';
    }
    if (today.getDate() === 2 && today.getMonth() === 2) {
        feast = 'Presentation of the Lord';
        liturgicalColor = 'white';
    } else if (today.getDate() === 25 && today.getMonth() === 3) {
        feast = 'Annunciation of the Lord';
        liturgicalColor = 'white';
    } else if (today.getDate() === 24 && today.getMonth() === 5) {
        feast = 'Nativity of St. John the Baptist';
        liturgicalColor = 'white';
    } else if (today.getDate() === 29 && today.getMonth() === 8) {
        feast = 'Sts. Michael, Gabriel, and Raphael';
        liturgicalColor = 'white';
    } else if (today.getDate() === 1 && today.getMonth() === 10) {
        feast = 'All Saints';
        liturgicalColor = 'white';
    } else if (today.getDate() === 2 && today.getMonth() === 10) {
        feast = 'All Souls';
        liturgicalColor = 'purple';
    }
    document.getElementById('season').textContent = season;
    document.getElementById('liturgicalYear').textContent = year;
    document.getElementById('currentDate').textContent = today.toLocaleDateString(
        lang === 'sw' ? 'sw' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
    const card = document.getElementById('liturgicalCard');
    card.classList.remove('bg-purple-100', 'bg-white-100', 'bg-red-100', 'bg-green-100', 'bg-gold-100',
                        'border-purple-200', 'border-white-200', 'border-red-200', 'border-green-200', 'border-gold-200');
    card.classList.add(`bg-${liturgicalColor}-100`, `border-${liturgicalColor}-200`);
    const seasonBadge = document.getElementById('seasonBadge');
    seasonBadge.classList.remove('text-purple-800', 'text-white-800', 'text-red-800', 'text-green-800', 'text-gold-800');
    seasonBadge.classList.add(`text-${liturgicalColor}-800`);
    const feastElement = document.getElementById('feastDay');
    if (feast) {
        feastElement.textContent = lang === 'sw' ? translateFeastName(feast) : feast;
        feastElement.classList.remove('hidden');
        feastElement.classList.remove('text-purple-800', 'text-white-800', 'text-red-800', 'text-green-800', 'text-gold-800');
        feastElement.classList.add(`text-${liturgicalColor}-800`);
    } else {
        feastElement.classList.add('hidden');
    }
    updateLiturgicalQuote(season, lang);
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
        const day = today.getDate(); // 1, 2, ..., 31
        const monthIndex = today.getMonth(); // 0 = Jan, 6 = Jul, 7 = Aug, ..., 11 = Dec
        // Only July to December
        if (monthIndex < 6) {
            console.warn("Readings only available from July onward.");
            return;
        }
        const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const shortMonth = shortMonths[monthIndex]; // e.g., 'aug'
        const longMonth = longMonths[monthIndex]; // e.g., 'august'
        const fileName = `${day}${shortMonth}.html`; // e.g., 4aug.html
        const filePath = `/i-pray/assets/${longMonth}/${fileName}`; // ✅ Correct path
        const lang = localStorage.getItem('preferredLanguage') || 'sw';
        const readingsCard = document.createElement('div');
        readingsCard.className = 'rounded-2xl p-6 bg-white shadow-lg card-hover cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center h-32';
        readingsCard.innerHTML = `
            <h3 class="text-xl font-bold text-purple-600">${translations[lang].dailyReadings}</h3>
            <p class="text-xs font-medium text-gray-500 mt-2">${translations[lang].tapToView}</p>
        `;
        // Click: Open in same tab
        readingsCard.addEventListener('click', () => {
            fetch(filePath)
                .then(response => {
                    if (response.ok) {
                        window.location.href = filePath; // Open in same tab
                    } else {
                        alert("Today's reading is not available yet.");
                    }
                })
                .catch(() => {
                    alert("Could not load today's reading.");
                });
        });
        // Insert before navGrid
        const homeView = document.getElementById('homeView');
        const navGrid = document.getElementById('navGrid');
        if (homeView && navGrid) {
            homeView.insertBefore(readingsCard, navGrid);
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

// Install Prompt Handling — home page (index.html) only
function isHomePage() {
    const path = window.location.pathname;
    return path === '/i-pray/' || path.endsWith('/i-pray/index.html') ||
        path === '/' || path.endsWith('/index.html');
}
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    if (!isHomePage()) return;
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
    if (!isHomePage()) return;
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
    if (!isHomePage()) return;
    const installContainer = document.getElementById('installContainer');
    installContainer.classList.add('hidden');
    console.log('App installed successfully');
});

// Toggle translation function
window.toggleTranslation = function() {
    const currentLang = localStorage.getItem('preferredLanguage') || 'sw';
    const newLang = currentLang === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation and features
    initNavigation();
    initAccessibility();
    initPrayerDB();
    const preferredLang = localStorage.getItem('preferredLanguage') || 'sw';
    calculateLiturgicalDay(preferredLang);
    fetchSaintOfTheDay();
    fetchDailyReadings();
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
                        el.className = 'flex items-center p-2 bg-white/70 rounded-lg shadow-sm';
                        el.innerHTML = `
                            <span class="text-xs font-medium w-16 text-gray-600">${e.date}</span>
                            <div class="flex-1">
                                <div class="font-medium text-gray-800">${e.name}</div>
                                <div class="text-xs text-gray-600">${e.type}</div>
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
            const lang = localStorage.getItem('preferredLanguage') || 'sw';
            setLanguage(lang);
        }
        if (e.key === 'textSize') {
            const size = e.newValue || 'normal';
            setTextSize(size);
        }
    });
    // Add event listener for "Tap to view" on Carmen's prayer card
    const toggleBtn = document.getElementById('togglePrayerBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePrayer);
    }
    // Footer year
    const cy = document.getElementById('copyrightYear');
    if (cy) { cy.textContent = new Date().getFullYear(); }
    // Add event listener for translation toggle button
    const translationToggle = document.getElementById('translationToggle');
    if (translationToggle) {
        translationToggle.addEventListener('click', toggleTranslation);
    }
    // Prayer streak
    updateStreakDisplay();
    const markPrayedBtn = document.getElementById('markPrayedBtn');
    if (markPrayedBtn) {
        markPrayedBtn.addEventListener('click', markPrayerCompleted);
    }
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterNavItems(e.target.value);
        });
    }
    // Favorite Carmen prayer
    const favoriteCarmen = document.getElementById('favoriteCarmen');
    if (favoriteCarmen) {
        favoriteCarmen.addEventListener('click', () => {
            toggleFavorite('carmen', 'Pray To Carmen Hernandez', '#');
            const icon = favoriteCarmen.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        });
    }
    // Share Carmen prayer
    const shareCarmen = document.getElementById('shareCarmen');
    if (shareCarmen) {
        shareCarmen.addEventListener('click', () => {
            sharePrayer('Pray To Carmen Hernandez', 'Join me in praying to Carmen Hernandez for intercession.');
        });
    }
    // Save access for Carmen prayer when viewed
    const togglePrayerBtn = document.getElementById('togglePrayerBtn');
    if (togglePrayerBtn) {
        togglePrayerBtn.addEventListener('click', () => {
            savePrayerAccess('carmen', 'Pray To Carmen Hernandez', '#');
        });
    }
    // TTS button behavior
    const ttsButton = document.getElementById('ttsButton');
    if (ttsButton) {
        ttsButton.addEventListener('click', () => {
            const prayerTextEl = document.getElementById('prayerText');
            if (prayerTextEl.classList.contains('hidden')) {
                togglePrayer(); // Show the text if hidden
            }
            const prayer = prayerTextEl.textContent.trim();
            const preferredLang = localStorage.getItem('preferredLanguage') || 'sw';
            const langCode = preferredLang === 'sw' ? 'sw-TZ' : 'en-US';
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(prayer);
                utterance.lang = langCode;
                speechSynthesis.speak(utterance);
            } else {
                const audioEl = document.getElementById('prayerAudio');
                if (audioEl) {
                    audioEl.src = 'https://cdn.pixabay.com/audio/2023/11/17/audio_8247071d34.mp3'; // Placeholder fallback
                    audioEl.classList.remove('hidden');
                    audioEl.play().catch(() => {});
                }
            }
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
    historyEl.innerHTML = '<h3 class="text-lg font-bold mb-4">Recent Prayers</h3>';
    if (history.length === 0) {
        historyEl.innerHTML += '<p class="text-gray-500">No recent prayers</p>';
        return;
    }
    history.forEach(prayer => {
        const item = document.createElement('a');
        item.href = prayer.url;
        item.className = 'block p-3 bg-white rounded-lg shadow-sm mb-2 hover:bg-gray-50';
        item.innerHTML = `<div class="font-medium">${prayer.title}</div><div class="text-sm text-gray-500">${new Date(prayer.lastAccessed).toLocaleDateString()}</div>`;
        historyEl.appendChild(item);
    });
}

function displayFavorites(favorites) {
    const favEl = document.getElementById('prayerFavorites');
    if (!favEl) return;
    favEl.innerHTML = '<h3 class="text-lg font-bold mb-4">Favorite Prayers</h3>';
    if (favorites.length === 0) {
        favEl.innerHTML += '<p class="text-gray-500">No favorites yet</p>';
        return;
    }
    favorites.forEach(prayer => {
        const item = document.createElement('a');
        item.href = prayer.url;
        item.className = 'block p-3 bg-white rounded-lg shadow-sm mb-2 hover:bg-gray-50';
        item.innerHTML = `<div class="font-medium">${prayer.title}</div>`;
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
    const streak = getPrayerStreak();
    document.getElementById('streakCount').textContent = `${streak} days`;
    const progress = Math.min(streak / 7 * 100, 100); // Weekly goal
    document.getElementById('streakProgress').style.width = `${progress}%`;
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
            if (contrast < 4.5) {
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

function calculateContrast(color1, color2) {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getLuminance(color) {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0.5; // neutral luminance
    const r = parseInt(rgb[0]) / 255;
    const g = parseInt(rgb[1]) / 255;
    const b = parseInt(rgb[2]) / 255;
    const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}