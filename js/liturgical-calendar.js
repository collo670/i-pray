// ---------------------------------------------------------------------------
// Shared liturgical calendar engine + General Roman Calendar data.
// Loaded before js/index.js on the main pages, and standalone by the
// Liturgy of the Hours pages.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Fixed-date celebrations of the General Roman Calendar, in English and
// Kiswahili (Swahili spellings follow the app's own breviary texts:
// Yohane, Augustino, Gregorio, Inyasio...). National-calendar entries (the
// US ones this list used to carry) are left out: the app follows the
// universal calendar.
// [month 1-12, day, type, colour, English, Kiswahili, extra]
// extra.lord marks feasts of the Lord, which replace a Sunday in Ordinary
// Time or Christmas Time; extra.level overrides the precedence level.
// ---------------------------------------------------------------------------
const FIXED_CELEBRATIONS = [
    [1, 1, 'Solemnity', 'white', 'Mary, Mother of God', 'Maria Mtakatifu, Mama wa Mungu'],
    [1, 2, 'Memorial', 'white', 'Basil the Great and Gregory Nazianzen', 'Mt. Basilio Mkuu na Mt. Gregorio wa Nazianzo'],
    [1, 3, 'Optional Memorial', 'white', 'Most Holy Name of Jesus', 'Jina Takatifu Kabisa la Yesu'],
    [1, 6, 'Solemnity', 'white', 'Epiphany of the Lord', 'Epifania ya Bwana', { level: 2 }],
    [1, 7, 'Optional Memorial', 'white', 'Raymond of Penyafort', 'Mt. Raimundo wa Penyafort'],
    [1, 13, 'Optional Memorial', 'white', 'Hilary of Poitiers', 'Mt. Hilari wa Poitiers'],
    [1, 17, 'Memorial', 'white', 'Anthony, Abbot', 'Mt. Antoni, abati'],
    [1, 20, 'Optional Memorial', 'red', 'Fabian or Sebastian', 'Mt. Fabiani au Mt. Sebastiani'],
    [1, 21, 'Memorial', 'red', 'Agnes, virgin and martyr', 'Mt. Agnes, bikira na shahidi'],
    [1, 22, 'Optional Memorial', 'red', 'Vincent, deacon and martyr', 'Mt. Vinsenti, shemasi na shahidi'],
    [1, 24, 'Memorial', 'white', 'Francis de Sales', 'Mt. Fransisko wa Sales'],
    [1, 25, 'Feast', 'white', 'Conversion of Saint Paul, Apostle', 'Kuongoka kwa Mt. Paulo, Mtume'],
    [1, 26, 'Memorial', 'white', 'Timothy and Titus', 'Wat. Timotheo na Tito, maaskofu'],
    [1, 27, 'Optional Memorial', 'white', 'Angela Merici', 'Mt. Angela Merici'],
    [1, 28, 'Memorial', 'white', 'Thomas Aquinas', 'Mt. Thoma wa Akwino'],
    [1, 31, 'Memorial', 'white', 'John Bosco', 'Mt. Yohane Bosko'],

    [2, 2, 'Feast', 'white', 'Presentation of the Lord', 'Kutolewa kwa Bwana Hekaluni', { lord: true }],
    [2, 3, 'Optional Memorial', 'red', 'Blaise or Ansgar', 'Mt. Blasio au Mt. Ansgari'],
    [2, 5, 'Memorial', 'red', 'Agatha, virgin and martyr', 'Mt. Agata, bikira na shahidi'],
    [2, 6, 'Memorial', 'red', 'Paul Miki and companions', 'Wat. Paulo Miki na wenzake, wafiadini'],
    [2, 8, 'Optional Memorial', 'white', 'Jerome Emiliani or Josephine Bakhita', 'Mt. Yeronimo Emiliani au Mt. Josefina Bakhita'],
    [2, 10, 'Memorial', 'white', 'Scholastica', 'Mt. Skolastika, bikira'],
    [2, 11, 'Optional Memorial', 'white', 'Our Lady of Lourdes', 'Bikira Maria wa Lurdi'],
    [2, 14, 'Memorial', 'white', 'Cyril and Methodius', 'Wat. Sirilo na Metodio'],
    [2, 17, 'Optional Memorial', 'white', 'Seven Holy Founders of the Servite Order', 'Waanzilishi Saba Watakatifu wa Shirika la Watumishi wa Maria'],
    [2, 21, 'Optional Memorial', 'white', 'Peter Damian', 'Mt. Petro Damiani'],
    [2, 22, 'Feast', 'white', 'Chair of Saint Peter, Apostle', 'Kiti cha Mt. Petro, Mtume'],
    [2, 23, 'Memorial', 'red', 'Polycarp', 'Mt. Polikarpo, askofu na shahidi'],
    [2, 27, 'Optional Memorial', 'white', 'Gregory of Narek', 'Mt. Gregorio wa Nareki'],

    [3, 4, 'Optional Memorial', 'white', 'Casimir', 'Mt. Kasimiri'],
    [3, 7, 'Memorial', 'red', 'Perpetua and Felicity', 'Wat. Perpetua na Felisita, wafiadini'],
    [3, 8, 'Optional Memorial', 'white', 'John of God', 'Mt. Yohane wa Mungu'],
    [3, 9, 'Optional Memorial', 'white', 'Frances of Rome', 'Mt. Fransiska wa Roma'],
    [3, 17, 'Optional Memorial', 'white', 'Patrick', 'Mt. Patrisi, askofu'],
    [3, 18, 'Optional Memorial', 'white', 'Cyril of Jerusalem', 'Mt. Sirilo wa Yerusalemu'],
    [3, 19, 'Solemnity', 'white', 'Joseph, Spouse of the Blessed Virgin Mary', 'Mt. Yosefu, Mume wa Bikira Maria'],
    [3, 23, 'Optional Memorial', 'white', 'Turibius of Mogrovejo', 'Mt. Toribio wa Mogrovejo'],
    [3, 25, 'Solemnity', 'white', 'Annunciation of the Lord', 'Kupashwa Habari kwa Bwana'],

    [4, 2, 'Optional Memorial', 'white', 'Francis of Paola', 'Mt. Fransisko wa Paola'],
    [4, 4, 'Optional Memorial', 'white', 'Isidore', 'Mt. Isidori, askofu'],
    [4, 5, 'Optional Memorial', 'white', 'Vincent Ferrer', 'Mt. Vinsenti Fereri'],
    [4, 7, 'Memorial', 'white', 'John Baptist de la Salle', 'Mt. Yohane Baptista wa La Salle'],
    [4, 11, 'Memorial', 'red', 'Stanislaus', 'Mt. Stanislaus, askofu na shahidi'],
    [4, 13, 'Optional Memorial', 'red', 'Martin I', 'Mt. Martino I, papa na shahidi'],
    [4, 21, 'Optional Memorial', 'white', 'Anselm', 'Mt. Anselmo'],
    [4, 23, 'Optional Memorial', 'red', 'George or Adalbert', 'Mt. Georgi au Mt. Adalberti'],
    [4, 24, 'Optional Memorial', 'red', 'Fidelis of Sigmaringen', 'Mt. Fideli wa Sigmaringen'],
    [4, 25, 'Feast', 'red', 'Mark the Evangelist', 'Mt. Marko, Mwinjili'],
    [4, 28, 'Optional Memorial', 'red', 'Peter Chanel or Louis Grignion de Montfort', 'Mt. Petro Chaneli au Mt. Ludoviko wa Montfort'],
    [4, 29, 'Memorial', 'white', 'Catherine of Siena', 'Mt. Katarina wa Siena'],
    [4, 30, 'Optional Memorial', 'white', 'Pius V', 'Mt. Pio V, papa'],

    [5, 1, 'Optional Memorial', 'white', 'Joseph the Worker', 'Mt. Yosefu Mfanyakazi'],
    [5, 2, 'Memorial', 'white', 'Athanasius', 'Mt. Atanasio'],
    [5, 3, 'Feast', 'red', 'Philip and James, Apostles', 'Wat. Filipo na Yakobo, Mitume'],
    [5, 10, 'Optional Memorial', 'white', 'John of Avila', 'Mt. Yohane wa Avila'],
    [5, 12, 'Optional Memorial', 'red', 'Nereus and Achilleus or Pancras', 'Wat. Nereo na Akile au Mt. Pankrasi'],
    [5, 13, 'Optional Memorial', 'white', 'Our Lady of Fatima', 'Bikira Maria wa Fatima'],
    [5, 14, 'Feast', 'red', 'Matthias, Apostle', 'Mt. Mathia, Mtume'],
    [5, 18, 'Optional Memorial', 'red', 'John I', 'Mt. Yohane I, papa na shahidi'],
    [5, 20, 'Optional Memorial', 'white', 'Bernardine of Siena', 'Mt. Bernardino wa Siena'],
    [5, 21, 'Optional Memorial', 'red', 'Christopher Magallanes and companions', 'Mt. Kristofa Magallanes na wenzake'],
    [5, 22, 'Optional Memorial', 'white', 'Rita of Cascia', 'Mt. Rita wa Kashia'],
    [5, 25, 'Optional Memorial', 'white', 'Bede, Gregory VII or Mary Magdalene de’ Pazzi', 'Mt. Beda, Mt. Gregorio VII au Mt. Maria Magdalena wa Pazzi'],
    [5, 26, 'Memorial', 'white', 'Philip Neri', 'Mt. Filipo Neri'],
    [5, 27, 'Optional Memorial', 'white', 'Augustine of Canterbury', 'Mt. Augustino wa Kanterburi'],
    [5, 29, 'Optional Memorial', 'white', 'Paul VI', 'Mt. Paulo VI, papa'],
    [5, 31, 'Feast', 'white', 'Visitation of the Blessed Virgin Mary', 'Bikira Maria Kumtembelea Elisabeti'],

    [6, 1, 'Memorial', 'red', 'Justin, martyr', 'Mt. Yustino, shahidi'],
    [6, 2, 'Optional Memorial', 'red', 'Marcellinus and Peter', 'Wat. Marselino na Petro, wafiadini'],
    [6, 3, 'Memorial', 'red', 'Charles Lwanga and companions', 'Wat. Karoli Lwanga na wenzake, Wafiadini wa Uganda'],
    [6, 5, 'Memorial', 'red', 'Boniface', 'Mt. Bonifasi, askofu na shahidi'],
    [6, 6, 'Optional Memorial', 'white', 'Norbert', 'Mt. Norberti, askofu'],
    [6, 9, 'Optional Memorial', 'white', 'Ephrem', 'Mt. Efremu'],
    [6, 11, 'Memorial', 'red', 'Barnabas, Apostle', 'Mt. Barnaba, Mtume'],
    [6, 13, 'Memorial', 'white', 'Anthony of Padua', 'Mt. Antoni wa Padua'],
    [6, 19, 'Optional Memorial', 'white', 'Romuald', 'Mt. Romualdo, abati'],
    [6, 21, 'Memorial', 'white', 'Aloysius Gonzaga', 'Mt. Aloisi Gonzaga'],
    [6, 22, 'Optional Memorial', 'red', 'Paulinus of Nola, or John Fisher and Thomas More', 'Mt. Paulino wa Nola, au Wat. Yohane Fisher na Thoma More'],
    [6, 24, 'Solemnity', 'white', 'Nativity of Saint John the Baptist', 'Kuzaliwa kwa Mt. Yohane Mbatizaji'],
    [6, 27, 'Optional Memorial', 'white', 'Cyril of Alexandria', 'Mt. Sirilo wa Aleksandria'],
    [6, 28, 'Memorial', 'red', 'Irenaeus', 'Mt. Ireneo, askofu na shahidi'],
    [6, 29, 'Solemnity', 'red', 'Peter and Paul, Apostles', 'Wat. Petro na Paulo, Mitume'],
    [6, 30, 'Optional Memorial', 'red', 'First Martyrs of the Holy Roman Church', 'Wafiadini wa Kwanza wa Kanisa la Roma'],

    [7, 3, 'Feast', 'red', 'Thomas, Apostle', 'Mt. Thoma, Mtume'],
    [7, 4, 'Optional Memorial', 'white', 'Elizabeth of Portugal', 'Mt. Elisabeti wa Ureno'],
    [7, 5, 'Optional Memorial', 'white', 'Anthony Zaccaria', 'Mt. Antoni Maria Zakaria'],
    [7, 6, 'Optional Memorial', 'red', 'Maria Goretti', 'Mt. Maria Goretti, bikira na shahidi'],
    [7, 9, 'Optional Memorial', 'red', 'Augustine Zhao Rong and companions', 'Mt. Augustino Zhao Rong na wenzake'],
    [7, 11, 'Memorial', 'white', 'Benedict', 'Mt. Benedikto, abati'],
    [7, 13, 'Optional Memorial', 'white', 'Henry', 'Mt. Henriko'],
    [7, 14, 'Optional Memorial', 'white', 'Camillus de Lellis', 'Mt. Kamili wa Lellis'],
    [7, 15, 'Memorial', 'white', 'Bonaventure', 'Mt. Bonaventura'],
    [7, 16, 'Optional Memorial', 'white', 'Our Lady of Mount Carmel', 'Bikira Maria wa Mlima Karmeli'],
    [7, 20, 'Optional Memorial', 'red', 'Apollinaris', 'Mt. Apolinari, askofu na shahidi'],
    [7, 21, 'Optional Memorial', 'white', 'Lawrence of Brindisi', 'Mt. Laurenti wa Brindisi'],
    [7, 22, 'Feast', 'white', 'Mary Magdalene', 'Mt. Maria Magdalena'],
    [7, 23, 'Optional Memorial', 'white', 'Bridget', 'Mt. Brigita'],
    [7, 24, 'Optional Memorial', 'white', 'Sharbel Makhluf', 'Mt. Sharbeli Makhlufi'],
    [7, 25, 'Feast', 'red', 'James, Apostle', 'Mt. Yakobo, Mtume'],
    [7, 26, 'Memorial', 'white', 'Joachim and Anne', 'Wat. Yoakimu na Ana, wazazi wa Bikira Maria'],
    [7, 29, 'Memorial', 'white', 'Martha, Mary and Lazarus', 'Wat. Marta, Maria na Lazaro'],
    [7, 30, 'Optional Memorial', 'white', 'Peter Chrysologus', 'Mt. Petro Krisologo'],
    [7, 31, 'Memorial', 'white', 'Ignatius of Loyola', 'Mt. Inyasio wa Loyola'],

    [8, 1, 'Memorial', 'white', 'Alphonsus Liguori', 'Mt. Alfonsi Maria wa Liguori'],
    [8, 2, 'Optional Memorial', 'white', 'Eusebius of Vercelli or Peter Julian Eymard', 'Mt. Eusebio wa Verselli au Mt. Petro Yuliani Eymard'],
    [8, 4, 'Memorial', 'white', 'John Vianney', 'Mt. Yohane Maria Vianney'],
    [8, 5, 'Optional Memorial', 'white', 'Dedication of the Basilica of Saint Mary Major', 'Kutabarukiwa kwa Basilika ya Mt. Maria Mkuu'],
    [8, 6, 'Feast', 'white', 'Transfiguration of the Lord', 'Kugeuka Sura kwa Bwana', { lord: true }],
    [8, 7, 'Optional Memorial', 'red', 'Sixtus II and companions, or Cajetan', 'Mt. Sisto II na wenzake, au Mt. Kayetani'],
    [8, 8, 'Memorial', 'white', 'Dominic', 'Mt. Dominiko'],
    [8, 9, 'Optional Memorial', 'red', 'Teresa Benedicta of the Cross', 'Mt. Teresa Benedikta wa Msalaba'],
    [8, 10, 'Feast', 'red', 'Lawrence, deacon and martyr', 'Mt. Laurenti, shemasi na shahidi'],
    [8, 11, 'Memorial', 'white', 'Clare', 'Mt. Klara, bikira'],
    [8, 12, 'Optional Memorial', 'white', 'Jane Frances de Chantal', 'Mt. Yohana Fransiska wa Chantal'],
    [8, 13, 'Optional Memorial', 'red', 'Pontian and Hippolytus', 'Wat. Pontiani na Hipoliti, wafiadini'],
    [8, 14, 'Memorial', 'red', 'Maximilian Kolbe', 'Mt. Maksimiliani Kolbe'],
    [8, 15, 'Solemnity', 'white', 'Assumption of the Blessed Virgin Mary', 'Kupalizwa Mbinguni kwa Bikira Maria'],
    [8, 16, 'Optional Memorial', 'white', 'Stephen of Hungary', 'Mt. Stefano wa Hungaria'],
    [8, 19, 'Optional Memorial', 'white', 'John Eudes', 'Mt. Yohane Eudes'],
    [8, 20, 'Memorial', 'white', 'Bernard of Clairvaux', 'Mt. Bernardo wa Klervo'],
    [8, 21, 'Memorial', 'white', 'Pius X', 'Mt. Pio X, papa'],
    [8, 22, 'Memorial', 'white', 'Queenship of the Blessed Virgin Mary', 'Bikira Maria Malkia'],
    [8, 23, 'Optional Memorial', 'white', 'Rose of Lima', 'Mt. Roza wa Lima'],
    [8, 24, 'Feast', 'red', 'Bartholomew, Apostle', 'Mt. Bartolomayo, Mtume'],
    [8, 25, 'Optional Memorial', 'white', 'Louis or Joseph Calasanz', 'Mt. Ludoviko au Mt. Yosefu wa Kalasanzi'],
    [8, 27, 'Memorial', 'white', 'Monica', 'Mt. Monika'],
    [8, 28, 'Memorial', 'white', 'Augustine', 'Mt. Augustino'],
    [8, 29, 'Memorial', 'red', 'Passion of Saint John the Baptist', 'Kuuawa kwa Mt. Yohane Mbatizaji'],

    [9, 3, 'Memorial', 'white', 'Gregory the Great', 'Mt. Gregorio Mkuu, papa'],
    [9, 8, 'Feast', 'white', 'Nativity of the Blessed Virgin Mary', 'Kuzaliwa kwa Bikira Maria'],
    [9, 12, 'Optional Memorial', 'white', 'Most Holy Name of Mary', 'Jina Takatifu la Maria'],
    [9, 13, 'Memorial', 'white', 'John Chrysostom', 'Mt. Yohane Krisostomo'],
    [9, 14, 'Feast', 'red', 'Exaltation of the Holy Cross', 'Kutukuzwa kwa Msalaba Mtakatifu', { lord: true }],
    [9, 15, 'Memorial', 'white', 'Our Lady of Sorrows', 'Bikira Maria wa Mateso'],
    [9, 16, 'Memorial', 'red', 'Cornelius and Cyprian', 'Wat. Kornelio na Sipriani, wafiadini'],
    [9, 17, 'Optional Memorial', 'white', 'Robert Bellarmine or Hildegard of Bingen', 'Mt. Roberto Belarmino au Mt. Hildegarda wa Bingen'],
    [9, 19, 'Optional Memorial', 'red', 'Januarius', 'Mt. Yanuari, askofu na shahidi'],
    [9, 20, 'Memorial', 'red', 'Andrew Kim Tae-gon, Paul Chong Ha-sang and companions', 'Wat. Andrea Kim Tae-gon, Paulo Chong Ha-sang na wenzake'],
    [9, 21, 'Feast', 'red', 'Matthew, Apostle and Evangelist', 'Mt. Mathayo, Mtume na Mwinjili'],
    [9, 23, 'Memorial', 'white', 'Pius of Pietrelcina', 'Mt. Pio wa Pietrelcina'],
    [9, 26, 'Optional Memorial', 'red', 'Cosmas and Damian', 'Wat. Kosma na Damiani, wafiadini'],
    [9, 27, 'Memorial', 'white', 'Vincent de Paul', 'Mt. Vinsenti wa Paulo'],
    [9, 28, 'Optional Memorial', 'red', 'Wenceslaus, or Lawrence Ruiz and companions', 'Mt. Wenseslao, au Wat. Laurenti Ruiz na wenzake'],
    [9, 29, 'Feast', 'white', 'Michael, Gabriel and Raphael, Archangels', 'Malaika Wakuu Mikaeli, Gabrieli na Rafaeli'],
    [9, 30, 'Memorial', 'white', 'Jerome', 'Mt. Yeronimo'],

    [10, 1, 'Memorial', 'white', 'Thérèse of the Child Jesus', 'Mt. Teresa wa Mtoto Yesu'],
    [10, 2, 'Memorial', 'white', 'Guardian Angels', 'Malaika Walinzi'],
    [10, 4, 'Memorial', 'white', 'Francis of Assisi', 'Mt. Fransisko wa Asizi'],
    [10, 5, 'Optional Memorial', 'white', 'Faustina Kowalska', 'Mt. Faustina Kowalska'],
    [10, 6, 'Optional Memorial', 'white', 'Bruno', 'Mt. Bruno, padre'],
    [10, 7, 'Memorial', 'white', 'Our Lady of the Rosary', 'Bikira Maria wa Rozari'],
    [10, 9, 'Optional Memorial', 'red', 'Denis and companions, or John Leonardi', 'Mt. Dionisi na wenzake, au Mt. Yohane Leonardi'],
    [10, 11, 'Optional Memorial', 'white', 'John XXIII', 'Mt. Yohane XXIII, papa'],
    [10, 14, 'Optional Memorial', 'red', 'Callistus I', 'Mt. Kalisto I, papa na shahidi'],
    [10, 15, 'Memorial', 'white', 'Teresa of Jesus', 'Mt. Teresa wa Yesu'],
    [10, 16, 'Optional Memorial', 'white', 'Hedwig or Margaret Mary Alacoque', 'Mt. Hedwigi au Mt. Margarita Maria Alakok'],
    [10, 17, 'Memorial', 'red', 'Ignatius of Antioch', 'Mt. Inyasio wa Antiokia'],
    [10, 18, 'Feast', 'red', 'Luke the Evangelist', 'Mt. Luka, Mwinjili'],
    [10, 19, 'Optional Memorial', 'red', 'John de Brébeuf, Isaac Jogues and companions, or Paul of the Cross', 'Wat. Yohane wa Brébeuf, Isaka Jogues na wenzake, au Mt. Paulo wa Msalaba'],
    [10, 22, 'Optional Memorial', 'white', 'John Paul II', 'Mt. Yohane Paulo II, papa'],
    [10, 23, 'Optional Memorial', 'white', 'John of Capistrano', 'Mt. Yohane wa Kapistrano'],
    [10, 24, 'Optional Memorial', 'white', 'Anthony Mary Claret', 'Mt. Antoni Maria Klareti'],
    [10, 28, 'Feast', 'red', 'Simon and Jude, Apostles', 'Wat. Simoni na Yuda, Mitume'],

    [11, 1, 'Solemnity', 'white', 'All Saints', 'Watakatifu Wote'],
    [11, 2, 'Solemnity', 'purple', 'Commemoration of All the Faithful Departed', 'Kuwakumbuka Marehemu Wote'],
    [11, 3, 'Optional Memorial', 'white', 'Martin de Porres', 'Mt. Martino wa Porres'],
    [11, 4, 'Memorial', 'white', 'Charles Borromeo', 'Mt. Karoli Borromeo'],
    [11, 9, 'Feast', 'white', 'Dedication of the Lateran Basilica', 'Kutabarukiwa kwa Basilika ya Laterani', { lord: true }],
    [11, 10, 'Memorial', 'white', 'Leo the Great', 'Mt. Leo Mkuu, papa'],
    [11, 11, 'Memorial', 'white', 'Martin of Tours', 'Mt. Martino wa Tours'],
    [11, 12, 'Memorial', 'red', 'Josaphat', 'Mt. Yosafati, askofu na shahidi'],
    [11, 15, 'Optional Memorial', 'white', 'Albert the Great', 'Mt. Alberto Mkuu'],
    [11, 16, 'Optional Memorial', 'white', 'Margaret of Scotland or Gertrude', 'Mt. Margarita wa Skotlandi au Mt. Gertrude'],
    [11, 17, 'Memorial', 'white', 'Elizabeth of Hungary', 'Mt. Elisabeti wa Hungaria'],
    [11, 18, 'Optional Memorial', 'white', 'Dedication of the Basilicas of Saints Peter and Paul', 'Kutabarukiwa kwa Basilika za Mt. Petro na Mt. Paulo'],
    [11, 21, 'Memorial', 'white', 'Presentation of the Blessed Virgin Mary', 'Kutolewa kwa Bikira Maria Hekaluni'],
    [11, 22, 'Memorial', 'red', 'Cecilia, virgin and martyr', 'Mt. Sesilia, bikira na shahidi'],
    [11, 23, 'Optional Memorial', 'red', 'Clement I or Columban', 'Mt. Klemente I au Mt. Kolumbano'],
    [11, 24, 'Memorial', 'red', 'Andrew Dung-Lac and companions', 'Wat. Andrea Dung-Lac na wenzake, wafiadini'],
    [11, 25, 'Optional Memorial', 'red', 'Catherine of Alexandria', 'Mt. Katarina wa Aleksandria'],
    [11, 30, 'Feast', 'red', 'Andrew, Apostle', 'Mt. Andrea, Mtume'],

    [12, 3, 'Memorial', 'white', 'Francis Xavier', 'Mt. Fransisko Saveri'],
    [12, 4, 'Optional Memorial', 'white', 'John Damascene', 'Mt. Yohane wa Damasko'],
    [12, 6, 'Optional Memorial', 'white', 'Nicholas', 'Mt. Nikolasi, askofu'],
    [12, 7, 'Memorial', 'white', 'Ambrose', 'Mt. Ambrosio'],
    [12, 8, 'Solemnity', 'white', 'Immaculate Conception of the Blessed Virgin Mary', 'Bikira Maria Mkingiwa Dhambi ya Asili'],
    [12, 9, 'Optional Memorial', 'white', 'Juan Diego', 'Mt. Yohane Diego'],
    [12, 10, 'Optional Memorial', 'white', 'Our Lady of Loreto', 'Bikira Maria wa Loreto'],
    [12, 11, 'Optional Memorial', 'white', 'Damasus I', 'Mt. Damaso I, papa'],
    [12, 12, 'Optional Memorial', 'white', 'Our Lady of Guadalupe', 'Bikira Maria wa Guadalupe'],
    [12, 13, 'Memorial', 'red', 'Lucy, virgin and martyr', 'Mt. Lusia, bikira na shahidi'],
    [12, 14, 'Memorial', 'white', 'John of the Cross', 'Mt. Yohane wa Msalaba'],
    [12, 21, 'Optional Memorial', 'white', 'Peter Canisius', 'Mt. Petro Kanisio'],
    [12, 23, 'Optional Memorial', 'white', 'John of Kanty', 'Mt. Yohane wa Kanty'],
    [12, 25, 'Solemnity', 'white', 'Nativity of the Lord', 'Kuzaliwa kwa Bwana Wetu Yesu Kristo', { level: 2 }],
    [12, 26, 'Feast', 'red', 'Stephen, the first martyr', 'Mt. Stefano, shahidi wa kwanza'],
    [12, 27, 'Feast', 'white', 'John, Apostle and Evangelist', 'Mt. Yohane, Mtume na Mwinjili'],
    [12, 28, 'Feast', 'red', 'Holy Innocents', 'Watoto Wafiadini'],
    [12, 29, 'Optional Memorial', 'red', 'Thomas Becket', 'Mt. Thoma Becket, askofu na shahidi'],
    [12, 31, 'Optional Memorial', 'white', 'Sylvester I', 'Mt. Silvesta I, papa']
];

