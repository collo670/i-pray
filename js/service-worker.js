const CACHE_NAME = 'ipray-v20261007230000';

// Critical app shell: cached during install. If any of these fail, the
// install fails, so keep this list short and only list files that exist.
const CRITICAL_ASSETS = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/dist/output.css',
  '/i-pray/css/index.css',
  '/i-pray/js/index.js',
  '/i-pray/js/theme.js',
  '/i-pray/js/text-size.js',
  '/i-pray/js/logo-loader.js',
  '/i-pray/js/liturgical-calendar.js',
  '/i-pray/js/translation.js',
  '/i-pray/manifest.json',
  '/i-pray/assets/images/logo-small.jpg',
  '/i-pray/assets/images/maria-mdogo.jpg',
  '/i-pray/assets/images/icon-192x192.png',
  '/i-pray/pages/fallback.html'
];

// Everything else (prayer pages, scripts, styles, readings) is cached in the
// background after install. Each URL is fetched independently, so a missing
// file never blocks the rest. Generated from the actual files on disk.
const PRECACHE_URLS = [
  "/i-pray/pages/alhamisi1-jioni.html",
  "/i-pray/pages/alhamisi1-saa-sita.html",
  "/i-pray/pages/alhamisi1.html",
  "/i-pray/pages/alhamisi2-jioni.html",
  "/i-pray/pages/alhamisi2-saa-sita.html",
  "/i-pray/pages/alhamisi2.html",
  "/i-pray/pages/alhamisi3-jioni.html",
  "/i-pray/pages/alhamisi3-saa-sita.html",
  "/i-pray/pages/alhamisi3.html",
  "/i-pray/pages/alhamisi4-jioni.html",
  "/i-pray/pages/alhamisi4-saa-sita.html",
  "/i-pray/pages/alhamisi4.html",
  "/i-pray/pages/amefufuka.html",
  "/i-pray/pages/amefufuka/001-litania-fupi-ya-penitensia.html",
  "/i-pray/pages/amefufuka/002-litania-ya-penitensia.html",
  "/i-pray/pages/amefufuka/003-baraka-kwa-adhimisho-la-penitensia.html",
  "/i-pray/pages/amefufuka/004-utukufu-kwa-mungu-juu-mbinguni.html",
  "/i-pray/pages/amefufuka/005-mtakatifu.html",
  "/i-pray/pages/amefufuka/005-yu-mtakatifu.html",
  "/i-pray/pages/amefufuka/006-mtakatifu-mtakatifu-hosanna-ya-matawi.html",
  "/i-pray/pages/amefufuka/006-mtakatifu-ndiye-bwana-mtakatifu-wa-vibanda.html",
  "/i-pray/pages/amefufuka/007-mtakatifu-mtakatifu.html",
  "/i-pray/pages/amefufuka/007-mtakatifu.html",
  "/i-pray/pages/amefufuka/008-sala-kuu-ya-ekaristi-ii.html",
  "/i-pray/pages/amefufuka/010-baraka-ya-maji-ya-chemchemi-ya-ubatizo.html",
  "/i-pray/pages/amefufuka/012-mbiu-ya-pasaka.html",
  "/i-pray/pages/amefufuka/014-utangulizi-wa-pasaka.html",
  "/i-pray/pages/amefufuka/015-tenzi-ya-masifu-ya-asubuhi-ya-majilio-2.html",
  "/i-pray/pages/amefufuka/015-tenzi-ya-masifu-ya-asubuhi-ya-majilio.html",
  "/i-pray/pages/amefufuka/016-tenzi-ya-masifu-ya-asubuhi-toka-pasaka.html",
  "/i-pray/pages/amefufuka/016-tenzi-ya-masifu-ya-jioni-toka-pasaka.html",
  "/i-pray/pages/amefufuka/017-tenzi-ya-masifu-ya-jioni-ya-siku.html",
  "/i-pray/pages/amefufuka/018-tenzi-ya-masifu-ya-jioni-toka-kupaa.html",
  "/i-pray/pages/amefufuka/019-tenzi-ya-masifu-ya-asubuhi-ya-pentekoste.html",
  "/i-pray/pages/amefufuka/020-sekwensia-ya-pentekoste.html",
  "/i-pray/pages/amefufuka/021-sala-kuu-ya-ekaristi-ii-utangulizi.html",
  "/i-pray/pages/amefufuka/022-yafuata-sala-kuu-ya-ekaristi-ii-konsekrasiyo.html",
  "/i-pray/pages/amefufuka/023-yafuata-sala-ya-ekaristi-ii-anamnesis.html",
  "/i-pray/pages/amefufuka/024-shangilio-kwa-mshumaa-wa-usiku-wa-pasaka.html",
  "/i-pray/pages/amefufuka/024-wimbo-wa-katikati.html",
  "/i-pray/pages/amefufuka/025-tenzi-kwa-kristo-mwanga.html",
  "/i-pray/pages/amefufuka/026-aleluya-kwa-shangilio-la-injili.html",
  "/i-pray/pages/amefufuka/026-aleluya-ya-pasaka.html",
  "/i-pray/pages/amefufuka/027-sala-ya-waumini.html",
  "/i-pray/pages/amefufuka/027-shangilio-kwa-injili-wakati-wa-kwaresima.html",
  "/i-pray/pages/amefufuka/028-te-deum.html",
  "/i-pray/pages/amefufuka/029-salve.html",
  "/i-pray/pages/amefufuka/030-credo.html",
  "/i-pray/pages/amefufuka/031-amefufuka.html",
  "/i-pray/pages/amefufuka/032-kwako-we-mji-wa-mungu.html",
  "/i-pray/pages/amefufuka/032-safari-i-ngumu.html",
  "/i-pray/pages/amefufuka/033-zab-129-toka-chini-nakulilia-ee-bwana.html",
  "/i-pray/pages/amefufuka/034-furahini-ndugu.html",
  "/i-pray/pages/amefufuka/034-zab-102-nafsi-yangu-umbariki-yahweh.html",
  "/i-pray/pages/amefufuka/035-yahweh-u-mungu-wangu.html",
  "/i-pray/pages/amefufuka/035-zab-12-mpaka-lini.html",
  "/i-pray/pages/amefufuka/036-zab-118-njoo-umtafute-mtumishi-wako.html",
  "/i-pray/pages/amefufuka/037-zab-132-jinsi-ilivyo-vema-na-kupendeza.html",
  "/i-pray/pages/amefufuka/037-zab-132-tazama-ilivyo-vema.html",
  "/i-pray/pages/amefufuka/038-zab-132-tazameni-ilivyo-vema-onjeni-ulivyo.html",
  "/i-pray/pages/amefufuka/039-zab-136-asante-yahweh.html",
  "/i-pray/pages/amefufuka/040-wimbo-wa-vijana-watatu-katika-tanuru.html",
  "/i-pray/pages/amefufuka/041-wimbo-wa-vijana-watatu-katika-tanuru.html",
  "/i-pray/pages/amefufuka/042-zab-148-msifuni-bwana-kutoka-mbinguni.html",
  "/i-pray/pages/amefufuka/043-zab-150-aleluya-msifuni-mungu.html",
  "/i-pray/pages/amefufuka/044-evenu-shalom-alehem.html",
  "/i-pray/pages/amefufuka/045-abba-baba.html",
  "/i-pray/pages/amefufuka/045-aleluya-umekuja-ufalme.html",
  "/i-pray/pages/amefufuka/046-nani-atatutenga.html",
  "/i-pray/pages/amefufuka/047-wimbo-wa-bikira-maria.html",
  "/i-pray/pages/amefufuka/048-nitatwaa-na-kuinua-kikombe-cha-wokovu.html",
  "/i-pray/pages/amefufuka/049-zab-125-wakati-bwana-alirejeza.html",
  "/i-pray/pages/amefufuka/050-wimbo-wa-zakaria.html",
  "/i-pray/pages/amefufuka/051-ee-mauti-u-wapi-ushindi-wako.html",
  "/i-pray/pages/amefufuka/052-enyi-mbingu-dondokeni-toka-juu.html",
  "/i-pray/pages/amefufuka/053-pentekoste.html",
  "/i-pray/pages/amefufuka/054-njoo-mwana-wa-mtu.html",
  "/i-pray/pages/amefufuka/054-tazama-naja-upesi.html",
  "/i-pray/pages/amefufuka/055-abrahamu.html",
  "/i-pray/pages/amefufuka/056-wimbo-wa-musa.html",
  "/i-pray/pages/amefufuka/057-mwaliko-wa-pasaka.html",
  "/i-pray/pages/amefufuka/057-zab-116-msifuni-bwana-watu-wote-wa.html",
  "/i-pray/pages/amefufuka/058-zab-113a-israeli-alipotoka-huko-misri.html",
  "/i-pray/pages/amefufuka/059-zab-23-enyi-malango-inueni-vichwa-vyenu.html",
  "/i-pray/pages/amefufuka/060-zab-22-bwana-ni-mchungaji-wangu.html",
  "/i-pray/pages/amefufuka/061-zab-136-kando-ya-mito-ya-babilonia.html",
  "/i-pray/pages/amefufuka/062-zab-50-nihurumie-ee-mungu.html",
  "/i-pray/pages/amefufuka/063-zab-50-nihurumie-bwana-nihurumie.html",
  "/i-pray/pages/amefufuka/064-wimbo-wa-kujishusha-kwake-yesu-tenzi-ya.html",
  "/i-pray/pages/amefufuka/065-salamu-maria-2.html",
  "/i-pray/pages/amefufuka/065-salamu-maria.html",
  "/i-pray/pages/amefufuka/066-maria-mdogo-maria.html",
  "/i-pray/pages/amefufuka/067-zab-120-nainua-macho-kwa-milima.html",
  "/i-pray/pages/amefufuka/068-zab-94-ikiwa-leo-mwasikia-sauti-yake.html",
  "/i-pray/pages/amefufuka/069-zab-94-njoni-tumwimbie-bwana.html",
  "/i-pray/pages/amefufuka/070-dayenu.html",
  "/i-pray/pages/amefufuka/071-kwa-kafara-ya-pasaka.html",
  "/i-pray/pages/amefufuka/071-tenzi-ya-pasaka.html",
  "/i-pray/pages/amefufuka/072-tenzi-ya-majilio.html",
  "/i-pray/pages/amefufuka/073-uri-uri-ura.html",
  "/i-pray/pages/amefufuka/073-yuaja-mungu-wangu.html",
  "/i-pray/pages/amefufuka/074-amen-amen-amen.html",
  "/i-pray/pages/amefufuka/075-zab-126-bwana-asipoijenga-nyumba.html",
  "/i-pray/pages/amefufuka/075-zab-33-onjeni-mkaone.html",
  "/i-pray/pages/amefufuka/076-zab-121-kwa-upendo-wa-ndugu-zangu.html",
  "/i-pray/pages/amefufuka/077-zab-39-nilingojea-nilingojea-bwana.html",
  "/i-pray/pages/amefufuka/078-zab-56-nataka-kuimba.html",
  "/i-pray/pages/amefufuka/079-zab-2-mbona-mataifa-wafanya-ghasia.html",
  "/i-pray/pages/amefufuka/080-zab-41-42-kama-ayala-aioneavyo-shauku.html",
  "/i-pray/pages/amefufuka/081-imbeni-kwa-furaha.html",
  "/i-pray/pages/amefufuka/081-zab-99-shangilieni-bwana.html",
  "/i-pray/pages/amefufuka/082-zab-16-niamkapo-nishibishwe-kwa-sura-yako.html",
  "/i-pray/pages/amefufuka/083-wimbo-wa-watoto-kwa-usiku-wa-pasaka.html",
  "/i-pray/pages/amefufuka/084-zab-117-sitakufa.html",
  "/i-pray/pages/amefufuka/085-zab-103-ee-bwana-tuma-roho-wako.html",
  "/i-pray/pages/amefufuka/086-waambieni-waliovunjika-moyo.html",
  "/i-pray/pages/amefufuka/087-zab-62-ee-mungu-u-mungu-wangu.html",
  "/i-pray/pages/amefufuka/088-watu-waliokwenda-kwenye-giza.html",
  "/i-pray/pages/amefufuka/089-wimbo-wa-balaamu.html",
  "/i-pray/pages/amefufuka/090-zab-137-mbele-ya-malaika.html",
  "/i-pray/pages/amefufuka/091-israeli-angali-mtoto-nilimpenda.html",
  "/i-pray/pages/amefufuka/092-zab-146-mwimbie-yahweh-yerusalemu.html",
  "/i-pray/pages/amefufuka/093-nafsi-yangu-imbariki-bwana.html",
  "/i-pray/pages/amefufuka/094-zab-83-maskani-yako-yapendeza-kama-nini.html",
  "/i-pray/pages/amefufuka/095-siku-ya-pumziko.html",
  "/i-pray/pages/amefufuka/095-zab-92-yuaja-bwana-amejivika-adhama.html",
  "/i-pray/pages/amefufuka/096-farijini-watu-wangu.html",
  "/i-pray/pages/amefufuka/097-palikuwa-malaika-wawili.html",
  "/i-pray/pages/amefufuka/098-zab-114-115-nampenda-bwana.html",
  "/i-pray/pages/amefufuka/099-njoni-kwangu-ninyi-nyote.html",
  "/i-pray/pages/amefufuka/099-zab-46-anapaa-bwana-mungu.html",
  "/i-pray/pages/amefufuka/100-zab-64-kwako-bwana-sifa-zakulaiki-katika.html",
  "/i-pray/pages/amefufuka/101-zab-10-bwana-ndiye-niliyemkimbilia.html",
  "/i-pray/pages/amefufuka/102-zab-67-bwana-atangaza-habari.html",
  "/i-pray/pages/amefufuka/103-zab-133-mbarikini-bwana.html",
  "/i-pray/pages/amefufuka/104-binti-za-yerusalemu.html",
  "/i-pray/pages/amefufuka/105-zab-31-nalikujulisha-dhambi-yangu.html",
  "/i-pray/pages/amefufuka/106-maria-mama-wa-kanisa.html",
  "/i-pray/pages/amefufuka/107-stabat-mater.html",
  "/i-pray/pages/amefufuka/108-maombolezo-ya-bwana.html",
  "/i-pray/pages/amefufuka/109-zab-8-ee-bwana-mungu-wetu.html",
  "/i-pray/pages/amefufuka/110-mbarikiwa-maria.html",
  "/i-pray/pages/amefufuka/110-salaam-malkia-wa-mbingu.html",
  "/i-pray/pages/amefufuka/111-bikira-wa-maajabu.html",
  "/i-pray/pages/amefufuka/112-maria-nyumba-ya-baraka.html",
  "/i-pray/pages/amefufuka/113-zab-33-nitamhimidi-bwana-kila-wakati.html",
  "/i-pray/pages/amefufuka/114-mavuno-ya-mataifa.html",
  "/i-pray/pages/amefufuka/115-zab-109-neno-la-bwana-kwa-bwana.html",
  "/i-pray/pages/amefufuka/116-zab-1-heri-mtu.html",
  "/i-pray/pages/amefufuka/117-zab-44-wewe-u-mzuri.html",
  "/i-pray/pages/amefufuka/118-zab-127-heri-kwa-mtu.html",
  "/i-pray/pages/amefufuka/119-zab-67-aondoke-mungu.html",
  "/i-pray/pages/amefufuka/120-tuendeni-wachungaji.html",
  "/i-pray/pages/amefufuka/121-maria-wa-jasna-gora.html",
  "/i-pray/pages/amefufuka/122-zab-141-kwako-bwana-kwa-sauti-yangu.html",
  "/i-pray/pages/amefufuka/123-chipukizi-latoka-shinani-mwa-yese.html",
  "/i-pray/pages/amefufuka/124-zab-24-kwako-bwana-nakuinulia-nafsi-yangu.html",
  "/i-pray/pages/amefufuka/125-zab-140-ninakuita.html",
  "/i-pray/pages/amefufuka/126-zaburi-122-nimekuinulia-macho-yangu.html",
  "/i-pray/pages/amefufuka/127-zab-6-bwana-usinikemee-kwa-hasira-yako.html",
  "/i-pray/pages/amefufuka/128-utukufu.html",
  "/i-pray/pages/amefufuka/129-zab-32-furahini-wenye-haki-katika-bwana.html",
  "/i-pray/pages/amefufuka/130-zab-128-mara-nyingi-wamenitesa.html",
  "/i-pray/pages/amefufuka/131-zab-17-nakupenda-ee-bwana.html",
  "/i-pray/pages/amefufuka/132-maria-mama-wa-njia-iwakayo.html",
  "/i-pray/pages/amefufuka/133-shlom-lekh-mariam.html",
  "/i-pray/pages/amefufuka/134-zab-15-utanijulisha-njia-ya-uzima.html",
  "/i-pray/pages/amefufuka/135-nendeni-kutangazia-ndugu-zangu.html",
  "/i-pray/pages/amefufuka/136-zab-53-ee-mungu-kwa-jina-lako.html",
  "/i-pray/pages/amefufuka/137-zab-142-ee-bwana-sikiliza-sala-yangu.html",
  "/i-pray/pages/amefufuka/138-zab-13-mpumbavu-awaza-hakuna-mungu.html",
  "/i-pray/pages/amefufuka/201-kaa-kimya-na-peke-yako.html",
  "/i-pray/pages/amefufuka/202-hivyo-anena-aliye-amen.html",
  "/i-pray/pages/amefufuka/203-watakuona-wafalme-wimbo-wa-2-wa-mtumishi.html",
  "/i-pray/pages/amefufuka/204-yakobo.html",
  "/i-pray/pages/amefufuka/205-debora.html",
  "/i-pray/pages/amefufuka/206-naona-mbingu-wazi.html",
  "/i-pray/pages/amefufuka/207-bwana-amenipa-wimbo-wa-3-wa-mtumishi.html",
  "/i-pray/pages/amefufuka/208-nani-huyu-atokaye-edomu.html",
  "/i-pray/pages/amefufuka/209-wimbo-wa-mpanzi.html",
  "/i-pray/pages/amefufuka/210-roho-wa-bwana-yu-juu-yangu.html",
  "/i-pray/pages/amefufuka/210-tazama-kioo-chetu-ndiye-bwana.html",
  "/i-pray/pages/amefufuka/211-kama-msukumo-wa-hasira.html",
  "/i-pray/pages/amefufuka/212-mbarikiwa-awe-mungu.html",
  "/i-pray/pages/amefufuka/213-zab-138-ee-bwana-wanichunguza-na-kunijua.html",
  "/i-pray/pages/amefufuka/214-zab-21-eli-eli-lamma-sabaktani.html",
  "/i-pray/pages/amefufuka/216-hakuna-mtu-awezaye-kutumikia-mabwana-wawili.html",
  "/i-pray/pages/amefufuka/217-nataka-kuenda-yerusalemu.html",
  "/i-pray/pages/amefufuka/217-zab-130-ee-bwana-moyo-wangu-hauna.html",
  "/i-pray/pages/amefufuka/218-shema-israeli.html",
  "/i-pray/pages/amefufuka/219-utenzi-wa-msalaba-mtukufu.html",
  "/i-pray/pages/amefufuka/220-vaeni-silaha-zote-za-mungu.html",
  "/i-pray/pages/amefufuka/221-zab-86-kwenye-milima-mitakatifu.html",
  "/i-pray/pages/amefufuka/222-akeda.html",
  "/i-pray/pages/amefufuka/261-zab-36-usikasirike-na-wabaya.html",
  "/i-pray/pages/amefufuka/262-tenzi-ya-upendo.html",
  "/i-pray/pages/amefufuka/263-kwa-kuwa-mungu.html",
  "/i-pray/pages/amefufuka/264-kama-wahukumiwa-kifo.html",
  "/i-pray/pages/amefufuka/265-yesu-alizunguka-miji-yote.html",
  "/i-pray/pages/amefufuka/266-msishindane-na-uovu.html",
  "/i-pray/pages/amefufuka/267-anibusu-kwa-busu-za-kinywa-chake.html",
  "/i-pray/pages/amefufuka/268-mpenzi-wangu-ni-kwangu.html",
  "/i-pray/pages/amefufuka/269-njoo-toka-lebanoni.html",
  "/i-pray/pages/amefufuka/270-nilipolala.html",
  "/i-pray/pages/amefufuka/271-wewe-ukaaye-bustanini.html",
  "/i-pray/pages/amefufuka/272-kondoo-jike-wa-mungu.html",
  "/i-pray/pages/amefufuka/273-mbele-yake-wote-huficha-uso-wimbo-wa.html",
  "/i-pray/pages/amefufuka/274-wimbo-wa-mwana-kondoo.html",
  "/i-pray/pages/amefufuka/275-nani-huyu-apandaye-toka-jangwa.html",
  "/i-pray/pages/amefufuka/276-sauti-ya-mpendwa-wangu.html",
  "/i-pray/pages/amefufuka/277-hua-aliruka.html",
  "/i-pray/pages/amefufuka/278-kama-asali-inavyotona.html",
  "/i-pray/pages/amefufuka/279-ee-yesu-mpendwa-wangu.html",
  "/i-pray/pages/amefufuka/280-nitwae-mbinguni.html",
  "/i-pray/pages/amefufuka/281-wewe-ndiwe-tumaini-langu-ee-bwana.html",
  "/i-pray/pages/amefufuka/282-ishara-kuu.html",
  "/i-pray/pages/amefufuka/283-nanyosha-mikono.html",
  "/i-pray/pages/amefufuka/284-homilia-ya-pasaka-ya-melitoni-wa-sardi.html",
  "/i-pray/pages/amefufuka/285-carmen-63.html",
  "/i-pray/pages/amefufuka/286-caritas-christi.html",
  "/i-pray/pages/amefufuka/287-noli-me-tangere.html",
  "/i-pray/pages/amefufuka/288-ee-bwana-nisaidie-kutosita-juu-yako.html",
  "/i-pray/pages/amefufuka/289-ee-bwana-umenihadhaa.html",
  "/i-pray/pages/amefufuka/290-hotuba-mlimani.html",
  "/i-pray/pages/amefufuka/292-kwenye-usiku-wa-vivuli.html",
  "/i-pray/pages/amefufuka/nyongeza-01-hii-hdiyo-amri-yangu.html",
  "/i-pray/pages/amefufuka/nyongeza-02-ikiwa-mmefufuka-na-kristo.html",
  "/i-pray/pages/amefufuka/nyongeza-03-ishara-kuu.html",
  "/i-pray/pages/amefufuka/nyongeza-04-katikati-ya-umati-mkubwa.html",
  "/i-pray/pages/amefufuka/nyongeza-05-masiya-simba-kwa-kushinda.html",
  "/i-pray/pages/amefufuka/nyongeza-06-mwana-kondoo-wa-mungu.html",
  "/i-pray/pages/amefufuka/nyongeza-07-ndugu.html",
  "/i-pray/pages/amefufuka/nyongeza-08-nitawatwaa-kati-ya-mataifa.html",
  "/i-pray/pages/amefufuka/nyongeza-09-peke-yako-kwa-peke-yake.html",
  "/i-pray/pages/amefufuka/nyongeza-10-resurrexit.html",
  "/i-pray/pages/amefufuka/nyongeza-11-salamu-maria-njiwa-asiyeoza.html",
  "/i-pray/pages/amefufuka/nyongeza-12-ya-mt-romano-il-melode.html",
  "/i-pray/pages/amefufuka/nyongeza-13-salve.html",
  "/i-pray/pages/amefufuka/nyongeza-14-umeniibia-moyo.html",
  "/i-pray/pages/amefufuka/nyongeza-15-watoto-wa-bethlehemu.html",
  "/i-pray/pages/amefufuka/nyongeza-16-wewe-ni-mzuri-mpenzi-wangu.html",
  "/i-pray/pages/amefufuka/nyongeza-17-zakayo.html",
  "/i-pray/pages/amefufuka/nyongeza-18-kama-kondoo-aonaye-jinsi-wapelekavyo-kikondoo-wake.html",
  "/i-pray/pages/antifona.html",
  "/i-pray/pages/calendar.html",
  "/i-pray/pages/carmen.html",
  "/i-pray/pages/compline.html",
  "/i-pray/pages/daily-readings.html",
  "/i-pray/pages/fallback.html",
  "/i-pray/pages/holy-rosary.html",
  "/i-pray/pages/ijumaa1-jioni.html",
  "/i-pray/pages/ijumaa1-saa-sita.html",
  "/i-pray/pages/ijumaa1.html",
  "/i-pray/pages/ijumaa2-jioni.html",
  "/i-pray/pages/ijumaa2-saa-sita.html",
  "/i-pray/pages/ijumaa2.html",
  "/i-pray/pages/ijumaa3-jioni.html",
  "/i-pray/pages/ijumaa3-saa-sita.html",
  "/i-pray/pages/ijumaa3.html",
  "/i-pray/pages/ijumaa4-jioni.html",
  "/i-pray/pages/ijumaa4-saa-sita.html",
  "/i-pray/pages/ijumaa4.html",
  "/i-pray/pages/jumamosi1-jioni.html",
  "/i-pray/pages/jumamosi1-saa-sita.html",
  "/i-pray/pages/jumamosi1.html",
  "/i-pray/pages/jumamosi2-jioni.html",
  "/i-pray/pages/jumamosi2-saa-sita.html",
  "/i-pray/pages/jumamosi2.html",
  "/i-pray/pages/jumamosi3-jioni.html",
  "/i-pray/pages/jumamosi3-saa-sita.html",
  "/i-pray/pages/jumamosi3.html",
  "/i-pray/pages/jumamosi4-jioni.html",
  "/i-pray/pages/jumamosi4-saa-sita.html",
  "/i-pray/pages/jumamosi4.html",
  "/i-pray/pages/jumanne1-jioni.html",
  "/i-pray/pages/jumanne1-saa-sita.html",
  "/i-pray/pages/jumanne1.html",
  "/i-pray/pages/jumanne2-jioni.html",
  "/i-pray/pages/jumanne2-saa-sita.html",
  "/i-pray/pages/jumanne2.html",
  "/i-pray/pages/jumanne3-jioni.html",
  "/i-pray/pages/jumanne3-saa-sita.html",
  "/i-pray/pages/jumanne3.html",
  "/i-pray/pages/jumanne4-jioni.html",
  "/i-pray/pages/jumanne4-saa-sita.html",
  "/i-pray/pages/jumanne4.html",
  "/i-pray/pages/jumapili1-jioni.html",
  "/i-pray/pages/jumapili1-saa-sita.html",
  "/i-pray/pages/jumapili1.html",
  "/i-pray/pages/jumapili2-jioni.html",
  "/i-pray/pages/jumapili2-saa-sita.html",
  "/i-pray/pages/jumapili2.html",
  "/i-pray/pages/jumapili3-jioni.html",
  "/i-pray/pages/jumapili3-saa-sita.html",
  "/i-pray/pages/jumapili3.html",
  "/i-pray/pages/jumapili4-jioni.html",
  "/i-pray/pages/jumapili4-saa-sita.html",
  "/i-pray/pages/jumapili4.html",
  "/i-pray/pages/jumatano1-jioni.html",
  "/i-pray/pages/jumatano1-saa-sita.html",
  "/i-pray/pages/jumatano1.html",
  "/i-pray/pages/jumatano2-jioni.html",
  "/i-pray/pages/jumatano2-saa-sita.html",
  "/i-pray/pages/jumatano2.html",
  "/i-pray/pages/jumatano3-jioni.html",
  "/i-pray/pages/jumatano3-saa-sita.html",
  "/i-pray/pages/jumatano3.html",
  "/i-pray/pages/jumatano4-jioni.html",
  "/i-pray/pages/jumatano4-saa-sita.html",
  "/i-pray/pages/jumatano4.html",
  "/i-pray/pages/jumatatu1-jioni.html",
  "/i-pray/pages/jumatatu1-saa-sita.html",
  "/i-pray/pages/jumatatu1.html",
  "/i-pray/pages/jumatatu2-jioni.html",
  "/i-pray/pages/jumatatu2-saa-sita.html",
  "/i-pray/pages/jumatatu2.html",
  "/i-pray/pages/jumatatu3-jioni.html",
  "/i-pray/pages/jumatatu3-saa-sita.html",
  "/i-pray/pages/jumatatu3.html",
  "/i-pray/pages/jumatatu4-jioni.html",
  "/i-pray/pages/jumatatu4-saa-sita.html",
  "/i-pray/pages/jumatatu4.html",
  "/i-pray/pages/lauds.html",
  "/i-pray/pages/mwaka-week11.html",
  "/i-pray/pages/mwaka-week12.html",
  "/i-pray/pages/mwaka1.html",
  "/i-pray/pages/mwaka2-week11.html",
  "/i-pray/pages/mwaka2-week12.html",
  "/i-pray/pages/mwaka2-week13.html",
  "/i-pray/pages/mwaka2-week14.html",
  "/i-pray/pages/mwaka2-week15.html",
  "/i-pray/pages/mwaka2-week16.html",
  "/i-pray/pages/mwaka2-week17.html",
  "/i-pray/pages/mwaka2-week18.html",
  "/i-pray/pages/mwaka2-week19.html",
  "/i-pray/pages/mwaka2-week20.html",
  "/i-pray/pages/mwaka2.html",
  "/i-pray/pages/mwaka3-week21.html",
  "/i-pray/pages/mwaka3-week22.html",
  "/i-pray/pages/mwaka3-week23.html",
  "/i-pray/pages/mwaka3-week24.html",
  "/i-pray/pages/mwaka3-week25.html",
  "/i-pray/pages/mwaka3-week26.html",
  "/i-pray/pages/mwaka3-week27.html",
  "/i-pray/pages/mwaka3-week28.html",
  "/i-pray/pages/mwaka3-week29.html",
  "/i-pray/pages/mwaka3-week30.html",
  "/i-pray/pages/mwaka3-week31.html",
  "/i-pray/pages/mwaka3-week32.html",
  "/i-pray/pages/mwaka3-week33.html",
  "/i-pray/pages/mwaka3-week34.html",
  "/i-pray/pages/mwaka3.html",
  "/i-pray/pages/prayer-hour.html",
  "/i-pray/pages/masifu-asubuhi.html",
  "/i-pray/pages/sacraments.html",
  "/i-pray/pages/settings.html",
  "/i-pray/pages/via-cruce.html"
];

