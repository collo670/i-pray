#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate proper Catholic breviary content for midday and vespers prayers
"""

import os
import re

# Days mapping
days = {
    'jumatatu': 'JUMATATU',
    'jumanne': 'JUMANNE',
    'jumatano': 'JUMATANO',
    'alhamisi': 'ALHAMISI',
    'ijumaa': 'IJUMAA',
    'jumamosi': 'JUMAMOSI',
    'jumapili': 'JUMAPILI'
}

# Midday prayer (Sext) content structure
def get_midday_content(day, week):
    """Generate midday prayer content"""
    
    # Opening verse
    opening = """<div class="prayer-section">
            <p class="verse"><strong>Mungu, nisaidie.</strong></p>
            <p class="verse">— Bwana, fanya haraka kunisaidia.</p>
            <p class="verse"><strong>Atukuzwe Baba na Mwana na Roho Mtakatifu:</strong></p>
            <p class="verse">— kama mwanzo, na sasa, na siku zote na milele. Amina. Aleluya.</p>
        </div>
        
        <hr>"""
    
    # Psalms vary by week - using standard breviary psalms for Sext
    psalms_by_week = {
        1: [
            ("ANT. I", "Ant. ya Kawaida: Neno lako ni taa kwa miguu yangu, na nuru kwa njia yangu.", 
             "Zab. 119:105-112", "Neno lako ni taa kwa miguu yangu", 
             "Neno lako ni taa kwa miguu yangu, * na nuru kwa njia yangu.\nNimeapa, na nitaamini, * kuweka hukumu zako za haki.\nNimeumia sana, Ee Bwana; * uhai wangu uwe kama ulivyoahidi.\nKubali maneno ya mdomo wangu, Ee Bwana, * ufahamu mafundisho yako.\nMaisha yangu yako hatarini daima, * lakini nimesahau sheria yako.\nWewe ni waadilifu, Ee Bwana, * na hukumu zako ni za haki.\nUmeamua kwa haki amri zako, * na uaminifu wako ni wa milele.\nWamekusumbua bila sababu, Ee Bwana; * nisaidie kwa amri zako."),
            ("ANT. II", "Ant. ya Kawaida: Msaada wangu unatoka kwa Bwana, aliyeumba mbingu na dunia.", 
             "Zab. 120", "Msaada unatoka kwa Bwana", 
             "Ninaimua macho yangu kwenye milima: * msaada wangu unatoka wapi?\nMsaada wangu unatoka kwa Bwana, * aliyeumba mbingu na dunia.\nHawezi kuruhusu mguu wako utikiswe, * alindaye hawezi kulala.\nTazama! Alindaye Israeli * halali wala halali.\nBwana ni kivuli chako upande wako wa kulia; * jua halitakuua mchana, wala mwezi usiku.\nBwana atakulinda kutoka maovu yote; * atalinda nafsi yako.\nBwana atalinda kutoka na kwenda kwako, * sasa na milele."),
            ("ANT. III", "Ant. ya Kawaida: Ninafurahi niliposikia: 'Twende nyumbani kwa Bwana!'", 
             "Zab. 121", "Furaha ya kumwona Bwana", 
             "Ninafurahi niliposikia: * 'Twende nyumbani kwa Bwana!'\nMiguu yetu imesimama ndani ya milango yako, * Ee Yerusalemu!\nYerusalemu imejengwa kama mji * ambao watu wake wameungana pamoja.\nHuko makao yamepandishwa, * kama ilivyoamriwa kwa Israeli, kusifu jina la Bwana.\nKwa maana huko vikiti vya hukumu vimewekwa, * vikiti vya nyumba ya Daudi.\nOmbeni amani kwa Yerusalemu: * 'Wale wakupendao wawe na amani!\nAmani iwe ndani ya kuta zako, * na utulivu ndani ya majumba yako.\nKwa ajili ya ndugu na marafiki zangu * nitaomba: 'Amani iwe kwako!'\nKwa ajili ya nyumba ya Bwana Mungu wetu * nitatafuta mema kwako.'")
        ],
        2: [
            ("ANT. I", "Ant. ya Kawaida: Nimefurahi niliposikia: 'Twende nyumbani kwa Bwana!'", 
             "Zab. 122", "Furaha ya kumwona Bwana", 
             "Nimefurahi niliposikia: * 'Twende nyumbani kwa Bwana!'\nMiguu yetu imesimama ndani ya milango yako, * Ee Yerusalemu!\nYerusalemu imejengwa kama mji * ambao watu wake wameungana pamoja."),
            ("ANT. II", "Ant. ya Kawaida: Nimeinua macho yangu kwa wewe, Ee wewe uliye kukaa mbinguni.", 
             "Zab. 123", "Kumtegemea Bwana", 
             "Nimeinua macho yangu kwa wewe, * Ee wewe uliye kukaa mbinguni.\nKama watumishi wanaotazama mikono ya bwana wao, * kama mjakazi anayetazama mikono ya mjane wake,\nndivyo macho yetu yanavyotazama Bwana Mungu wetu, * mpaka atuonee huruma.\nEe Bwana, tuonee huruma, tuonee huruma, * kwa maana tumekuwa tumechoshwa na dharau.\nNafsi yetu imejaa dharau * kutoka kwa wale wanaofurahi, kutoka kwa wenye kiburi."),
            ("ANT. III", "Ant. ya Kawaida: Lau si Bwana alikuwepo kwa upande wetu, watu wangeliisema.", 
             "Zab. 124", "Msaada wa Bwana", 
             "Lau si Bwana alikuwepo kwa upande wetu * - lau watu wangeliisema -\nwakati watu walipoinuka dhidi yetu, * wangeliitupa wote wali hai.\nWakati hasira zao zilipowaka dhidi yetu, * maji yangeliitupa.\nMto ungalitupa juu ya kichwa chetu, * maji yaliyokuwa na nguvu yangalitupa juu ya kichwa chetu.\nAtukuzwe Bwana, ambaye hakutupa kama chakula * kwa meno yao.\nNafsi yetu imeokoka kama ndege * kutoka kwenye mtego wa wawindaji;\nmtego umekatika, * na sisi tumeokoka.\nMsaada wetu unatoka kwa jina la Bwana, * aliyeumba mbingu na dunia.")
        ],
        3: [
            ("ANT. I", "Ant. ya Kawaida: Wale wanaomtegemea Bwana ni kama mlima wa Sayuni.", 
             "Zab. 125", "Kumtegemea Bwana", 
             "Wale wanaomtegemea Bwana * ni kama mlima wa Sayuni, hauwezi kutikisika, hukaa milele.\nKama milima inavyomzunguka Yerusalemu, * ndivyo Bwana anavyowazunguka watu wake, sasa na milele."),
            ("ANT. II", "Ant. ya Kawaida: Bwana alipowarejesha Sayuni, tulikuwa kama wale wanaopata ndoto.", 
             "Zab. 126", "Furaha ya kurudi", 
             "Bwana alipowarejesha Sayuni, * tulikuwa kama wale wanaopata ndoto.\nNdipo midomo yetu ikajaa kicheko, * na ulimi wetu ukaanza kuimba kwa shangwe.\nNdipo mataifa yakasema: * 'Bwana amewafanya makuu!'\nBwana amewafanya makuu kwetu; * tumefurahi sana.\nEe Bwana, warejeshe uwezo wetu, * kama mito ya Kusini.\nWale wanaolima kwa machozi * watavuna kwa shangwe.\nWale wanaokwenda wakilia * wanaleta mazao yao kwa shangwe."),
            ("ANT. III", "Ant. ya Kawaida: Lau si Bwana anayejenga nyumba, wale wanaojenga hufanya kazi bure.", 
             "Zab. 127", "Baraka za Bwana", 
             "Lau si Bwana anayejenga nyumba, * wale wanaojenga hufanya kazi bure.\nLau si Bwana anayelinda mji, * askari analinda bure.\nBure mnaamka mapema, bure mnalala, * bure mnala chakula cha maumivu;\nlakini anampa wapendao wake * usingizi.\nTazama, watoto ni urithi kutoka kwa Bwana, * na matunda ya tumbo ni zawadi.\nKama mishale mkononi mwa shujaa, * ndivyo watoto wa ujana.\nHeri ya mtu aliyejaza quiver yake nao! * Hawataaibika wanapozungumza na adui zao mlangoni.")
        ],
        4: [
            ("ANT. I", "Ant. ya Kawaida: Heri ya kila mtu aomchao Bwana, anayeenda katika njia zake!", 
             "Zab. 128", "Heri ya kumcha Bwana", 
             "Heri ya kila mtu aomchao Bwana, * anayeenda katika njia zake!\nUtakula matunda ya kazi za mikono yako; * utakuwa na heri, na mema yatakuwa kwako.\nMke wako atakuwa kama mzabibu wenye matunda * ndani ya nyumba yako;\nwatu wako watakuwa kama matawi ya mzeituni * karibu na meza yako.\nTazama, hivi ndivyo mtu aomchao Bwana * anavyobarikiwa.\nBwana akubariki kutoka Sayuni; * uone mema ya Yerusalemu siku zote za maisha yako.\nUone watoto wa watoto wako. * Amani iwe juu ya Israeli!"),
            ("ANT. II", "Ant. ya Kawaida: Sasa tangu ujana wangu, wamekuwa wakinisumbua.", 
             "Zab. 129", "Kumtegemea Bwana katika mateso", 
             "Sasa tangu ujana wangu, wamekuwa wakinisumbua. * Sasa tangu ujana wangu, wamekuwa wakinisumbua, lakini hawajanishinda.\nWapalaji wamenichoma migongoni mwangu; * wamefanya alama zao ndefu.\nBwana ni waadilifu; * amekata kamba za watumwa.\nWale wanaomchukia Sayuni * wapate aibishwe na kurudi nyuma.\nWawe kama majani ya paa, * yanayokauka kabla ya kukua.\nMvunaji hawezi kuujaza mkono wake, * wala mfukaji hawezi kuujaza kifua chake.\nWale wanaopita hawakisema: * 'Baraka ya Bwana iwe juu yenu!'\nTunakubariki kwa jina la Bwana."),
            ("ANT. III", "Ant. ya Kawaida: Kutoka kwa kina nimekuomba, Ee Bwana.", 
             "Zab. 130", "Kumtegemea Bwana", 
             "Kutoka kwa kina nimekuomba, Ee Bwana. * Bwana, usikilize sauti yangu!\nMacho yako yatende maono * kwa sauti za maombi yangu!\nLau ungeweka makosa, Ee Bwana, * Bwana, nani angeweza kusimama?\nLakini kwa wewe kuna msamaha, * ili uweze kutukuzwa.\nNinategemea Bwana, nafsi yangu inategemea, * na ninaamini neno lake.\nNafsi yangu inamngojea Bwana * zaidi ya walinzi wanaomngojea asubuhi, zaidi ya walinzi wanaomngojea asubuhi.\nIsraeli mngoje Bwana, * kwa maana kwa Bwana kuna huruma, na kwa yeye kuna ukombozi mwingi.\nNaye atawaokoa Israeli * kutoka kwa makosa yake yote.")
        ]
    }
    
    psalms = psalms_by_week.get(week, psalms_by_week[1])
    
    psalms_html = ""
    for i, (ant_label, ant_text, psalm_ref, psalm_title, psalm_content) in enumerate(psalms, 1):
        psalms_html += f"""        <div class="prayer-section">
            <p class="antiphon">{ant_label}<br>{ant_text}</p>
            
            <h2>{psalm_ref}</h2>
            <p class="psalm-title">{psalm_title}</p>
            
            <p class="verse">{psalm_content.replace(chr(10), '</p><p class="verse">')}</p>
            
            <p class="antiphon">{ant_text}</p>
        </div>

        <hr>
        