// The same data in the shape older code used: LITURGICAL_FEASTS[month0] is
// a list of { date, name, sw, type, color } for that month.
const LITURGICAL_FEASTS = {};
FIXED_CELEBRATIONS.forEach(function (row) {
    const month0 = row[0] - 1;
    (LITURGICAL_FEASTS[month0] = LITURGICAL_FEASTS[month0] || []).push({
        date: row[1], type: row[2], color: row[3], name: row[4], sw: row[5]
    });
});

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
// Celebrations of the day, following the Table of Liturgical Days
// (General Norms for the Liturgical Year, no. 59). Every day and every
// celebration gets a precedence level - the lower the number, the higher
// the rank:
//    1  Easter Triduum
//    2  Christmas, Epiphany, Ascension, Pentecost; Sundays of Advent, Lent
//       and Easter; Ash Wednesday; Monday-Wednesday of Holy Week; the
//       Easter octave
//    3  Solemnities; All Souls
//    5  Feasts of the Lord
//    6  Sundays of Christmas Time and Ordinary Time
//    7  Feasts of Mary and the saints
//    9  Weekdays of Lent, of Advent from 17 December, of the Christmas octave
//   10  Obligatory memorials
//   12  Optional memorials
//   13  Other weekdays
// A celebration is kept only if it outranks the day it falls on. On the
// "privileged weekdays" (level 9) a memorial can still be kept as a
// commemoration; on Sundays and the higher days it is simply not
// celebrated that year. Solemnities that are impeded are transferred.
// ---------------------------------------------------------------------------
const CELEBRATION_RANK = {
    'Triduum': 6, 'Solemnity': 5, 'Feast': 4, 'Special': 3,
    'Memorial': 2, 'Optional Memorial': 1, 'Commemoration': 0
};
const TYPE_LEVEL = { 'Solemnity': 3, 'Feast': 7, 'Memorial': 10, 'Optional Memorial': 12 };
const RANK_LABELS = {
    en: { 'Triduum': 'Sacred Triduum', 'Solemnity': 'Solemnity', 'Feast': 'Feast', 'Special': 'Liturgical Day', 'Memorial': 'Memorial', 'Optional Memorial': 'Optional Memorial', 'Commemoration': 'Commemoration' },
    sw: { 'Triduum': 'Siku Kuu Tatu Takatifu', 'Solemnity': 'Sherehe', 'Feast': 'Sikukuu', 'Special': 'Siku Maalum', 'Memorial': 'Kumbukumbu', 'Optional Memorial': 'Kumbukumbu ya Hiari', 'Commemoration': 'Ukumbusho' }
};
const SW_WEEKDAYS = ['Dominika', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function litDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Movable days of one calendar year, from Easter and Advent.
function getMovableCelebrations(year) {
    const easter = calculateEasterForFeasts(year);
    const advent1 = getAdventStart(year);
    const at = (base, offset) => litAddDays(base, offset);

    // Holy Family: the Sunday within the Christmas octave, or 30 December
    // when there is no such Sunday (Christmas on a Sunday).
    const xmas = new Date(year, 11, 25);
    const holyFamily = xmas.getDay() === 0 ? new Date(year, 11, 30) : litAddDays(xmas, 7 - xmas.getDay());

    const m = (date, type, color, name, sw, extra) => Object.assign({ date: litDay(date), type, color, name, sw }, extra || {});
    const list = [
        m(getBaptismOfLord(year), 'Feast', 'white', 'Baptism of the Lord', 'Ubatizo wa Bwana', { lord: true }),
        m(at(easter, -46), 'Special', 'purple', 'Ash Wednesday', 'Jumatano ya Majivu', { level: 2 }),
        m(at(easter, -21), 'Special', 'rose', 'Fourth Sunday of Lent (Laetare)', 'Dominika ya Nne ya Kwaresima (Laetare)', { level: 2 }),
        m(at(easter, -7), 'Special', 'red', 'Palm Sunday of the Passion of the Lord', 'Dominika ya Matawi', { level: 2 }),
        m(at(easter, -3), 'Triduum', 'white', 'Holy Thursday', 'Alhamisi Kuu', { level: 1 }),
        m(at(easter, -2), 'Triduum', 'red', 'Good Friday of the Passion of the Lord', 'Ijumaa Kuu', { level: 1 }),
        m(at(easter, -1), 'Triduum', 'white', 'Holy Saturday', 'Jumamosi Kuu', { level: 1 }),
        m(easter, 'Solemnity', 'white', 'Easter Sunday of the Resurrection of the Lord', 'Dominika ya Pasaka, Ufufuko wa Bwana', { level: 1 }),
        m(at(easter, 7), 'Special', 'white', 'Second Sunday of Easter (Divine Mercy)', 'Dominika ya Pili ya Pasaka (Huruma ya Mungu)', { level: 2 }),
        m(at(easter, 39), 'Solemnity', 'white', 'Ascension of the Lord', 'Kupaa kwa Bwana', { level: 2 }),
        m(at(easter, 49), 'Solemnity', 'red', 'Pentecost Sunday', 'Dominika ya Pentekoste', { level: 2 }),
        m(at(easter, 50), 'Memorial', 'white', 'Mary, Mother of the Church', 'Bikira Maria, Mama wa Kanisa'),
        m(at(easter, 56), 'Solemnity', 'white', 'The Most Holy Trinity', 'Utatu Mtakatifu'),
        m(at(easter, 63), 'Solemnity', 'white', 'The Most Holy Body and Blood of Christ', 'Mwili na Damu Takatifu Kabisa ya Kristo'),
        m(at(easter, 68), 'Solemnity', 'white', 'The Most Sacred Heart of Jesus', 'Moyo Mtakatifu Kabisa wa Yesu'),
        m(at(easter, 69), 'Memorial', 'white', 'The Immaculate Heart of Mary', 'Moyo Safi wa Bikira Maria'),
        m(at(advent1, -7), 'Solemnity', 'white', 'Our Lord Jesus Christ, King of the Universe', 'Yesu Kristo Mfalme wa Ulimwengu'),
        m(at(advent1, 14), 'Special', 'rose', 'Third Sunday of Advent (Gaudete)', 'Dominika ya Tatu ya Majilio (Gaudete)', { level: 2 }),
        m(holyFamily, 'Feast', 'white', 'The Holy Family of Jesus, Mary and Joseph', 'Familia Takatifu ya Yesu, Maria na Yosefu', { lord: true })
    ];
    for (let i = 1; i <= 6; i++) {
        const d = at(easter, i);
        list.push(m(d, 'Solemnity', 'white',
            EN_WEEKDAYS[d.getDay()] + ' within the Octave of Easter',
            SW_WEEKDAYS[d.getDay()] + ' katika Oktava ya Pasaka', { level: 2 }));
    }
    return list;
}

// Key dates of a year, computed once.
const yearCache = {};
function yearDates(year) {
    if (!yearCache[year]) {
        const easter = calculateEasterForFeasts(year);
        yearCache[year] = {
            easter: easter,
            ashWednesday: litAddDays(easter, -46),
            pentecost: litAddDays(easter, 49),
            christmas: new Date(year, 11, 25),
            advent1: getAdventStart(year),
            baptism: getBaptismOfLord(year)
        };
    }
    return yearCache[year];
}

function stampOf(d) {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Season only (getLiturgicalToday also builds labels, which is slower).
function seasonOf(d) {
    const y = yearDates(d.getFullYear());
    if (d >= y.advent1 && d < y.christmas) return 'Advent';
    if (d >= y.christmas || d <= y.baptism) return 'Christmas';
    if (d < y.ashWednesday) return 'Ordinary Time';
    if (d < y.easter) return 'Lent';
    if (d <= y.pentecost) return 'Easter';
    return 'Ordinary Time';
}

// Level of the day itself, before any celebration is placed on it.
const levelCache = {};
function seasonalLevel(d) {
    const key = stampOf(d);
    if (levelCache[key] !== undefined) return levelCache[key];
    const offset = Math.round((d - yearDates(d.getFullYear()).easter) / 86400000);
    const sunday = d.getDay() === 0;
    const season = seasonOf(d);
    let level = 13;
    if (offset >= -3 && offset <= 0) level = 1;                        // Triduum
    else if (offset === -46 || (offset >= -7 && offset <= -4)) level = 2; // Ash Wednesday, Palm Sunday, Holy Week
    else if (offset >= 1 && offset <= 7) level = 2;                    // Easter octave
    else if (sunday) level = (season === 'Advent' || season === 'Lent' || season === 'Easter') ? 2 : 6;
    else if (season === 'Lent') level = 9;
    else if (season === 'Advent' && d.getMonth() === 11 && d.getDate() >= 17) level = 9;
    else if (d.getMonth() === 11 && d.getDate() >= 26) level = 9;      // Christmas octave
    levelCache[key] = level;
    return level;
}

function levelOf(c) {
    if (c.level) return c.level;
    if (c.type === 'Feast' && c.lord) return 5;
    return TYPE_LEVEL[c.type] || 13;
}

function fixedOn(d) {
    return (LITURGICAL_FEASTS[d.getMonth()] || [])
        .filter((f) => f.date === d.getDate())
        .map((f) => {
            const row = FIXED_CELEBRATIONS.find((r) => r[0] === d.getMonth() + 1 && r[1] === d.getDate());
            return Object.assign({ date: litDay(d), type: f.type, color: f.color, name: f.name, sw: f.sw }, row[6] || {});
        });
}

const movableCache = {};
function movablesOn(d) {
    const y = d.getFullYear();
    if (!movableCache[y]) movableCache[y] = getMovableCelebrations(y);
    return movableCache[y].filter((c) => sameDay(c.date, d));
}

// Where a solemnity is moved to when the day it falls on outranks it.
function transferTarget(c, d) {
    const easter = yearDates(d.getFullYear()).easter;
    const offset = Math.round((d - easter) / 86400000);
    const month = d.getMonth() + 1, day = d.getDate();
    // St Joseph in Holy Week is kept on the Saturday before Palm Sunday.
    if (month === 3 && day === 19 && offset >= -7 && offset <= 0) return litAddDays(easter, -8);
    // The Annunciation in Holy Week or the Easter octave goes to the Monday
    // after the Second Sunday of Easter.
    if (month === 3 && day === 25 && offset >= -7 && offset <= 7) return litAddDays(easter, 8);
    // Otherwise: the next day that isn't itself a privileged day or taken
    // by another solemnity or feast of the Lord.
    let next = litAddDays(d, 1);
    for (let i = 0; i < 14; i++, next = litAddDays(next, 1)) {
        if (seasonalLevel(next) >= 9 && !movablesOn(next).concat(fixedOn(next)).some((x) => levelOf(x) <= 5)) return next;
    }
    return litAddDays(d, 1);
}

function impeded(c, d) {
    if (c.type !== 'Solemnity' || c.level) return false;
    if (seasonalLevel(d) <= 2) return true;
    // Two solemnities on one day: a movable solemnity of the Lord (e.g. the
    // Sacred Heart) keeps the day.
    return movablesOn(d).some((m) => m.type === 'Solemnity' && levelOf(m) <= 3);
}

// Fixed solemnities moved to another day in a year, by target date.
const transferCache = {};
function transfersFor(year) {
    if (!transferCache[year]) {
        const map = {};
        FIXED_CELEBRATIONS.forEach((row) => {
            if (row[2] !== 'Solemnity') return;
            const from = new Date(year, row[0] - 1, row[1]);
            fixedOn(from).forEach((c) => {
                if (!impeded(c, from)) return;
                const to = transferTarget(c, from);
                (map[stampOf(to)] = map[stampOf(to)] || []).push(Object.assign({}, c, { date: litDay(to), transferred: true }));
            });
        });
        transferCache[year] = map;
    }
    return transferCache[year];
}

function transferredOnto(d) {
    return transfersFor(d.getFullYear())[stampOf(d)] || [];
}

function localize(c, lang) {
    return Object.assign({}, c, {
        name: lang === 'sw' ? c.sw : c.name,
        nameEn: c.name,
        nameSw: c.sw,
        rankLabel: (RANK_LABELS[lang === 'sw' ? 'sw' : 'en'] || RANK_LABELS.en)[c.type] || c.type,
        level: levelOf(c)
    });
}

// Every celebration kept on a date, highest first. Memorials on a
// privileged weekday come back with type 'Commemoration'.
const celebrationCache = {};
function getCelebrationsForDate(date = new Date(), lang = 'en') {
    const d = litDay(date);
    const key = stampOf(d) + lang;
    if (!celebrationCache[key]) celebrationCache[key] = computeCelebrations(d, lang);
    return celebrationCache[key].slice();
}

function computeCelebrations(d, lang) {
    const dayLevel = seasonalLevel(d);
    const candidates = movablesOn(d)
        .concat(fixedOn(d).filter((c) => !impeded(c, d)))
        .concat(transferredOnto(d));

    const kept = [];
    candidates.forEach((c) => {
        const level = levelOf(c);
        if (level < dayLevel || (c.level && level <= dayLevel)) {
            kept.push(c);
        } else if (dayLevel === 9 && level >= 10) {
            kept.push(Object.assign({}, c, { type: 'Commemoration', level: 13 }));
        } else if (dayLevel === 13) {
            kept.push(c);
        }
    });
    return kept
        .sort((a, b) => levelOf(a) - levelOf(b))
        .map((c) => localize(c, lang));
}

// The celebration of the day (or null on a plain weekday or Sunday).
function getCelebrationForDate(date = new Date(), lang = 'en') {
    return getCelebrationsForDate(date, lang)[0] || null;
}

// Precedence level of the day as celebrated.
function dayPrecedence(date) {
    const top = getCelebrationForDate(date);
    return Math.min(seasonalLevel(litDay(date)), top ? top.level : 13);
}

// Evening Prayer on `date` belongs to the next day when that day has First
// Vespers (a Sunday or a solemnity) and outranks this one (GNLY 61); a
// Sunday wins a tie against a weekday. Returns { date, first, info,
// celebration } for the day whose Vespers are prayed.
function getVespersDay(date = new Date(), lang = 'en') {
    const today = litDay(date);
    const tomorrow = litAddDays(today, 1);
    const tomorrowTop = getCelebrationForDate(tomorrow, lang);
    const hasFirstVespers = tomorrow.getDay() === 0 || (tomorrowTop && tomorrowTop.type === 'Solemnity');
    // The Triduum has no First Vespers of the next day (the Easter Vigil
    // takes their place on Holy Saturday).
    const first = !!hasFirstVespers && dayPrecedence(today) > 1 && (dayPrecedence(tomorrow) < dayPrecedence(today)
        || (dayPrecedence(tomorrow) === dayPrecedence(today) && tomorrow.getDay() === 0 && today.getDay() !== 0));
    const day = first ? tomorrow : today;
    return { date: day, first, info: getLiturgicalToday(day, lang), celebration: getCelebrationForDate(day, lang) };
}

// The next `count` celebrations from `from` (inclusive), skipping
// commemorations. Options: { minType: 'Memorial' } to leave out optional
// memorials.
function getUpcomingCelebrations(from = new Date(), count = 5, lang = 'en', options = {}) {
    const minRank = options.minType ? CELEBRATION_RANK[options.minType] : CELEBRATION_RANK['Optional Memorial'];
    const out = [];
    let d = litDay(from);
    for (let i = 0; i < 400 && out.length < count; i++, d = litAddDays(d, 1)) {
        getCelebrationsForDate(d, lang).forEach((c) => {
            if (out.length < count && (CELEBRATION_RANK[c.type] || 0) >= minRank) out.push(c);
        });
    }
    return out;
}

function rankLabel(type, lang = 'en') {
    return (RANK_LABELS[lang === 'sw' ? 'sw' : 'en'] || RANK_LABELS.en)[type] || type;
}

// Expose for pages that consume this as a shared script
window.LiturgicalCalendar = {
    feasts: LITURGICAL_FEASTS,
    easterFor: calculateEasterForFeasts,
    today: getLiturgicalToday,
    celebrationFor: getCelebrationForDate,
    celebrationsFor: getCelebrationsForDate,
    vespersFor: getVespersDay,
    upcoming: getUpcomingCelebrations,
    rankLabel: rankLabel
};