// Shared JS/CSS/data cached in the background too. Daily readings, months and
// "ofisi ya masomo" pages are cached at runtime the first time they are viewed.
const PRECACHE_EXTRA = [
  "/i-pray/js/daily-readings-module.js",
  "/i-pray/js/daily-readings.js",
  "/i-pray/js/fallback.js",
  "/i-pray/js/image-optimizer.js",
  "/i-pray/js/index.js",
  "/i-pray/js/liturgical-calendar.js",
  "/i-pray/js/liturgy-day-banner.js",
  "/i-pray/js/loading-states.js",
  "/i-pray/js/logo-loader.js",
  "/i-pray/js/sikukuu.js",
  "/i-pray/js/micro-interactions.js",
  "/i-pray/js/mobile-navigation.js",
  "/i-pray/js/nav-theme.js",
  "/i-pray/js/page-transitions.js",
  "/i-pray/js/search.js",
  "/i-pray/js/settings.js",
  "/i-pray/js/translation.js",
  "/i-pray/js/masifu.js",
  "/i-pray/js/amefufuka.js",
  "/i-pray/js/text-size-control.js",
  "/i-pray/js/status-bar.js",
  "/i-pray/css/fallback.css",
  "/i-pray/css/improved-nav.css",
  "/i-pray/css/index.css",
  "/i-pray/css/main.css",
  "/i-pray/css/masifu.css",
  "/i-pray/css/amefufuka.css",
  "/i-pray/pages/amefufuka/img/fig-103-1.png",
  "/i-pray/pages/amefufuka/img/fig-119-1.png",
  "/i-pray/pages/amefufuka/img/fig-120-1.png",
  "/i-pray/pages/amefufuka/img/fig-131-1.png",
  "/i-pray/pages/amefufuka/img/fig-132-1.png",
  "/i-pray/pages/amefufuka/img/fig-140-1.png",
  "/i-pray/pages/amefufuka/img/fig-144-1.png",
  "/i-pray/pages/amefufuka/img/fig-173-1.png",
  "/i-pray/pages/amefufuka/img/fig-189-1.png",
  "/i-pray/pages/amefufuka/img/fig-194-1.png",
  "/i-pray/pages/amefufuka/img/fig-194-2.png",
  "/i-pray/pages/amefufuka/img/fig-199-1.png",
  "/i-pray/pages/amefufuka/img/fig-202-1.png",
  "/i-pray/pages/amefufuka/img/fig-214-1.png",
  "/i-pray/pages/amefufuka/img/fig-79-1.png",
  "/i-pray/pages/amefufuka/img/fig-84-1.png",
  "/i-pray/css/settings.css",
  "/i-pray/css/status-bar-safe-area.css",
  "/i-pray/assets/css/styles.css",
  "/i-pray/pages/ofisi ya masomo/styles.css",
  "/i-pray/dist/output.css",
  "/i-pray/data/readings.json",
  "/i-pray/data/translations.json",
  "/i-pray/data/office-readings-sw/week-1.json",
  "/i-pray/data/office-readings-sw/week-2.json",
  "/i-pray/data/office-readings-sw/week-3.json",
  "/i-pray/data/office-readings-sw/week-4.json",
  "/i-pray/data/office-readings-sw/week-5.json",
  "/i-pray/data/office-readings-sw/week-6.json",
  "/i-pray/data/office-readings-sw/week-7.json",
  "/i-pray/data/office-readings-sw/week-8.json",
  "/i-pray/data/office-readings-sw/week-9.json",
  "/i-pray/data/office-readings-sw/week-10.json",
  "/i-pray/data/office-readings-sw/week-11.json",
  "/i-pray/data/office-readings-sw/week-12.json",
  "/i-pray/data/office-readings-sw/week-13.json",
  "/i-pray/data/office-readings-sw/week-14.json",
  "/i-pray/data/office-readings-sw/week-15.json",
  "/i-pray/data/office-readings-sw/week-16.json",
  "/i-pray/data/office-readings-sw/week-17.json",
  "/i-pray/data/office-readings-sw/week-18.json",
  "/i-pray/data/office-readings-sw/week-19.json",
  "/i-pray/data/office-readings-sw/week-20.json",
  "/i-pray/data/office-readings-sw/week-21.json",
  "/i-pray/data/office-readings-sw/week-22.json",
  "/i-pray/data/office-readings-sw/week-23.json",
  "/i-pray/data/office-readings-sw/week-24.json",
  "/i-pray/data/office-readings-sw/week-25.json",
  "/i-pray/data/office-readings-sw/week-26.json",
  "/i-pray/data/office-readings-sw/week-27.json",
  "/i-pray/data/office-readings-sw/week-28.json",
  "/i-pray/data/office-readings-sw/week-29.json",
  "/i-pray/data/office-readings-sw/week-30.json",
  "/i-pray/data/office-readings-sw/week-31.json",
  "/i-pray/data/office-readings-sw/week-32.json",
  "/i-pray/data/office-readings-sw/week-33.json",
  "/i-pray/data/office-readings-sw/week-34.json",
  "/i-pray/data/office-readings-sw/index.json"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Shell first: these must succeed for the app to work offline
      await cache.addAll(CRITICAL_ASSETS);
      // Then everything else, one by one, ignoring individual failures so a
      // single missing file never breaks the install
      const rest = [...PRECACHE_URLS, ...PRECACHE_EXTRA]
        .filter(url => !CRITICAL_ASSETS.includes(url));
      await Promise.allSettled(rest.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Refresh a cached entry from the network in the background.
function revalidate(request) {
  return fetch(request)
    .then(networkResponse => {
      if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
      }
      return networkResponse;
    });
}

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  if (event.request.method !== 'GET' || !requestURL.protocol.startsWith('http')) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate' ||
    requestURL.pathname.endsWith('.html') ||
    requestURL.pathname === '/i-pray/';

  if (isNavigation) {
    // Network-first for pages: an installed/homescreen app has no address
    // bar to "reload past" a stale cache, so it must always try the network
    // for the latest markup (e.g. nav bar fixes) first, only falling back to
    // the cached copy when offline. This is what keeps the standalone app's
    // nav bar matching the live web page instead of lagging a version behind.
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then(cachedResponse =>
            cachedResponse || caches.match('/i-pray/pages/fallback.html')
          )
        )
    );
    return;
  }

  // Stale-while-revalidate for everything else (css/js/images/data): serve
  // from cache instantly for fast in-app navigation, refresh the cache in
  // the background so updates arrive on the next visit. Never-seen requests
  // hit the network and are cached for next time.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = revalidate(event.request);

      if (cachedResponse) {
        // Kick off the background refresh but don't wait for it
        networkFetch.catch(() => {/* offline: cached copy is fine */});
        return cachedResponse;
      }

      return networkFetch.catch(() => new Response('Resource not available', { status: 404 }));
    })
  );
});