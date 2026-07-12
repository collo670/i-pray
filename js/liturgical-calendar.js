// ---------------------------------------------------------------------------
// Shared liturgical calendar engine + General Roman Calendar data.
// Loaded before js/index.js on the main pages, and standalone by the
// Liturgy of the Hours pages (via js/liturgy-day-banner.js).
// ---------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------
// Liturgical calendar engine
// Computes season, week number and day label dynamically (no hardcoded dates).
// Ordinary Time after Pentecost is counted backwards from Christ the King
// (34th week), which is how the Church numbers those weeks.
// ---------------------------------------------------------------------------
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function litAddDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function litSundayOf(date) {
    return litAddDays(date, -date.getDay());
}

// First Sunday of Advent: 4th Sunday before Christmas
function getAdventStart(year) {
    const xmas = new Date(year, 11, 25);
    const dow = xmas.getDay();
    const sundayBefore = litAddDays(xmas, dow === 0 ? -7 : -dow);
    return litAddDays(sundayBefore, -21);
}

// Baptism of the Lord: first Sunday after January 6 (Epiphany)
function getBaptismOfLord(year) {
    const epiphany = new Date(year, 0, 6);
    const offset = (7 - epiphany.getDay()) % 7 || 7;
    return litAddDays(epiphany, offset);
}

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Returns { season, weekNum, dayLabel, color, psalterWeek } for a date.
// weekNum is the liturgical week within the season (null when not counted,
// e.g. Christmas season or days after Ash Wednesday).
function getLiturgicalToday(date = new Date(), lang = 'en') {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = d.getFullYear();
    const easter = calculateEasterForFeasts(year);
    const ashWednesday = litAddDays(easter, -46);
    const palmSunday = litAddDays(easter, -7);
    const pentecost = litAddDays(easter, 49);
    const christmas = new Date(year, 11, 25);
    const advent1 = getAdventStart(year);
    const baptism = getBaptismOfLord(year);
    const isSunday = d.getDay() === 0;
    const weekdayName = d.toLocaleDateString(lang === 'sw' ? 'sw' : 'en-US', { weekday: 'long' });
    const sw = lang === 'sw';

    let season = 'Ordinary Time';
    let weekNum = null;
    let dayLabel = '';
    let color = 'green';

    if (d >= advent1 && d < christmas) {
        season = 'Advent';
        color = 'purple';
        weekNum = Math.floor((d - advent1) / MS_PER_WEEK) + 1;
        dayLabel = isSunday
            ? (sw ? `Dominika ya ${weekNum} ya Majilio` : `${ordinal(weekNum)} Sunday of Advent`)
            : (sw ? `${weekdayName}, Juma la ${weekNum} la Majilio` : `${weekdayName} of the ${ordinal(weekNum)} Week of Advent`);
    } else if (d >= christmas || d <= baptism) {
        // Christmas season: Dec 25 through the Baptism of the Lord
        season = 'Christmas';
        color = 'white';
        if (d.getMonth() === 11 && d.getDate() === 25) {
            dayLabel = sw ? 'Sherehe ya Kuzaliwa kwa Bwana' : 'The Nativity of the Lord';
        } else if (+d === +baptism) {
            dayLabel = sw ? 'Ubatizo wa Bwana' : 'The Baptism of the Lord';
        } else {
            dayLabel = sw ? `${weekdayName}, Kipindi cha Noeli` : `${weekdayName} of Christmas Time`;
        }
    } else if (d < ashWednesday) {
        // Ordinary Time, part one: weeks counted from the Baptism of the Lord
        weekNum = Math.floor((litSundayOf(d) - +baptism) / MS_PER_WEEK) + 1;
        dayLabel = isSunday
            ? (sw ? `Dominika ya ${weekNum} ya Mwaka` : `${ordinal(weekNum)} Sunday in Ordinary Time`)
            : (sw ? `${weekdayName}, Juma la ${weekNum} la Mwaka` : `${weekdayName} of the ${ordinal(weekNum)} Week in Ordinary Time`);
    } else if (d < easter) {
        season = 'Lent';
        color = 'purple';
        const firstSundayLent = litAddDays(ashWednesday, 4);
        if (d >= palmSunday) {
            weekNum = 6;
            dayLabel = isSunday
                ? (sw ? 'Dominika ya Matawi' : 'Palm Sunday of the Passion of the Lord')
                : (sw ? `${weekdayName} wa Juma Kuu` : `${weekdayName} of Holy Week`);
        } else if (d < firstSundayLent) {
            if (+d === +ashWednesday) {
                dayLabel = sw ? 'Jumatano ya Majivu' : 'Ash Wednesday';
            } else {
                dayLabel = sw ? `${weekdayName} baada ya Majivu` : `${weekdayName} after Ash Wednesday`;
            }
        } else {
            weekNum = Math.floor((litSundayOf(d) - +firstSundayLent) / MS_PER_WEEK) + 1;
            dayLabel = isSunday
                ? (sw ? `Dominika ya ${weekNum} ya Kwaresima` : `${ordinal(weekNum)} Sunday of Lent`)
                : (sw ? `${weekdayName}, Juma la ${weekNum} la Kwaresima` : `${weekdayName} of the ${ordinal(weekNum)} Week of Lent`);
        }
    } else if (d <= pentecost) {
        season = 'Easter';
        color = 'white';
        weekNum = Math.floor((litSundayOf(d) - +easter) / MS_PER_WEEK) + 1;
        if (+d === +easter) {
            dayLabel = sw ? 'Dominika ya Pasaka' : 'Easter Sunday of the Resurrection of the Lord';
        } else if (+d === +pentecost) {
            dayLabel = sw ? 'Dominika ya Pentekoste' : 'Pentecost Sunday';
        } else {
            dayLabel = isSunday
                ? (sw ? `Dominika ya ${weekNum} ya Pasaka` : `${ordinal(weekNum)} Sunday of Easter`)
                : (sw ? `${weekdayName}, Juma la ${weekNum} la Pasaka` : `${weekdayName} of the ${ordinal(weekNum)} Week of Easter`);
        }
    } else {
        // Ordinary Time, part two: counted backwards from Christ the King (week 34)
        const christKing = litAddDays(advent1, -7);
        weekNum = 34 - Math.round((christKing - litSundayOf(d)) / MS_PER_WEEK);
        if (isSunday && +litSundayOf(d) === +christKing) {
            dayLabel = sw ? 'Sherehe ya Kristo Mfalme' : 'Our Lord Jesus Christ, King of the Universe';
        } else {
            dayLabel = isSunday
                ? (sw ? `Dominika ya ${weekNum} ya Mwaka` : `${ordinal(weekNum)} Sunday in Ordinary Time`)
                : (sw ? `${weekdayName}, Juma la ${weekNum} la Mwaka` : `${weekdayName} of the ${ordinal(weekNum)} Week in Ordinary Time`);
        }
    }

    // Psalter week for the Liturgy of the Hours: 4-week cycle tied to the
    // liturgical week number (week 1 → I, week 5 → I, etc.)
    const psalterWeek = weekNum ? ((weekNum - 1) % 4) + 1 : null;

    return { season, weekNum, dayLabel, color, psalterWeek, weekdayName };
}

