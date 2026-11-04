// ---------------------------------------------------------------------------
// Masifu ya Asubuhi: the proper psalm antiphons of Feasts and Solemnities.
//
// On a Feast or Solemnity js/sikukuu.js gives every Morning Prayer page the
// psalms of Jumapili I (Zab. 63, Dan. 3, Zab. 149). This table gives those
// psalms the day's own antiphons in place of the Sunday ones. forDate()
// returns them only for the day the calendar (js/liturgical-calendar.js)
// keeps that celebration - a transferred solemnity on the day it is moved
// to - so on every other day the pages are unchanged.
//
// ANTIPHONS is keyed by the calendar's celebration id: 'MM-DD' for a fixed
// date, a name for a movable day. Each entry is one of
//   { source, antiphons: [Ant. 1, Ant. 2, Ant. 3] }
//   null        no text: the page keeps the Sunday antiphons
//   'other-id'  the same antiphons as that celebration
// In Eastertide "aleluya" is added to an antiphon that does not end with it,
// so the texts here are the ones said outside Eastertide wherever a feast
// can fall outside it.
//
// Sources: the Swahili breviary (docs/pdfs/MasifuYaAsubuhi.pdf) where it has
// the day; otherwise the English Morning Prayer of universalis.com (General
// Calendar) translated into Swahili, Scripture quoted as the Swahili Bible
// and the app's own breviary pages word it.
//
//   IPraySikukuuAntiphons.forDate(date[, calendar])
//       { id, name, rank, antiphons: [3 strings] } or null
//   IPraySikukuuAntiphons.ANTIPHONS   the table
// ---------------------------------------------------------------------------
(function () {
    'use strict';

    const BREVIARY = 'docs/pdfs/MasifuYaAsubuhi.pdf';
    const UNIVERSALIS = 'universalis.com (Kiingereza), imetafsiriwa';

    function translated(a1, a2, a3) {
        return { source: UNIVERSALIS, antiphons: [a1, a2, a3] };
    }

    // The Common of Apostles (Yn 15:12-14): Matthias, Bartholomew, Matthew,
    // Simon and Jude.
    const APOSTLES = translated(
        'Amri yangu ndiyo hii: mpendane kama nilivyowapenda ninyi.',
        'Hakuna mwenye upendo mkuu kuliko huu, mtu kuutoa uhai wake kwa ajili ya rafiki zake.',
        'Ninyi ni rafiki zangu, mkifanya ninayowaamuru, asema Bwana.'
    );

    // The evangelists Mark and Luke.
    const EVANGELISTS = translated(
        'Wainjili watakatifu waliitafuta hekima ya wazee wa kale: katika Injili zao waliuthibitisha unabii wa zamani.',
        'Kwa njia ya Injili, Mungu alituita tuiamini kweli, ili tuushiriki utukufu wa Bwana wetu Yesu Kristo.',
        'Wengi wataisifu hekima yao, wala haitasahauliwa kamwe.'
    );

    // 2 Tim. 1:12 and 1 Kor. 15:10, said on both feasts of St Paul.
    const PAUL_TRUST = 'Namjua yeye niliyemwamini, nami nimesadiki kwamba yeye, hakimu mwenye haki, aweza kukilinda kile nilichokabidhiwa hata Siku ile.';
    const PAUL_GRACE = 'Neema ya Mungu iliyo kwangu haikuwa bure; bali neema yake inakaa nami daima.';

    const ANTIPHONS = {
        // ---- Movable days -----------------------------------------------------
        'baptism': translated(
            'Askari anambatiza mfalme, mtumwa anambatiza Bwana wake, Yohane anambatiza Mwokozi wake. Maji ya Yordani yanastaajabu, njiwa anatokea kama ishara, sauti ya Baba inatangaza: \'Huyu ndiye Mwanangu.\'',
            'Chemchemi za maji zilitakaswa Kristo alipotokea duniani. Tekeni maji katika visima vya Mwokozi: Kristo Mungu wetu amevitakasa viumbe vyote.',
            'Uliiondoa dhambi ya wanadamu kwa Roho Mtakatifu na kwa moto: tunakusifu na kukuabudu, wewe Mungu na Mkombozi.'
        ),
        'easter': translated(
            'Kristo amefufuka: yeye ndiye nuru ya watu wake, aliowakomboa kwa damu yake, aleluya.',
            'Kristo, Mkombozi wetu, amefufuka kutoka kaburini: tumwimbie Bwana, Mungu wetu, utenzi wa sifa, aleluya.',
            'Aleluya. Bwana amefufuka kama alivyoahidi, aleluya.'
        ),
        'easter-octave': 'easter', // Oktava ya Pasaka: the antiphons of Easter Sunday
        'ascension': translated(
            'Enyi watu wa Galilaya, mbona mnasimama mkitazama mbinguni? Huyu Yesu aliyechukuliwa kutoka kwenu kwenda juu mbinguni atakuja jinsi hiyo hiyo mlivyomwona akienda, aleluya.',
            'Mtukuzeni Mfalme wa wafalme; mwimbieni Mungu sifa, aleluya.',
            'Walipokuwa wakitazama, aliinuliwa juu, na wingu likampokea kutoka machoni pao kwenda mbinguni, aleluya.'
        ),
        'pentecost': translated(
            'Ee Bwana, jinsi alivyo mwema na mpole Roho wako aliye ndani yetu! Aleluya.',
            'Kila chemchemi ya maji imhimidi Bwana; kila kiumbe kiishicho majini kimwimbie Mungu utenzi, aleluya.',
            'Mitume walinena kwa lugha mbalimbali, wakatangaza matendo makuu ya Mungu, aleluya.'
        ),
        'trinity': {
            source: BREVIARY + ', Sherehe za Bwana: Utatu Mtakatifu',
            antiphons: [
                'Enzi yote na nguvu, utukufu na heshima, sifa na ibada ni mali yako, Ee Utatu Mtakatifu, daima na milele.',
                'Viumbe vyako vyote kwa haki vinakusifu, vinakuabudu na kukuheshimu, Ee Utatu Mtakatifu.',
                'Vitu vyote vimetoka kwake, vimeumbwa kwa njia yake, na vimo ndani yake: atukuzwe milele.'
            ]
        },
        'corpus-christi': {
            source: BREVIARY + ', Sherehe za Bwana: Mwili na Damu ya Kristo',
            antiphons: [
                'Watu wako wanakula chakula cha malaika, unawapa mkate utokao mbinguni, aleluya.',
                'Makuhani huwekwa wakf ili wamtolee Mungu ubani na mkate, aleluya.',
                'Atakayeshinda nitampa manna iliyofichika, na jina jipya, aleluya.'
            ]
        },
        'sacred-heart': {
            source: BREVIARY + ', Sherehe za Bwana: Moyo Mtakatifu wa Yesu',
            antiphons: [
                'Yesu akasimama na kusema kwa sauti kubwa: \'Aonaye kiu, na aje kwangu anywe.\'',
                'Njooni kwangu, ninyi nyote mnaosumbuka na kulemewa na mizigo, nami nitawapumzisha.',
                'Mwanangu, nipe moyo wako, uzingatie ushauri wangu.'
            ]
        },
        'christ-the-king': {
            source: BREVIARY + ', Jumapili la 34: Kristo Mfalme',
            antiphons: [
                'Tazameni, mtu ambaye jina lake ni \'Jua Lichomozalo\'; atakalia kiti cha enzi na kutawala vyote; atayatangazia mataifa amani.',
                'Atatukuzwa duniani kote, na yeye mwenyewe atakuwa amani.',
                'Bwana amempa mamlaka, heshima na ufalme; kila kabila na taifa, na watu wote watamwabudu.'
            ]
        },
        'holy-family': translated(
            'Kila mwaka wazazi wa Yesu walikwenda Yerusalemu kwa sikukuu ya Pasaka.',
            'Mtoto akakua, akaongezeka nguvu, akajaa hekima; na neema ya Mungu ilikuwa juu yake.',
            'Baba yake na mama yake walikuwa wakiyastaajabia maneno yaliyonenwa juu yake.'
        ),

        // ---- Fixed dates --------------------------------------------------------
        '01-01': translated( // Maria Mtakatifu, Mama wa Mungu
            'Chipukizi limechipuka kutoka shina la Yese; nyota imezuka kutoka kwa Yakobo: Bikira amemzaa Mwokozi. Tunakusifu, Ee Mungu wetu.',
            'Maria amemzaa Mwokozi wetu. Yohane alipomwona alipaza sauti: \'Tazama, Mwanakondoo wa Mungu aondoaye dhambi za ulimwengu.\' Aleluya.',
            'Maria amemzaa mfalme ambaye jina lake ni la milele: ameunganisha furaha ya mama na heshima ya bikira. Jambo kama hili halijatokea kamwe, wala halitatokea tena, aleluya.'
        ),
        '01-06': translated( // Epifania ya Bwana
            'Mamajusi walifungua hazina zao, wakamtolea Bwana zawadi: dhahabu, uvumba na manemane, aleluya.',
            'Bahari na mito, mhimidini Bwana; chemchemi za maji, msifuni Bwana, aleluya.',
            'Ee Yerusalemu, nuru yako imekuja, na utukufu wa Bwana umekuzukia: mataifa watatembea katika nuru yako, aleluya.'
        ),
        '01-25': translated( // Kuongoka kwa Mt. Paulo
            PAUL_TRUST,
            'Neema yangu yakutosha, Paulo; maana uweza wangu hutimilika katika udhaifu.',
            PAUL_GRACE
        ),
        '02-02': translated( // Kutolewa kwa Bwana Hekaluni
            'Simeoni alikuwa mtu mwenye haki na mcha Mungu. Alikuwa akiutarajia ukombozi wa Israeli, na Roho Mtakatifu alikuwa juu yake.',
            'Simeoni alimpokea mtoto mikononi mwake, akamshukuru Mungu na kumsifu.',
            'Nuru ya kuwa mwangaza wa mataifa, na utukufu wa watu wako Israeli.'
        ),
        '02-22': translated( // Kiti cha Mt. Petro
            'Bwana alimwambia Simoni: \'Usiogope; tangu sasa utakuwa mvuvi wa watu.\'',
            '\'Wewe ndiwe Kristo, Mwana wa Mungu aliye hai.\' \'Heri wewe, Simoni Petro.\'',
            'Bwana alimwambia Petro: \'Nitakupa wewe funguo za ufalme wa mbinguni.\''
        ),
        '03-19': translated( // Mt. Yosefu
            'Wachungaji walikwenda kwa haraka, wakawakuta Maria na Yosefu, na mtoto amelala horini.',
            'Yosefu na Maria, mama yake Yesu, walistaajabia maneno yaliyonenwa juu yake, naye Simeoni akawabariki.',
            'Yosefu aliamka usingizini, akamchukua mtoto na mama yake usiku ule, akaenda Misri, akakaa huko hadi kifo cha Herode.'
        ),
        '03-25': translated( // Kupashwa Habari kwa Bwana
            'Malaika Gabrieli alitumwa kwa Bikira Maria, aliyekuwa ameposwa na Yosefu.',
            'Umebarikiwa wewe kuliko wanawake wote, naye mzao wa tumbo lako amebarikiwa.',
            'Kwa neno lake Bikira alichukua mimba; alidumu bikira; akiwa bikira alimzaa Mwokozi.'
        ),
        '04-25': EVANGELISTS, // Mt. Marko
        '05-03': translated( // Wat. Filipo na Yakobo (always in Eastertide)
            'Bwana, utuonyeshe Baba, nasi tutatosheka, aleluya.',
            'Je, nimekaa nanyi muda wote huu, nawe hujanijua? Filipo, aliyeniona mimi amemwona Baba, aleluya.',
            'Msifadhaike mioyoni mwenu; mwaminini Mungu, niaminini na mimi pia. Nyumbani mwa Baba yangu mna makao mengi, aleluya.'
        ),
        '05-14': APOSTLES, // Mt. Mathia
        '05-31': translated( // Bikira Maria Kumtembelea Elisabeti
            'Maria aliondoka, akaenda kwa haraka hadi nchi ya milimani, mpaka mji mmoja wa Yuda.',
            'Elisabeti aliposikia salamu ya Maria, mtoto aliyekuwa tumboni mwake aliruka kwa furaha, naye akajazwa Roho Mtakatifu.',
            'Heri wewe, Maria, uliyeamini; kwa kuwa yote uliyoambiwa na Bwana yatatimizwa.'
        ),
        '06-24': translated( // Kuzaliwa kwa Mt. Yohane Mbatizaji
            'Jina lake ataitwa Yohane: wengi watafurahi kwa kuzaliwa kwake.',
            'Atamtangulia Bwana Mungu katika roho na nguvu ya Eliya, ili kumwandalia Bwana watu wanaomfaa.',
            'Nawe, mtoto, utaitwa nabii wa Mungu Aliye Juu; utamtangulia Bwana kumtayarishia njia yake.'
        ),
        '06-29': translated( // Wat. Petro na Paulo
            PAUL_TRUST,
            PAUL_GRACE,
            'Nimevipiga vita vilivyo vizuri; mwendo nimeumaliza; imani nimeilinda.'
        ),
        '07-03': translated( // Mt. Thoma
            'Thoma alisema: \'Bwana, hatujui uendako; basi twaijuaje njia?\' Yesu akamwambia: \'Mimi ndimi njia, na kweli, na uzima.\'',
            'Thoma, aitwaye Pacha, hakuwako pamoja nao Yesu alipokuja. Wanafunzi wengine wakamwambia: \'Tumemwona Bwana, aleluya.\'',
            'Lete mkono wako hapa, uone alama za misumari. Usiwe na shaka tena, bali uamini, aleluya.'
        ),
        '07-22': translated( // Mt. Maria Magdalena
            'Alfajiri na mapema siku ya kwanza ya juma, jua lilipokuwa likichomoza, Maria Magdalena alifika kaburini.',
            'Moyo wangu unawaka; natamani kumwona Bwana wangu; namtafuta, lakini sijui walikomweka, aleluya.',
            'Maria alikuwa akilia, akainama kuchungulia kaburini: akaona malaika wawili wenye mavazi meupe yanayong\'aa, aleluya.'
        ),
        '07-25': translated( // Mt. Yakobo
            'Yesu alipokuwa akipita, alimwona Yakobo, mwana wa Zebedayo, na Yohane nduguye, akawaita wote wawili.',
            'Mara wakaziacha nyavu zao na baba yao, wakamfuata.',
            'Kikombe nitakachokinywea mimi mtakinywea, na ubatizo nitakaobatizwa mimi mtabatizwa.'
        ),
        '08-06': translated( // Kugeuka Sura kwa Bwana
            'Leo Yesu Kristo amegeuka sura: uso wake ukang\'aa kama jua, na mavazi yake yakawa meupe kama theluji.',
            'Leo Bwana amegeuka sura, na sauti ya Baba ikamshuhudia. Musa na Eliya walitokea pamoja naye katika utukufu, wakizungumza naye juu ya kifo atakachokitimiza.',
            'Torati ilitolewa kwa Musa, unabii kwa Eliya: wote wawili walionekana katika utukufu, wakiang\'aa pamoja na Bwana mlimani.'
        ),
        '08-10': translated( // Mt. Laurenti
            'Roho yangu ina kiu nawe, Ee Mungu wangu, kwa kuwa mwili wangu uliteketezwa motoni kwa ajili yako.',
            'Bwana alimtuma malaika wake kuniokoa motoni, nami sikuungua.',
            'Mtakatifu Laurenti alisali akisema: \'Nakushukuru, Ee Bwana, kwa kuwa umenistahilisha kuingia malango yako.\''
        ),
        '08-15': translated( // Kupalizwa Mbinguni kwa Bikira Maria
            'Heri wewe, Ee Maria, kwa kuwa kwa njia yako wokovu umeufikia ulimwengu. Sasa uko katika utukufu, na unafurahi mbele ya Bwana.',
            'Bikira Maria ametukuzwa juu ya majeshi ya malaika. Waamini wote wafurahi na kumhimidi Bwana.',
            'Jina lako limetukuzwa sana na Bwana, hata sifa zako hazitakoma kamwe vinywani mwa watu.'
        ),
        '08-24': APOSTLES, // Mt. Bartolomayo
        '09-08': translated( // Kuzaliwa kwa Bikira Maria
            'Leo ni siku ya kuzaliwa kwa Bikira Maria mtukufu, wa uzao wa Abrahamu, aliyetoka kabila la Yuda na ukoo wa Daudi.',
            'Bikira mtakatifu alipozaliwa, ulimwengu ulijaa mwanga. Heri na mtakatifu ni ukoo uliozaa tunda lenye baraka hivi.',
            'Kwa furaha tuadhimishe kuzaliwa kwa Maria mwenye heri, ili atuombee kwa Bwana Yesu Kristo.'
        ),
        '09-14': translated( // Kutukuzwa kwa Msalaba Mtakatifu
            'Yeye aliyeteswa msalabani aliivunja nguvu ya kuzimu. Siku ya tatu alifufuka, akajivika uweza.',
            'Msalaba mtakatifu unang\'aa kwa utukufu. Bwana alitundikwa juu yake ili kuyaosha majeraha yetu kwa damu yake.',
            'Msalaba mtakatifu unatuangazia. Katika msalaba mna ushindi, katika msalaba mna nguvu; kwa msalaba kila dhambi imeshindwa, aleluya.'
        ),
        '09-21': APOSTLES, // Mt. Mathayo
        '09-29': translated( // Malaika Wakuu
            'Tumsifu Bwana pamoja na malaika. \'Mtakatifu, mtakatifu, mtakatifu\' ndio wimbo wa makerubi na maserafi.',
            'Enyi malaika wa Bwana, mshukuruni milele.',
            'Bwana mtakatifu, malaika wote mbinguni wanakutukuza: kwa sauti moja wanasema: \'Wewe wastahili sifa zetu, Ee Mungu.\''
        ),
        '10-18': EVANGELISTS, // Mt. Luka
        '10-28': APOSTLES, // Wat. Simoni na Yuda
        '11-01': translated( // Watakatifu Wote
            'Watakatifu watakaa katika ufalme wa mbinguni; amani yao itadumu milele, aleluya.',
            'Enyi watakatifu wa Bwana, mhimidini Bwana milele!',
            'Yeye ni sifa ya watakatifu wake wote, ya wana wa Israeli, watu anaowakaribia.'
        ),
        // Marehemu Wote: Morning Prayer of the Office of the Dead has its own
        // psalms (Zab. 51, Isa. 38, Zab. 146), not those of Jumapili I, so
        // its antiphons cannot go on the Sunday psalms.
        '11-02': null,
        '11-09': translated( // Kutabarukiwa kwa Basilika ya Laterani
            'Nyumba yangu itaitwa nyumba ya sala.',
            'Uhimidiwe, Ee Bwana, katika hekalu lako takatifu.',
            'Msifuni Bwana katika Kanisa lake takatifu.'
        ),
        '11-30': translated( // Mt. Andrea
            'Andrea, ndugu yake Simoni Petro, alikuwa mmoja wa wale wawili waliomfuata Bwana.',
            'Bwana alimpenda Andrea: alimpokea kama sadaka yenye harufu nzuri.',
            'Andrea alimwambia Simoni nduguye: \'Tumemwona Masiya,\' akampeleka kwa Yesu.'
        ),
        '12-08': translated( // Bikira Maria Mkingiwa Dhambi ya Asili
            'Tazama, Mama safi asiye na doa; alichaguliwa kuwa Mama wa Mungu.',
            'Heri wewe, Ee Bikira Maria, kuliko wanawake wote duniani; Bwana Mungu mwenyewe amekuchagua.',
            'Harufu ya manukato yako ni nzuri, Ee Bikira mkingiwa dhambi; tuzifuate nyayo zako.'
        ),
        '12-25': translated( // Kuzaliwa kwa Bwana
            'Enyi wachungaji, tuambieni mmemwona nani! Ni nani aliyetokea duniani? \'Tumemwona mtoto aliyezaliwa, na tumesikia majeshi ya malaika wakimsifu Bwana, aleluya.\'',
            'Malaika aliwaambia wachungaji: \'Nawaletea habari njema ya furaha kuu: leo amezaliwa kwa ajili yenu Mwokozi wa ulimwengu, aleluya.\'',
            'Leo mtoto amezaliwa kwa ajili yetu; naye ataitwa jina lake \'Mungu mwenye nguvu,\' aleluya.'
        ),
        '12-26': translated( // Mt. Stefano
            'Roho yangu inaambatana nawe, Ee Mungu wangu: kwa ajili yako mwili wangu ulipigwa mawe.',
            'Stefano aliona mbingu zimefunguka, akaingia humo. Heri mtu yule ambaye mbingu zilifunguka kwa ajili yake.',
            'Tazama, naziona mbingu zimefunguka, na Yesu amesimama mkono wa kuume wa Mungu.'
        ),
        '12-27': translated( // Mt. Yohane, Mtume na Mwinjili
            'Yohane, mtume na mwinjili, alichaguliwa na Bwana kwa sababu ya usafi wake wa kibikira; yeye ndiye mwanafunzi aliyependwa na Bwana kwa namna ya pekee.',
            'Huyu ndiye Yohane, bikira ambaye Kristo, alipokuwa akifa msalabani, alimkabidhi Mama yake, Bikira Maria.',
            'Mwanafunzi yule aliyependwa na Yesu alisema: \'Ni Bwana,\' aleluya.'
        ),
        '12-28': translated( // Watoto Wafiadini
            'Watatembea pamoja nami wakiwa wamevaa mavazi meupe, asema Bwana, kwa kuwa wanastahili.',
            'Watoto wanamwimbia Mungu sifa; katika kifo chao wanahubiri yale ambayo vinywa vyao vichanga havikuweza kuyatamka.',
            'Kwa vinywa vya watoto wachanga na wanyonyao umejiwekea sifa, ili kumshinda adui yako.'
        )
    };

    // The entry for a celebration id, following an alias; null when there
    // is no text for it.
    function entryFor(id) {
        let entry = ANTIPHONS[id];
        if (typeof entry === 'string') entry = ANTIPHONS[entry];
        return entry && Array.isArray(entry.antiphons) && entry.antiphons.length === 3 ? entry : null;
    }

    function withAlleluia(text) {
        if (/aleluya[.!]?['’"”]?\s*$/i.test(text)) return text;
        return text.replace(/[\s.;:,]+$/, '') + ', aleluya.';
    }

    // The proper psalm antiphons for `date`, or null when that day is not a
    // Feast or Solemnity with antiphons in the table.
    function forDate(date, calendar) {
        const cal = calendar || (typeof window !== 'undefined' ? window.LiturgicalCalendar : null);
        if (!date || !cal || typeof cal.celebrationFor !== 'function') return null;
        const celebration = cal.celebrationFor(date, 'sw');
        if (!celebration || (celebration.type !== 'Feast' && celebration.type !== 'Solemnity')) return null;
        const entry = entryFor(celebration.id);
        if (!entry) return null;
        const eastertide = typeof cal.today === 'function' && cal.today(date).season === 'Easter';
        return {
            id: celebration.id,
            name: celebration.nameSw || celebration.name,
            rank: celebration.rankLabel || (celebration.type === 'Solemnity' ? 'Sherehe' : 'Sikukuu'),
            antiphons: entry.antiphons.map(function (a) { return eastertide ? withAlleluia(a) : a; })
        };
    }

    window.IPraySikukuuAntiphons = { ANTIPHONS: ANTIPHONS, forDate: forDate, withAlleluia: withAlleluia };
}());