"""
    
    # Short reading
    readings = {
        1: ("2Kor. 1:3-4", "Atukuzwe Mungu na Baba ya Bwana wetu Yesu Kristo, Baba wa huruma na Mungu wa kila faraja, ambaye anatutia moyo katika shida zetu zote."),
        2: ("Gal. 6:14", "Lakini mimi, msiweze kujivunia chochote, isipokuwa msalaba wa Bwana wetu Yesu Kristo, ambaye kwa ajili yake ulimwengu umekufa kwangu, na mimi nimekufa kwa ulimwengu."),
        3: ("Efe. 2:4-5", "Lakini Mungu, kwa sababu ya upendo wake mkuu, alipokuwa sisi tukiwa wafu kwa makosa yetu, alitufufua pamoja na Kristo - kwa neema mmesalimika."),
        4: ("Flp. 2:12-13", "Kwa hivyo, enyi wapenzi wangu, kama mmekuwa mtiifu siku zote, si tu wakati nilipokuwa nanyi, lakini sasa zaidi, fanyeni kazi kwa wokovu wenu kwa hofu na mshtuko; kwa maana Mungu ndiye anayefanya kazi ndani yenu.")
    }
    
    reading_ref, reading_text = readings.get(week, readings[1])
    
    # Responsory
    responsory = """        <div class="prayer-section">
            <h2>KIITIKIZANO</h2>
            <p class="leader">K. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
            <p class="response">W. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
            <p class="leader">K. Uwe na huruma kwa watu wako.</p>
            <p class="response">W. Kwa ajili ya jina lako.</p>
            <p class="leader">K. Atukuzwe Baba na Mwana na Roho Mtakatifu.</p>
            <p class="response">W. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
        </div>
        
        <hr>
        
        <div class="prayer-section">
            <h2>SOMO FUPI</h2>
            <div class="reading">
                <p class="verse">{reading_ref}</p>
                <p class="verse">{reading_text}</p>
            </div>
        </div>
        
        <hr>
        