// ---------------------------------------------------------------------------
// Celebration of the day: merges the fixed-date General Roman Calendar
// (LITURGICAL_FEASTS) with the movable solemnities and feasts computed from
// Easter and Advent. Ranks: Triduum > Solemnity > Feast > Memorial >
// Optional Memorial. Returns the highest-ranked celebration, or null on a
// plain ferial day.
// ---------------------------------------------------------------------------
const CELEBRATION_RANK = {
    'Triduum': 6, 'Solemnity': 5, 'Feast': 4, 'Special': 3,
    'Memorial': 2, 'Optional Memorial': 1
};

function getMovableCelebrations(year) {
    const easter = calculateEasterForFeasts(year);
    const advent1 = getAdventStart(year);
    const at = (base, offset) => +litAddDays(base, offset);

    // Holy Family: Sunday within the Christmas octave, or Dec 30 when
    // Christmas itself falls on a Sunday
    const xmas = new Date(year, 11, 25);
    const holyFamily = xmas.getDay() === 0
        ? new Date(year, 11, 30)
        : litAddDays(xmas, 7 - xmas.getDay());

    const list = [
        { time: at(easter, -46), name: 'Ash Wednesday', type: 'Special', color: 'purple' },
        { time: at(easter, -7),  name: 'Palm Sunday of the Passion of the Lord', type: 'Solemnity', color: 'red' },
        { time: at(easter, -3),  name: 'Holy Thursday (Mass of the Lord’s Supper)', type: 'Triduum', color: 'white' },
        { time: at(easter, -2),  name: 'Good Friday of the Lord’s Passion', type: 'Triduum', color: 'red' },
        { time: at(easter, -1),  name: 'Holy Saturday – Easter Vigil', type: 'Triduum', color: 'white' },
        { time: +easter,         name: 'Easter Sunday of the Resurrection of the Lord', type: 'Solemnity', color: 'white' },
        { time: at(easter, 7),   name: 'Divine Mercy Sunday', type: 'Solemnity', color: 'white' },
        { time: at(easter, 39),  name: 'Ascension of the Lord', type: 'Solemnity', color: 'white' },
        { time: at(easter, 49),  name: 'Pentecost Sunday', type: 'Solemnity', color: 'red' },
        { time: at(easter, 56),  name: 'The Most Holy Trinity', type: 'Solemnity', color: 'white' },
        { time: at(easter, 63),  name: 'The Most Holy Body and Blood of Christ (Corpus Christi)', type: 'Solemnity', color: 'white' },
        { time: at(easter, 68),  name: 'The Most Sacred Heart of Jesus', type: 'Solemnity', color: 'white' },
        { time: at(easter, 69),  name: 'The Immaculate Heart of Mary', type: 'Memorial', color: 'white' },
        { time: at(advent1, -7), name: 'Our Lord Jesus Christ, King of the Universe', type: 'Solemnity', color: 'white' },
        { time: +holyFamily,     name: 'The Holy Family of Jesus, Mary and Joseph', type: 'Feast', color: 'white' },
        { time: +getBaptismOfLord(year), name: 'The Baptism of the Lord', type: 'Feast', color: 'white' }
    ];

    // Easter octave days (Mon-Sat) are solemnities of the Lord
    for (let i = 1; i <= 6; i++) {
        list.push({
            time: at(easter, i),
            name: dayNameEn(litAddDays(easter, i)) + ' within the Octave of Easter',
            type: 'Solemnity', color: 'white'
        });
    }
    return list;
}

function dayNameEn(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getCelebrationForDate(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const candidates = [];

    const fixed = (LITURGICAL_FEASTS[d.getMonth()] || []).filter(f => f.date === d.getDate());
    fixed.forEach(f => candidates.push({ name: f.name, type: f.type, color: f.color, country: f.country || null }));

    getMovableCelebrations(d.getFullYear()).forEach(f => {
        if (f.time === +d) candidates.push({ name: f.name, type: f.type, color: f.color, country: null });
    });

    if (!candidates.length) return null;
    candidates.sort((a, b) => (CELEBRATION_RANK[b.type] || 0) - (CELEBRATION_RANK[a.type] || 0));
    return candidates[0];
}

// Expose for pages that consume this as a shared script
window.LiturgicalCalendar = {
    feasts: LITURGICAL_FEASTS,
    easterFor: calculateEasterForFeasts,
    today: getLiturgicalToday,
    celebrationFor: getCelebrationForDate
};
