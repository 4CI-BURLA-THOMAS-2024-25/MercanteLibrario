"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// importo classe Copia nel "main"
var Libro_1 = require("./Libro");
//associo listener alla casella di ricerca,se non è null ed è definita
var casellaRicerca = document.getElementById("casellaRicerca");
casellaRicerca === null || casellaRicerca === void 0 ? void 0 : casellaRicerca.addEventListener("keydown", ricercaLibri);
//creo array di oggetti libro
var elencoLibri = [];
//funzione per creare array con elenco completo libri
function mostraElencoCompletoLibri() {
    //contatore
    var i = 0;
    //riempio array di Libro
    elencoLibri[i++] = new Libro_1.Libro("DIRITTO ED ECONOMIA", "9788823367739", "D'AMELIO MARIA GIOVANNA", "FUTURO IN TASCA (IL) - LIBRO MISTO CON LIBRO DIGITALE  CORSO DI DIRITTO ED ECONOMIA PER IL PRIMO BIENNIO - VOLUME UNICO", "U", "TRAMONTANA", "25,3", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("DIRITTO ED ECONOMIA", "9788861603820", "MARIA RITA CATTANI", "NUOVO SISTEMA DIRITTO APP - DIRITTO COMMERCIALE (IL)", "2", "PARAMOND", "33,5", "4");
    elencoLibri[i++] = new Libro_1.Libro("DIRITTO ED ECONOMIA", "9788861604711", "CATTANI MARIA RITA, GUZZI CLAUDIO", "SISTEMA DIRITTO SECONDA EDIZIONE - SECONDO BIENNIO  CORSO DI DIRITTO", "U", "PARAMOND", "43,2", "3");
    elencoLibri[i++] = new Libro_1.Libro("DIRITTO ED ECONOMIA", "9788891420091", "AVOLIO ALESSANDRA", "TRASPORTI LOGISTICA LEGGI E MERCATI DIRITTO ED ECONOMIA PER SECONDO BIENNIO E QUINTO ANNO ARTICOL LOGISTICA", "U", "SIMONE PER LA SCUOLA", "28", "5");
    elencoLibri[i++] = new Libro_1.Libro("ELETTROTECNICA ED ELETTRONICA", "9788823373266", "AMBROSINI ENRICO, SPADARI FILIPPO", "ELETTROTECNICA ED ELETTRONICA VOLUME 1", "1", "TRAMONTANA", "30,2", "3");
    elencoLibri[i++] = new Libro_1.Libro("ELETTROTECNICA ED ELETTRONICA", "9788820378493", "CONTE GAETANO, IMPALLOMENI EMANUELE", "ELETTROTECNICA, ELETTRONICA E AUTOMAZIONE NUOVA EDIZIONE OPENSCHOOL PER IL SECONDO BIENNIO DELL'INDIRIZZO TRASPORTI E LOGISTICA", "U", "HOEPLI", "35,4", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("ELETTROTECNICA ED ELETTRONICA", "9788823342002", "AMBROSINI, SPADARI", "ELETTROTECNICA ED ELETTRONICA 2 CON OPENBOOK VOLUME 2 + OPENBOOK", "2", "TRAMONTANA", "31,4", "4");
    elencoLibri[i++] = new Libro_1.Libro("ELETTROTECNICA ED ELETTRONICA", "9788823346000", "AMBROSINI, SPADARI", "ELETTROTECNICA ED ELETTRONICA 3 CON OPENBOOK VOLUME 3 + OPENBOOK", "3", "TRAMONTANA", "35,1", "5");
    elencoLibri[i++] = new Libro_1.Libro("GEOGRAFIA", "9788851187477", "BIANCHI S KOEHLER R", "GEOBASE-CORSO DI GEOGRAFIA GENERALE ED ECONOMICA PER IST.TECNICI PROFESS. VOLUME BASE+ EBOOK", "U", "DE AGOSTINI", "13,25", "2");
    elencoLibri[i++] = new Libro_1.Libro("GESTIONE PROGETTO E ORGANIZZAZIONE D'IMPRESA", "9788874858323", "IACOBELLI CESARE, COTTONE MARIO, GAIDO ELENA", "DALL'IDEA ALLA STARTUP VOLUME UNICO", "U", "JUVENILIA", "29,4", "5");
    elencoLibri[i++] = new Libro_1.Libro("INFORMATICA", "9788826821887", "LORENZI AGOSTINO, RIZZI ANDREA", "PRO.TECH B", "2", "ATLAS", "28,2", "4");
    elencoLibri[i++] = new Libro_1.Libro("INFORMATICA", "9788836007745", "CAMAGNI PAOLO, NIKOLASSY RICCARDO", "CORSO DI INFORMATICA SQL & PHP  PERCORSI MODULARI PER LINGUAGGI DI PROGRAMMAZIONE", "U", "HOEPLI", "29,9", "5");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788844119836", "ROBBA MARGHERITA, FAGGIANI MARIA LETIZIA", "NEW MECHWAYS - ENGLISH FOR MECHANICS, MECHATRONICS AND ENERGY", "U", "EDISCO", "25,8", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788861618176", "SBOLOGNINI, B C BARBER, KO'MALLEY", "CAREER PATHS IN TECHNOLOGY ELECTRICITY AND ELECTRONICSÂ INFORMATION TECHNOLOGY AND TELECOMMUNICATIONS", "U", "LANG EDIZIONI", "27,7", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788883394485", "AA VV", "MY VOICE A2/B1", "U", "PEARSON LONGMAN", "29,9", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788883394492", "AA VV", "MY VOICE B1/B1+", "U", "PEARSON LONGMAN", "29,9", "2");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788883395994", "AA VV", "MY VOICE B2", "U", "PEARSON LONGMAN", "33,9", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("INGLESE", "9788899673154", "GUALANDRI, CANELLINI", "ALL ABOUT LOGISTICS PLUS + CD AUDIO 50241  STORAGE & DELIVERY", "U", "TRINITY WHITEBRIDGE", "18,5", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO ANTOLOGIE E STORIA LETTERATURA", "9788830206779", "SAMBUGAR MARTA, SALA' GABRIELLA", "CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOLUME 3A + VOLUME 3B + FASCICOLO 5° ANNO", "3", "LA NUOVA ITALIA EDITRICE", "55,6", "5");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO ANTOLOGIE E STORIA LETTERATURA", "9788830206793", "SAMBUGAR MARTA, SALA' GABRIELLA", "CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOL 1+LABORATORIO 3° 4° ANNO+DIVINA COMMEDIA+INVALSI", "1", "LA NUOVA ITALIA EDITRICE", "43,8", "3");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO ANTOLOGIE E STORIA LETTERATURA", "9788830212428", "SAMBUGAR MARTA, SALA' GABRIELLA", "CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOL 2 CON LEOPARDI+LABORATORIO 3° 4° ANNO", "2", "LA NUOVA ITALIA EDITRICE", "45,4", "4");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO ANTOLOGIE", "9788869109225", "SIMONA BRENNA, DANIELE DACCO", "STORIE IN TASCA - NARRATIVA CON VEDERE LE STORIE", "U", "B.MONDADORI", "25,7", "1");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO ANTOLOGIE", "9788869109263", "SIMONA BRENNA, DANIELE DACCO", "STORIE IN TASCA - POESIA E TEATRO CON ANTOLOGIA DEI PROMESSI SPOSI", "U", "B.MONDADORI", "24,5", "2");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO EPICA", "9788869109348", "SIMONA BRENNA, DANIELE DACCO", "STORIE IN TASCA - MITO ED EPICA", "U", "B.MONDADORI", "13,6", "1");
    elencoLibri[i++] = new Libro_1.Libro("ITALIANO GRAMMATICA", "9791254550106", "SAVIGLIANO C", "GRAMMATUTOR - PER PARLARE E SCRIVERE BENE  VOLUME BASE + LABORATORIO DELLE COMPETENZE + EBOOK", "U", "GARZANTI SCUOLA", "28,1", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("LOGISTICA", "9788836007943", "DALLARI FABRIZIO", "CORSO DI LOGISTICA E TRASPORTI  ELEMENTI DI BASE, SOLUZIONI TECNICHE E MODELLI OPERATIVI", "1", "HOEPLI", "32,9", "3");
    elencoLibri[i++] = new Libro_1.Libro("LOGISTICA", "9788836012275", "DALLARI FABRIZIO, COSSU ELENA", "CORSO DI LOGISTICA E TRASPORTI  ORGANIZZAZIONE E GESTIONE DELLA SUPPLY CHAIN E DELLA SICUREZZA", "2", "HOEPLI", "32,9", "4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("MATEMATICA", "9788849422979", "SASSO LEONARDO, ZOLI ENRICO", "COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 3 + EBOOK +  STATISTICA E CALCOLO DELLE PROBABILITÀ", "1", "PETRINI", "41,85", "3");
    elencoLibri[i++] = new Libro_1.Libro("MATEMATICA", "9788849422986", "SASSO LEONARDO, ZOLI ENRICO", "COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 4 + EBOOK +", "2", "PETRINI", "31", "4");
    elencoLibri[i++] = new Libro_1.Libro("MATEMATICA", "9788849422993", "SASSO LEONARDO, ZOLI ENRICO", "COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 5 + EBOOK +", "3", "PETRINI", "28,65", "5");
    elencoLibri[i++] = new Libro_1.Libro("MATEMATICA", "9788849425215", "SASSO L ZOLI E", "TUTTI I COLORI DELLA MATEMATICA - EDIZIONE VERDE - PRIMO BIENNIO  VOLUME 1 + QUADERNO DI INCLUSIONE E RECUPERO 1 + EBOOK", "1", "PETRINI", "35,65", "1");
    elencoLibri[i++] = new Libro_1.Libro("MATEMATICA", "9788849425222", "SASSO L ZOLI E", "TUTTI I COLORI DELLA MATEMATICA - EDIZIONE VERDE - PRIMO BIENNIO  VOLUME 2 + QUADERNO DI INCLUSIONE E RECUPERO 2 + EBOOK", "2", "PETRINI", "36,2", "2");
    elencoLibri[i++] = new Libro_1.Libro("MECCANICA", "9788820383329", "AA VV", "MANUALE DEL MANUTENTORE", "U", "HOEPLI", "76,9", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("RELIGIONE", "9788839303394", "CERA T, FAMA' A", "STRADA CON L'ALTRO (LA) - VOLUME UNICO LEZIONI E PERCORSI + EBOOK", "U", "MARIETTI SCUOLA", "19,35", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("RELIGIONE", "9788839303943", "CERA T, FAMA A, SORICE O", "STRADA CON L'ALTRO - EDIZIONE VERDE (LA)  VOLUME UNICO + UDA MULTIDISCIPLINARI DI EDUCAZIONE CIVICA E IRC + EBOOK", "U", "MARIETTI SCUOLA", "18,75", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("SCIENZE DELLA NAVIGAZIONE", "9788836015221", "DALLARI FABRIZIO, COSSU ELENA", "CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI, NORMATIVA E COMMERCIO INTERNAZIONALE", "3", "HOEPLI", "32,9", "3");
    elencoLibri[i++] = new Libro_1.Libro("SCIENZE DELLA TERRA", "9788808690913", "LUPIA PALMIERI ELVIDIO, PAROTTO MAURIZIO", "SCIENZE DELLA TERRA 4ED. - VOL. U (LDM)", "U", "ZANICHELLI EDITORE", "23,9", "1");
    elencoLibri[i++] = new Libro_1.Libro("SCIENZE INTEGRATE (CHIMICA)", "9788823365957", "CORDIOLI DORIANO", "CHIMICA PRATICA - LIBRO MISTO CON LIBRO DIGITALE  VOLUME UNICO PER IL BIENNIO", "U", "TRAMONTANA", "36,9", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("SCIENZE INTEGRATE (FISICA)", "9788863648850", "WALKER", "FISICA DI WALKER (LA) - VOLUME UNICO", "U", "LINX", "39,1", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("SCIENZE INTEGRATE (SCIENZE DELLA TERRA E BIOLOGIA)", "9788808554055", "LUPIA PALMIERI ELVIDIO, PAROTTO MAURIZIO, SARACENI S, STRUMIA G", "SCIENZE NATURALI 3ED. - BIOLOGIA (LDM) DI SILVIA SARACENI E GIORGIO STRUMIA", "U", "ZANICHELLI EDITORE", "22,5", "2");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI AUTOMATICI", "9788820394844", "CERRI FABRIZIO, ORTOLANI GIULIANO, VENTURI EZIO", "NUOVO CORSO DI SISTEMI AUTOMATICI  PER LE ARTICOLAZIONI ELETTROTECNICA, ELETTRONICA E AUTOMAZIONE DEGLI ISTITUT", "1", "HOEPLI", "31,9", "3");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI AUTOMATICI", "9788820394851", "CERRI FABRIZIO, ORTOLANI GIULIANO, VENTURI EZIO", "NUOVO CORSO DI SISTEMI AUTOMATICI  PER LE ARTICOLAZIONI ELETTROTECNICA, ELETTRONICA E AUTOMAZIONE DEGLI ISTITUT", "2", "HOEPLI", "31,9", "4");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI AUTOMATICI", "9788836003785", "CERRI FABRIZIO, ORTOLANI GIULIANO, VENTURI EZIO", "NUOVO CORSO DI SISTEMI AUTOMATICI  PER L'ARTICOLAZIONE ELETTRONICA DEGLI ISTITUTI TECNICI SETTORE TECNOLOGICO", "3", "HOEPLI", "32,9", "5");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI E RETI", "9788849423266", "ANELLI S, MACCHI P, ANGIANI G, ZICCHIERI G", "GATEWAY - SISTEMI E RETI SECONDA EDIZIONE - VOLUME 2 + EBOOK", "2", "PETRINI", "21,2", "4");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI E RETI", "9788849423273", "ANELLI S, MACCHI P, ANGIANI G, ZICCHIERI G", "GATEWAY - SISTEMI E RETI SECONDA EDIZIONE - VOLUME 3 + EBOOK- IN PREPARAZIONE", "3", "PETRINI", "22,55", "5");
    elencoLibri[i++] = new Libro_1.Libro("SISTEMI E RETI", "9788849426403", "ANELLI S, MACCHI P", "GATEWAY TERZA EDIZIONE + EBOOK VOLUME 1 PER IL III ANNO + EBOOK", "1", "PETRINI", "21,5", "3");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788805076659", "FELTRI FRANCESCO MARIA, BERTAZZONI MARIA MANUELA, NERI FRANCA", "SCENARI 3 NOVECENTO E XXI SECOLO", "3", "SEI", "35,6", "5");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788822197320", "BRANCATI ANTONIO, PAGLIARANI TREBI", "STORIA IN MOVIMENTO LIBRO MISTO CON LIBRO DIGITALE  VOLUME 3, LAVORARE CON LA STORIA 3", "3", "LA NUOVA ITALIA EDITRICE", "31,7", "5");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788835055204", "GENTILE, RONGA, ROSSI", "FUCINA DI VULCANO - VOLUME 1 (LA)  CORSO DI STORIA ED EDUCAZ.CIVICA", "1", "LA SCUOLA EDITRICE", "25,1", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788835055211", "GENTILE, RONGA, ROSSI", "FUCINA DI VULCANO - VOLUME 2 (LA)  CORSO DI STORIA ED EDUCAZ.CIVICA", "2", "LA SCUOLA EDITRICE", "25,1", "2");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788839538864", "GIOVANNI DE LUNA, MARCO MERIGGI", "VALORE STORIA 1 DALL'ANNO MILLE ALLA METÀ DEL SEICENTO", "1", "PARAVIA", "34,9", "3");
    elencoLibri[i++] = new Libro_1.Libro("STORIA", "9788839538871", "GIOVANNI DE LUNA, MARCO MERIGGI", "VALORE STORIA 2 DALLA METÀ DEL SEICENTO ALLA FINE DELL'OTTOCENTO", "2", "PARAVIA", "38,3", "4");
    elencoLibri[i++] = new Libro_1.Libro("STRUTTURA, COSTRUZIONE, SISTEMI E IMPIANTI", "9788884883148", "AA VV", "TECNICA DELL'AUTOMOBILE MANUALE DI TECNOLOGIA DEI VEICOLI A MOTORE", "U", "SAN MARCO", "42", "3 - 4 - 5");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE E PROGETTAZIONE DI SISTEMI INFO", "9788836011728", "CAMAGNI PAOLO, NIKOLASSY RICCARDO", "TECNOLOGIE E PROGETTAZIONE DI SISTEMI INFORMATICI E DI TELECOMUNICAZION  PER L'ARTICOLAZIONE INFORMATICA DEGLI ISTITUTI TECNICI SETTORE TECNOLOGICO", "1", "HOEPLI", "25,9", "3");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE E PROGETTAZIONE", "9788823357150", "BOVE ENEA, PORTALURI GIORGIO", "TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI - LIBRO MISTO  ART. ELETTRONICA - VOL. 1 + HUB YOUNG + HUB KIT", "1", "TRAMONTANA", "37", "3");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE E PROGETTAZIONE", "9788823357983", "BOVE ENEA, PORTALURI GIORGIO", "TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI  ART. ELETTRONICA - VOL. 2 + HUB YOUNG + HUB KIT", "2", "TRAMONTANA", "31,9", "4");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE E PROGETTAZIONE", "9788823357990", "BOVE ENEA, PORTALURI GIORGIO", "TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI  ART. ELETTRONICA - VOL. 3 + HUB YOUNG + HUB KIT", "3", "TRAMONTANA", "31,9", "5");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE E TECNICHE DI RAPPRESENT.GRAFICA", "9788841651780", "ZANIN ALBINO, BALDISSERI GIORGIO", "TECNOGRAFICA + DISEGNO + TECNOLOGIA", "U", "PRINCIPATO", "27,9", "1 - 2");
    elencoLibri[i++] = new Libro_1.Libro("TECNOLOGIE INFORMATICHE", "9788820372279", "BOSCAINI MAURIZIO, LUGHEZZANI FLAVIA, PRINCIVALLE DANIELA", "MASTERMIND PENSARE - PROGRAMMARE - CONDIVIDERE. INFORMATICA PER IL PRIMO BIENNIO", "U", "HOEPLI", "24,4", "1");
    elencoLibri[i++] = new Libro_1.Libro("TELECOMUNICAZIONI", "9788808159304", "BERTAZIOLI ONELIO", "CORSO DI TELECOMUNICAZIONI 1 (LMS LIBRO MISTO SCARICABILE)  RETI ELETTRICHE. FOND. ELETTRONICA DIGITALE. NOZIONI SIST. TELECOMUNICAZIONI", "1", "ZANICHELLI EDITORE", "31,4", "3");
    elencoLibri[i++] = new Libro_1.Libro("TELECOMUNICAZIONI", "9788808228628", "BERTAZIOLI ONELIO", "CORSO DI TELECOMUNICAZIONI 2 (LIBRO MISTO SCARICABILE) MEZZI TRASMISSIVI. ELETTRONICA PER TELECOMUNICAZIONI. RETE TELEFONICA", "2", "ZANICHELLI EDITORE", "42,7", "4");
    elencoLibri[i++] = new Libro_1.Libro("TELECOMUNICAZIONI", "9788808834997", "BERTAZIOLI ONELIO", "CORSO DI TELECOMUNICAZIONI - VOL 3 + RISORSE SCUOLABOOK PER TELECOM. RETI, SIST. E APP. TELECOMUNICAZIONI DIGITALI DI N. GENERAZIONE", "3", "ZANICHELLI EDITORE", "44,6", "5");
    elencoLibri[i++] = new Libro_1.Libro("TELECOMUNICAZIONI", "9788823357037", "AMBROSINI ENRICO, PERLASCA IPPOLITO, MAINI PIERPAOLO", "TELECOMUNICAZIONI - LIBRO MISTO CON HUB LIBRO YOUNG  VOL. + HUB YOUNG + HUB KIT", "U", "TRAMONTANA", "36,5", "4");
    // chiamo funzione per mostrare l'array di libri
    mostraLibri(elencoLibri);
}
//funziona per mostrare a tabella un elenco di libri, passato come array di oggetti Libro
function mostraLibri(elencoLibri) {
    //prelevo reference della tabella html
    var corpoTabella = document.getElementById("corpoTabellaLibri"); //indico a TS di trattare l'HTMLElement prelevato come un tbody
    //svuoto tabella
    corpoTabella.innerHTML = "";
    var _loop_1 = function (i) {
        var libro = elencoLibri[i];
        var riga = document.createElement("tr");
        riga.innerHTML = "<td>".concat(libro.materia, "</td><td>").concat(libro.isbn, "</td><td>").concat(libro.autore, "</td><td>").concat(libro.titolo, "</td><td>").concat(libro.volume, "</td><td>").concat(libro.editore, "</td><td>").concat(libro.prezzoListino, "</td><td>").concat(libro.classe, "</td><td>").concat(libro.getNCopie(), "</td>");
        // creo bottone per gestire le copie di ciascun libro (di ciascuna riga della tabella)
        var bottone = document.createElement("button");
        // aggiungo testo al bottone
        bottone.textContent = "Gestisci copie";
        // associo ascoltatore e passo riga
        bottone.addEventListener("click", function () { return mostraCopieLibro(riga); });
        // aggiungo cella alla riga
        var cella = riga.insertCell();
        // inserisco bottone nella cella
        cella.appendChild(bottone);
        // inserisco riga nel corpo della tabella
        corpoTabella.appendChild(riga);
    };
    //stampo riga per riga
    for (var i = 0; i < elencoLibri.length; i++) {
        _loop_1(i);
    }
}
//funzione che ricerca tra i libri e mostra quelli che soddisafno il criterio di ricerca
function ricercaLibri() {
    var criterioRicerca;
    //libro con gli oggetti corrispondenti al criterio di ricerca
    var risultatiRicerca = [];
    //leggo dalla casella di ricerca, se non è null ed è definita e la assegno se non è vuota
    if (casellaRicerca && (casellaRicerca.value.trim() != undefined)) {
        //ricerca case unsensitive, tutto minuscolo
        criterioRicerca = casellaRicerca.value.toLowerCase();
        //array che contiene i libri corrispondenti al campo di ricerca
        for (var i = 0; i < elencoLibri.length; i++) {
            //se tra gli attributi del libro compare il criterio di ricerca...
            if ((elencoLibri[i].toString().toLowerCase()).includes(criterioRicerca)) {
                //salvo il libro nell'array che contiene i libri corrispondenti alla ricerca
                risultatiRicerca.push(elencoLibri[i]);
            }
        }
        //passo nuova lista libri e la visualizzo
        mostraLibri(risultatiRicerca);
        //con campo di ricerca vuoto, mostra lista completa
    }
    else {
        mostraLibri(elencoLibri);
    }
}
// funzione per mostrare la pagina, in popup, con le copie del libro che ho cliccato nella tabella
function mostraCopieLibro(riga) {
    // prelevo indice della riga del libro di cui voglio visualizzare le copie
    var indiceRiga = riga.rowIndex - 1;
    // apro finestra per visualizzare le copie
    var paginaGestoreCopie = window.open("html/popupGestoreCopie.html", "_blank", "menubar=no");
    //prelevo reference del libro con cui sto operando
    var libro = elencoLibri[indiceRiga];
    // attendo che la nuova finestra si carichi e poi passo oggetto libro
    if (paginaGestoreCopie) {
        window.setTimeout(function () {
            // passo oggetto alla nuovba finestra
            paginaGestoreCopie.postMessage(libro, "*");
        }, 1000);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    //chiamata funzione a inizio pagina
    mostraElencoCompletoLibri();
});