"""
    
    # Concluding prayer
    prayers = {
        1: "Ee Bwana, uwe mwanzo na mwisho wa yote tunayofanya na tunayosema. Kwa neema yako utusaidie katika matendo yetu, na uyakamilishe hayo kwa uwezo wako.",
        2: "Ee Bwana, uwe mwanzo na mwisho wa yote tunayofanya na tunayosema. Kwa neema yako utusaidie katika matendo yetu, na uyakamilishe hayo kwa uwezo wako.",
        3: "Ee Bwana, uwe mwanzo na mwisho wa yote tunayofanya na tunayosema. Kwa neema yako utusaidie katika matendo yetu, na uyakamilishe hayo kwa uwezo wako.",
        4: "Ee Bwana, uwe mwanzo na mwisho wa yote tunayofanya na tunayosema. Kwa neema yako utusaidie katika matendo yetu, na uyakamilishe hayo kwa uwezo wako."
    }
    
    concluding_prayer = prayers.get(week, prayers[1])
    
    return opening + psalms_html + responsory.format(reading_ref=reading_ref, reading_text=reading_text) + f"""        <div class="prayer-section">
            <h2>SALA</h2>
            <p>{concluding_prayer} (Tunaomba hayo) kwa njia ya Bwana wetu. (Kwa njia ya Kristo Bwana wetu.)</p>
        </div>

         <div>
            <h3>Mwisho</h3>
            <p>K. Bwana atubariki, atukinge na movu yote, na atufikishe kwenye uzima wa milele.</p>
             <p>W. Amina.</p>
        </div>"""


# Vespers content structure  
def get_vespers_content(day, week):
    """Generate vespers (evening prayer) content"""
    
    # Opening verse
    opening = """<div class="prayer-section">
            <p class="verse"><strong>Mungu, nisaidie.</strong></p>
            <p class="verse">— Bwana, fanya haraka kunisaidia.</p>
            <p class="verse"><strong>Atukuzwe Baba na Mwana na Roho Mtakatifu:</strong></p>
            <p class="verse">— kama mwanzo, na sasa, na siku zote na milele. Amina.</p>
        </div>
        
        <hr>
        
        <div class="prayer-section">
            <h2>UTENZI</h2>
            <p class="verse">Jua linapozama, tunakusifu, Ee Bwana;</p>
            <p class="verse">mchana unapokwisha, tunakusifu, Ee Mungu wetu.</p>
            <p class="verse">Kwa neema yako, tujalie amani,</p>
            <p class="verse">na uwe na huruma kwa watu wako.</p>
        </div>
        
        <hr>
        
"""
    
    # Vespers psalms by week (first two psalms)
    vespers_psalms_by_week = {
        1: [
            ("ANT. I", "Ant. ya Kawaida: Bwana amewaambia Bwana wangu: 'Keti upande wangu wa kulia.'", 
             "Zab. 110", "Bwana na Mfalme", 
             "Bwana amewaambia Bwana wangu: * 'Keti upande wangu wa kulia, mpaka niwaweke adui zako chini ya miguu yako.'\nBwana atatoa fimbo ya ufalme kutoka Sayuni: * 'Tawala katikati ya adui zako.\nWakati wa nguvu zako, watoto wako watakuja kwa hiari, * kama dew kuanza asubuhi kutoka kwenye tumbo la asubuhi.'\nBwana ameaapa, na hatarejesha neno lake: * 'Wewe ni kuhani milele, kwa namna ya Melkizedeki.'\nBwana upande wako wa kulia * atavunja wafalme siku ya hasira yake.\nAtahukumu mataifa, atajaza maeneo ya wafu; * atavunja vichwa vya wengi katika nchi kubwa.\nAtakunywa kutoka kwenye mto njiani; * kwa hivyo atainua kichwa chake."),
            ("ANT. II", "Ant. ya Kawaida: Heri ya mtu aomchao Bwana, anayependa amri zake sana!", 
             "Zab. 111", "Heri ya kumcha Bwana", 
             "Heri ya mtu aomchao Bwana, * anayependa amri zake sana!\nWatu wake watakuwa na nguvu duniani; * watoto wa waadilifu watabarikiwa.\nUtajiri na ukuu viko ndani ya nyumba yake; * na uadilifu wake unaendelea milele.\nNuru inaangaza kwa waadilifu katika giza; * yeye ni mwenye huruma, mwenye rehema, na waadilifu.\nMtu mwema ana rehema na hutoa; * anahukumu mambo yake kwa haki.\nHata milele hatatetemeka; * waadilifu watakumbukwa milele.\nHataogopa habari mbaya; * moyo wake umeimarika, akitegemea Bwana.\nMoyo wake umeimarika, hataogopa, * mpaka aone adui zake.\nAmetoa kwa maskini; * uadilifu wake unaendelea milele;\nfimbo yake itainuliwa kwa utukufu.\nMtu mwovu ataona na kuudhiwa; * atalisha meno yake na kuyeyuka; matamanio ya watu mwovu yatapotea.")
        ],
        2: [
            ("ANT. I", "Ant. ya Kawaida: Msifuni, enyi watumishi wa Bwana, msifuni jina la Bwana.", 
             "Zab. 112", "Kusifu Bwana", 
             "Msifuni, enyi watumishi wa Bwana, * msifuni jina la Bwana.\nJina la Bwana liwe linasifiwa, * sasa na milele.\nKutoka kwa jua la kuchomoza hata kwa jua la kuchomoza * jina la Bwana liwe linasifiwa.\nBwana ni mkuu juu ya mataifa yote; * utukufu wake ni juu ya mbinguni.\nNani kama Bwana Mungu wetu, * aliye kukaa juu, anayeangalia chini * mbinguni na duniani?\nAnainua maskini kutoka kwenye mavumbi, * anamwinua mnyonge kutoka kwenye takataka,\nili amweke pamoja na wakuu, * pamoja na wakuu wa watu wake.\nAnamweka mke asiye na watoto akiwa na watoto, * mwenye furaha katika nyumba yake.\nMsifuni Bwana, enyi watumishi wa Bwana, * msifuni jina la Bwana."),
            ("ANT. II", "Ant. ya Kawaida: Wakati Israeli alipotoka Misri, nyumba ya Yakobo kutoka kwa watu wenye lugha ya kigeni.", 
             "Zab. 113", "Bwana anasaidia watu wake", 
             "Wakati Israeli alipotoka Misri, * nyumba ya Yakobo kutoka kwa watu wenye lugha ya kigeni,\nYuda ikawa patakatifu kwake, * Israeli ikawa ufalme wake.\nBahari iliona na ikakimbia; * Yordani ilirudi nyuma.\nMilima iliruka kama kondoo, * vilima kama wana-kondoo.\nEe bahari, kwa nini ukimbia? * Ee Yordani, kwa nini urudi nyuma?\nEe milima, kwa nini mraruka kama kondoo? * Ee vilima, kwa nini mraruka kama wana-kondoo?\nTremble, ee dunia, mbele ya Bwana, * mbele ya Mungu wa Yakobo,\nambaye anageuza mwamba kuwa ziwa la maji, * na jiwe kuwa chemchemi za maji.")
        ],
        3: [
            ("ANT. I", "Ant. ya Kawaida: Ninapenda Bwana, kwa sababu amesikia sauti yangu na maombi yangu.", 
             "Zab. 114", "Kumshukuru Bwana", 
             "Ninapenda Bwana, kwa sababu * amesikia sauti yangu na maombi yangu.\nKwa maana ameinamisha sikio lake kwangu * siku zote za maisha yangu.\nMkanda wa mauti umenizunguka, * na mateso ya kuzimu yamenipata;\nNimekuta shida na huzuni. * Niliita jina la Bwana:\n'Ee Bwana, niokoe nafsi yangu!'\nBwana ni mwenye huruma na waadilifu; * Mungu wetu ni mwenye rehema.\nBwana analinda watu wadogo; * nilikuwa dhaifu, nikanisaidia.\nRudi, ee nafsi yangu, kwenye utulivu wako, * kwa maana Bwana amekufanyia mema.\nKwa maana umeokoa nafsi yangu kutoka kwa mauti, * macho yangu kutoka kwa machozi, miguu yangu kutoka kwa kushindwa.\nNitakwenda mbele ya Bwana * katika nchi ya walio hai."),
            ("ANT. II", "Ant. ya Kawaida: Nimeamini, kwa hivyo nimesema: 'Mimi nimeumia sana.'", 
             "Zab. 115", "Kumtegemea Bwana", 
             "Nimeamini, kwa hivyo nimesema: * 'Mimi nimeumia sana.'\nNilisema kwa haraka: * 'Watu wote ni waongo.'\nNini ninaweza kumrudishia Bwana * kwa mema yote aliyonifanyia?\nNitainua kikombe cha wokovu * na kusifu jina la Bwana.\nNitaitimiza nadhiri zangu kwa Bwana * mbele ya watu wake wote.\nMauti ya watakatifu wake * ni ya thamani mbele ya Bwana.\nEe Bwana, hakika mimi ni mtumishi wako; * mimi ni mtumishi wako, mwana wa mjakazi wako.\nUmevunja minyororo yangu.\nNitakuletea dhabihu ya shukrani * na kusifu jina la Bwana.\nNitaitimiza nadhiri zangu kwa Bwana * mbele ya watu wake wote,\nkatika vikundi vya nyumba ya Bwana, * ndani yako, Ee Yerusalemu.")
        ],
        4: [
            ("ANT. I", "Ant. ya Kawaida: Ninaipenda Bwana, kwa sababu amesikia sauti yangu na maombi yangu.", 
             "Zab. 116", "Kumshukuru Bwana", 
             "Ninaipenda Bwana, kwa sababu * amesikia sauti yangu na maombi yangu.\nKwa maana ameinamisha sikio lake kwangu * siku zote za maisha yangu.\nMkanda wa mauti umenizunguka, * na mateso ya kuzimu yamenipata;\nNimekuta shida na huzuni. * Niliita jina la Bwana:\n'Ee Bwana, niokoe nafsi yangu!'\nBwana ni mwenye huruma na waadilifu; * Mungu wetu ni mwenye rehema.\nBwana analinda watu wadogo; * nilikuwa dhaifu, nikanisaidia.\nRudi, ee nafsi yangu, kwenye utulivu wako, * kwa maana Bwana amekufanyia mema.\nKwa maana umeokoa nafsi yangu kutoka kwa mauti, * macho yangu kutoka kwa machozi, miguu yangu kutoka kwa kushindwa.\nNitakwenda mbele ya Bwana * katika nchi ya walio hai."),
            ("ANT. II", "Ant. ya Kawaida: Msifuni Bwana, enyi mataifa yote, msifuni, enyi watu wote!", 
             "Zab. 117", "Kusifu Bwana", 
             "Msifuni Bwana, enyi mataifa yote, * msifuni, enyi watu wote!\nKwa maana upendo wake mkuu umetushukia, * na uaminifu wa Bwana unaendelea milele.")
        ]
    }
    
    psalms = vespers_psalms_by_week.get(week, vespers_psalms_by_week[1])
    
    psalms_html = ""
    for i, (ant_label, ant_text, psalm_ref, psalm_title, psalm_content) in enumerate(psalms, 1):
        psalms_html += f"""        <div class="prayer-section">
            <p class="antiphon">{ant_label}<br>{ant_text}</p>
            
            <h2>{psalm_ref}</h2>
            <p class="psalm-title">{psalm_title}</p>
            
            <p class="verse">{psalm_content.replace(chr(10), '</p><p class="verse">')}</p>
            
            <p class="antiphon">{ant_text}</p>
        </div>

        <hr>
        
"""
    
    # New Testament canticle (varies by day)
    canticles = {
        'jumatatu': ("WIMBO: Kol. 1:12-20", "Kusifu Mungu kwa ukombozi", 
                     "Tunamshukuru Baba, * aliyeuwezesha kushiriki urithi wa watakatifu katika nuru.\nAmetuokoa kutoka kwa ufalme wa giza * na kutuhamisha katika ufalme wa Mwana wake mpenzi,\nambaye katika yeye tuna ukombozi, msamaha wa dhambi.\nYeye ni mfano wa Mungu asiyoonekana, * mzaliwa wa kwanza wa viumbe vyote.\nKwa maana katika yeye vitu vyote viliumbwa, * vilivyo mbinguni na vilivyo duniani, vyaonekana na visiyoonekana.\nYeye ni kabla ya vitu vyote, * na vitu vyote vinaendelea kwa yeye.\nYeye ni kichwa cha mwili, yaani kanisa; * yeye ni mwanzo, mzaliwa wa kwanza kutoka wafu,\nili awe mkuu katika vitu vyote.\nKwa maana Mungu alipendezwa kukaa ndani yake yote, * na kwa yeye kurekebisha vitu vyote kwake,\nkufanya amani kwa damu ya msalaba wake, * kwa yeye, iwe vitu vilivyo duniani au vilivyo mbinguni."),
        'jumanne': ("WIMBO: Efe. 1:3-10", "Baraka za Mungu", 
                    "Atukuzwe Mungu na Baba ya Bwana wetu Yesu Kristo, * ambaye ametubariki kwa baraka zote za kiroho katika mbinguni katika Kristo.\nKama alivyotuchagua ndani yake kabla ya kuumbwa kwa ulimwengu, * ili tuwe watakatifu na wasio na hatia mbele yake katika upendo.\nAlituamua mapema kuwa watoto wake kwa kupitia Yesu Kristo, * kwa mapenzi yake mwenyewe,\nili sifa ya neema yake itukuzwe, * neema ambaye ametupa katika Mpenzi wake.\nKatika yeye tuna ukombozi kwa damu yake, msamaha wa makosa, * kwa utajiri wa neema yake ambaye ametujalia kwa hekima na busara.\nAlitufunulia siri ya mapenzi yake, * kwa mapenzi yake aliyoamua mapema katika yeye,\nkwa ajili ya utimilifu wa nyakati, * kuleta vitu vyote pamoja katika Kristo, vitu vilivyo mbinguni na vilivyo duniani."),
        'jumatano': ("WIMBO: Flp. 2:6-11", "Kumtukuza Kristo", 
                      "Kristo Yesu, ingawa alikuwa na umbo la Mungu, * hakujidhani kuwa sawa na Mungu ni kitu cha kushikilia kwa nguvu.\nBadala yake, alijinyenyekea mwenyewe, * akichukua umbo la mtumwa, akifanana na wanadamu.\nAkiwa katika umbo la mwanadamu, * alijinyenyekea mwenyewe, akitii hata mauti, hata mauti ya msalaba.\nKwa hivyo Mungu alimwinua juu * na kumpa jina ambalo ni juu ya majina yote,\nili katika jina la Yesu kila goti lipige magoti * mbinguni na duniani na chini ya dunia,\nna kila ulimi ukiri kwamba Yesu Kristo ni Bwana, * kwa utukufu wa Mungu Baba."),
        'alhamisi': ("WIMBO: 1Tim. 3:16", "Siri ya ujamaa", 
                     "Hakika, ukuu wa ufichuo wa ujamaa ni ukuu: * Kristo alionekana katika mwili, akithibitishwa katika roho.\nAkaonekana kwa malaika, * akihubiriwa kwa mataifa, akiaminiwa ulimwenguni, akichukuliwa juu katika utukufu."),
        'ijumaa': ("WIMBO: 1Pet. 2:21-24", "Mfano wa Kristo", 
                   "Kristo aliteseka kwa ajili yenu, * akiwaacha mfano ili mfuate nyayo zake.\n'Hakufanya dhambi, wala hakupatikana udanganyifu katika mdomo wake.'\nAlipolaniwa, hakulani; * alipoteseka, hakutishia;\nbadala yake, alijisalimisha kwa yeye anayeamua kwa haki.\nAlichukua dhambi zetu mwilini mwake * kwenye mti, ili tukiwa wafu kwa dhambi, tuweze kuishi kwa uadilifu.\nKwa majeraha yake mmeponywa."),
        'jumamosi': ("WIMBO: Ufu. 15:3-4", "Wimbo wa Musa na Mwana Kondoo", 
                     "Waimba wimbo wa Musa, mtumishi wa Mungu, * na wimbo wa Mwana Kondoo, wakisema:\n'Maajabu ni makuu na mengi, Ee Bwana Mungu Mwenyezi! * Njia zako ni za haki na zaaminifu, Ee Mfalme wa mataifa!\nNani hatakuogopa, Ee Bwana, * na kukutukuza jina lako?\nKwa maana wewe peke yako ni mtakatifu; * mataifa yote yatakuja na kusujudu mbele yako,\nkwa maana hukumu zako zimeonekana.'"),
        'jumapili': ("WIMBO: Ufu. 4:11; 5:9-10, 12", "Kusifu Mungu", 
                     "Unastahili, Ee Bwana wetu na Mungu wetu, * kupokea utukufu na heshima na nguvu,\nkwa sababu wewe ndiye uliyeumba vitu vyote, * na kwa mapenzi yako vilikuwepo na vikaumbwa.\nUnastahili kuchukua kitabu * na kufungua muhuri wake,\nkwa maana umeuawa, * na kwa damu yako umewanunua watu kwa Mungu\nkutoka kila kabila na lugha na watu na taifa, * na umewafanya ufalme na makuhani kwa Mungu wetu;\nna watatawala juu ya dunia.\nUnastahili, Ee Mwana Kondoo, * kupokea nguvu na utajiri na hekima na uweza\nna heshima na utukufu na baraka!")
    }
    
    canticle_ref, canticle_title, canticle_text = canticles.get(day, canticles['jumatatu'])
    
    # Short reading
    readings = {
        1: ("1Pet. 5:8-9a", "Kuwa na uangalifu! Adui yenu, shetani, huzunguka kama simba mwenye njaa, akitafuta nani amweze kumeza. Msimkabili kwa imani thabiti."),
        2: ("Efe. 4:26-27", "Ikiwa mna hasira, iwe bila dhambi. Jua lisizame kwa hasira yenu; msipe nafasi ya shetani."),
        3: ("Kol. 3:16", "Neno la Kristo likae ndani yenu kwa wingi, kwa hekima yote. Jifundisheni na kujiongeza kwa zaburi, nyimbo, na wimbo wa kiroho, kwa neema kumshukuru Mungu katika mioyo yenu."),
        4: ("1Tes. 5:16-18", "Furahini daima. Ombeni bila kukoma. Shukuru katika hali zote, kwa maana hii ndiyo mapenzi ya Mungu kwenu katika Kristo Yesu.")
    }
    
    reading_ref, reading_text = readings.get(week, readings[1])
    
    # Magnificat (Canticle of Mary)
    magnificat_antiphons = {
        1: "Ant. ya Kawaida: Mungu amemwinua maskini kutoka kwenye mavumbi.",
        2: "Ant. ya Kawaida: Mungu amemwinua maskini kutoka kwenye mavumbi.",
        3: "Ant. ya Kawaida: Mungu amemwinua maskini kutoka kwenye mavumbi.",
        4: "Ant. ya Kawaida: Mungu amemwinua maskini kutoka kwenye mavumbi."
    }
    
    magnificat_ant = magnificat_antiphons.get(week, magnificat_antiphons[1])
    
    return opening + psalms_html + f"""        <div class="prayer-section">
            <p class="antiphon">{magnificat_ant}</p>
            
            <h2>{canticle_ref}</h2>
            <p class="psalm-title">{canticle_title}</p>
            
            <p class="verse">{canticle_text.replace(chr(10), '</p><p class="verse">')}</p>
            
            <p class="antiphon">{magnificat_ant}</p>
        </div>

        <hr>
        
        <div class="prayer-section">
            <h2>SOMO FUPI</h2>
            <div class="reading">
                <p class="verse">{reading_ref}</p>
                <p class="verse">{reading_text}</p>
            </div>
        </div>
        
        <hr>
        
        <div class="prayer-section">
            <h2>KIITIKIZANO</h2>
            <p class="leader">K. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
            <p class="response">W. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
            <p class="leader">K. Uwe na huruma kwa watu wako.</p>
            <p class="response">W. Kwa ajili ya jina lako.</p>
            <p class="leader">K. Atukuzwe Baba na Mwana na Roho Mtakatifu.</p>
            <p class="response">W. Utuokoe, Ee Bwana, kwa ajili ya jina lako.</p>
        </div>
        
        <hr>
        
        <div class="prayer-section">
            <p class="antiphon">{magnificat_ant}</p>
            
            <h2>WIMBO WA MARIA (MAGNIFICAT)</h2>
            <p class="verse">Nafsi yangu inamtukuza Bwana, * na roho yangu inafurahi kwa Mungu Mwokozi wangu,</p>
            <p class="verse">kwa maana ameangalia unyonge wa mtumishi wake. * Tazama, tangu sasa mataifa yote yataniita mwenye heri,</p>
            <p class="verse">kwa maana Mwenyezi Mungu amenifanyia makuu. * Jina lake ni takatifu,</p>
            <p class="verse">na huruma yake ni kwa wale wanaomcha * kutoka kizazi hadi kizazi.</p>
            <p class="verse">Ameonyesha nguvu za mkono wake; * amewavunja wenye kiburi katika nia za mioyo yao.</p>
            <p class="verse">Ameushuka wenye uweza kutoka viti vyao, * na amewainua wanyonge.</p>
            <p class="verse">Amejaza wenye njaa mema, * na amewaondoa matajiri wakiwa wazi mikono.</p>
            <p class="verse">Ameisaidia Israeli mtumishi wake, * akikumbuka huruma yake,</p>
            <p class="verse">kama alivyoahidi baba zetu, * Ibrahimu na uzao wake milele.</p>
            <p class="verse">Atukuzwe Baba na Mwana na Roho Mtakatifu, * kama mwanzo, na sasa, na siku zote na milele. Amina.</p>
            
            <p class="antiphon">{magnificat_ant}</p>
        </div>

        <hr>
        
        <div class="prayer-section">
            <h2>MAOMBI</h2>
            <p class="leader">Tumsifu Kristo ambaye alituokoa kwa damu yake, na kutuunganisha na Mungu.</p>
            <p class="response">W. Utujalie neema yako, Ee Bwana.</p>
            
            <div class="intercession">
                <p>Twakusifu wewe Bwana,</p>
                <p class="intercession-response">— na tunakushukuru kwa baraka zako. (W.)</p>
                
                <p>Utujalie amani na utulivu;</p>
                <p class="intercession-response">— utujalie raha na faraja. (W.)</p>
                
                <p>Uwe nao wote wanaohitaji sala zetu,</p>
                <p class="intercession-response">— na uwajalie mahitaji yao yote. (W.)</p>
                
                <p>Utulinde usiku huu,</p>
                <p class="intercession-response">— na utupe usingizi wa amani. (W.)</p>
            </div>
            
            <h3>Baba Yetu</h3>
            <p>Baba yetu uliye mbinguni, jina lako litukuzwe
                ufalme wako ufike, utakalo lifanyike duniani kama mbinguni
                utupe leo mkate wetu wa kila siku, Utusamehe makosa yetu,
                kama tunavyowasamehe waliotukosea.
                usitutie katika vishawishi, lakini utuokoe maovuni.</p>
            
            <h2>SALA</h2>
            <p>Ee Bwana, uwe mwanzo na mwisho wa yote tunayofanya na tunayosema. Kwa neema yako utusaidie katika matendo yetu, na uyakamilishe hayo kwa uwezo wako. (Tunaomba hayo) kwa njia ya Bwana wetu. (Kwa njia ya Kristo Bwana wetu.)</p>
        </div>

         <div>
            <h3>Mwisho</h3>
            <p>K. Bwana atubariki, atukinge na movu yote, na atufikishe kwenye uzima wa milele.</p>
             <p>W. Amina.</p>
        </div>"""


# Main script to update all files
def main():
    pages_dir = "pages"
    
    # Update all midday files
    for day_key, day_name in days.items():
        for week in [1, 2, 3, 4]:
            filename = f"{pages_dir}/{day_key}{week}-saa-sita.html"
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find and replace the prayer content section
                # Look for content between <h1> and the closing </div> before <script>
                pattern = r'(<h1>JUMA \d+: [A-Z]+<br>SALA YA MCHANA \(SAA SITA\)</h1>)(.*?)(<script>)'
                replacement = r'\1\n        \n' + get_midday_content(day_key, week) + '\n    </div>\n    \n    \n    <script>'
                
                new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
    
    # Update all vespers files
    for day_key, day_name in days.items():
        for week in [1, 2, 3, 4]:
            filename = f"{pages_dir}/{day_key}{week}-jioni.html"
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find and replace the prayer content section
                pattern = r'(<h1>JUMA \d+: [A-Z]+<br>MASIFU YA JIONI</h1>)(.*?)(<script>)'
                replacement = r'\1\n        \n' + get_vespers_content(day_key, week) + '\n    </div>\n    \n    \n    <script>'
                
                new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
                
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
    
    print("\nAll files updated successfully!")


if __name__ == "__main__":
    main()

