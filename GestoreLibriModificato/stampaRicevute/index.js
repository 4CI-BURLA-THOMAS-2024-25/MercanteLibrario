    class Customer {
    // Costruttore
    constructor(name, surname, phoneNumb){
        this.name = name
        this.surname = surname
        this.phoneNumb = phoneNumb
        this.saldo = 0.0
    }

    toString(){
        return this.name+","+ this.surname+ "," + this.phoneNumb + "," + this.saldo
    }
}


class Book {
    // Construttore
    constructor(properties) {
       this.materia = properties[0] 
       this.codice = properties[1]
       this.autore = properties[2]
       this.titolo = properties[3]
       this.proprietario = new Customer();
       this.numeroSerie = 0;
       this.prezzo = Number(properties[7])
       this.percentualeDiRivendita = 0.0;
    }


    toString(){
        return this.materia + ", "  + this.autore  + ", "+ this.titolo + ", " + this.prezzo
    }
        
}

// Array contenente i libri
const initialData = [
    ["Materia/Disciplina,Codice Volume,Autore/Curatore/Traduttore,Titolo / Sottotitolo,Vol.,Tipo,Editore,Prezzo,Cons.,Classe,Seleziona"],
    ["STORIA,9788805076659,FELTRI FRANCESCO MARIA- BERTAZZONI MARIA MANUELA- NERI FRANCA,SCENARI 3 NOVECENTO E XXI SECOLO,3,B,SEI,35.6,No,5"],
    ["TELECOMUNICAZIONI,9788808159304,BERTAZIOLI ONELIO,CORSO DI TELECOMUNICAZIONI 1 (LMS LIBRO MISTO SCARICABILE)  RETI ELETTRICHE. FOND. ELETTRONICA DIGITALE. NOZIONI SIST. TELECOMUNICAZIONI,1,B,ZANICHELLI EDITORE,31.4,No,3"],
    ["TELECOMUNICAZIONI,9788808228628,BERTAZIOLI ONELIO,CORSO DI TELECOMUNICAZIONI 2 (LIBRO MISTO SCARICABILE) MEZZI TRASMISSIVI. ELETTRONICA PER TELECOMUNICAZIONI. RETE TELEFONICA,2,B,ZANICHELLI EDITORE,42.7,No,4"],
    ["SCIENZE INTEGRATE (SCIENZE DELLA TERRA E BIOLOGIA),9788808554055,LUPIA PALMIERI ELVIDIO- PAROTTO MAURIZIO- SARACENI S - STRUMIA G,SCIENZE NATURALI 3ED. - BIOLOGIA (LDM) DI SILVIA SARACENI E GIORGIO STRUMIA,U,B,ZANICHELLI EDITORE,22.5,No,2"],
    ["SCIENZE DELLA TERRA,9788808690913,LUPIA PALMIERI ELVIDIO- PAROTTO MAURIZIO,SCIENZE DELLA TERRA 4ED. - VOL. U (LDM),U,B,ZANICHELLI EDITORE,23.9,No,1"],
    ["TELECOMUNICAZIONI,9788808834997,BERTAZIOLI ONELIO,CORSO DI TELECOMUNICAZIONI - VOL 3 + RISORSE SCUOLABOOK PER TELECOM. RETI- SIST. E APP. TELECOMUNICAZIONI DIGITALI DI N. GENERAZIONE,3,B,ZANICHELLI EDITORE,44.6,No,5"],
    ["TECNOLOGIE INFORMATICHE,9788820372279,BOSCAINI MAURIZIO- LUGHEZZANI FLAVIA- PRINCIVALLE DANIELA,MASTERMIND PENSARE - PROGRAMMARE - CONDIVIDERE. INFORMATICA PER IL PRIMO BIENNIO,U,B,HOEPLI,24.4,No,1"],
    ["ELETTROTECNICA ED ELETTRONICA,9788820378493,CONTE GAETANO- IMPALLOMENI EMANUELE,ELETTROTECNICA- ELETTRONICA E AUTOMAZIONE NUOVA EDIZIONE OPENSCHOOL PER IL SECONDO BIENNIO DELL'INDIRIZZO TRASPORTI E LOGISTICA,U,B,HOEPLI,35.4,No,3-4-5"],
    ["MECCANICA,9788820383329,AA VV,MANUALE DEL MANUTENTORE,U,X,HOEPLI,76.9,Mon,3-4-5"],
    ["SISTEMI AUTOMATICI,9788820394844,CERRI FABRIZIO- ORTOLANI GIULIANO- VENTURI EZIO,NUOVO CORSO DI SISTEMI AUTOMATICI  PER LE ARTICOLAZIONI ELETTROTECNICA- ELETTRONICA E AUTOMAZIONE DEGLI ISTITUT,1,B,HOEPLI,31.9,No,3"],
    ["SISTEMI AUTOMATICI,9788820394851,CERRI FABRIZIO- ORTOLANI GIULIANO- VENTURI EZIO,NUOVO CORSO DI SISTEMI AUTOMATICI  PER LE ARTICOLAZIONI ELETTROTECNICA- ELETTRONICA E AUTOMAZIONE DEGLI ISTITUT,2,B,HOEPLI,31.9,No,4"],
    ["STORIA,9788822197320,BRANCATI ANTONIO- PAGLIARANI TREBI,STORIA IN MOVIMENTO LIBRO MISTO CON LIBRO DIGITALE  VOLUME 3- LAVORARE CON LA STORIA 3,3,B,LA NUOVA ITALIA EDITRICE,31.7,No,5"],
    ["ELETTROTECNICA ED ELETTRONICA,9788823342002,AMBROSINI- SPADARI,ELETTROTECNICA ED ELETTRONICA 2 CON OPENBOOK VOLUME 2 + OPENBOOK,2,B,TRAMONTANA,31.4,No,4"],
    ["ELETTROTECNICA ED ELETTRONICA,9788823346000,AMBROSINI- SPADARI,ELETTROTECNICA ED ELETTRONICA 3 CON OPENBOOK VOLUME 3 + OPENBOOK,3,B,TRAMONTANA,35.1,No,5"],
    ["TELECOMUNICAZIONI,9788823357037,AMBROSINI ENRICO- PERLASCA IPPOLITO- MAINI PIERPAOLO,TELECOMUNICAZIONI - LIBRO MISTO CON HUB LIBRO YOUNG  VOL. + HUB YOUNG + HUB KIT,U,B,TRAMONTANA,36.5,No,4"],
    ["TECNOLOGIE E PROGETTAZIONE,9788823357150,BOVE ENEA- PORTALURI GIORGIO,TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI - LIBRO MISTO  ART. ELETTRONICA - VOL. 1 + HUB YOUNG + HUB KIT,1,B,TRAMONTANA,37,No,3"],
    ["TECNOLOGIE E PROGETTAZIONE,9788823357983,BOVE ENEA- PORTALURI GIORGIO,TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI  ART. ELETTRONICA - VOL. 2 + HUB YOUNG + HUB KIT,2,B,TRAMONTANA,31.9,No,4"],
    ["TECNOLOGIE E PROGETTAZIONE,9788823357990,BOVE ENEA- PORTALURI GIORGIO,TECNOLOGIE E PROGETTAZIONE DI SISTEMI ELETTRICI ED ELETTRONICI  ART. ELETTRONICA - VOL. 3 + HUB YOUNG + HUB KIT,3,B,TRAMONTANA,31.9,No,5"],
    ["SCIENZE INTEGRATE (CHIMICA),9788823365957,CORDIOLI DORIANO,CHIMICA PRATICA - LIBRO MISTO CON LIBRO DIGITALE  VOLUME UNICO PER IL BIENNIO,U,B,TRAMONTANA,36.9,No,1-2"],
    ["DIRITTO ED ECONOMIA,9788823367739,D'AMELIO MARIA GIOVANNA,FUTURO IN TASCA (IL) - LIBRO MISTO CON LIBRO DIGITALE  CORSO DI DIRITTO ED ECONOMIA PER IL PRIMO BIENNIO - VOLUME UNICO,U,B,TRAMONTANA,25.3,No,1-2"],
    ["ELETTRONICA ED ELETTROTEC,9788823373266,AMBROSINI ENRICO- SPADARI FILIPPO,ELETTROTECNICA ED ELETTRONICA VOLUME 1,1,B,TRAMONTANA,30.2,No,3"],
    ["INFORMATICA,9788826821887,LORENZI AGOSTINO- RIZZI ANDREA,PRO.TECH B,2,B,ATLAS,28.2,No,4"],
    ["ITALIANO ANTOLOGIE E STORIA LETTERATURA,9788830206779,SAMBUGAR MARTA- SALA' GABRIELLA,CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOLUME 3A + VOLUME 3B + FASCICOLO 5� ANNO,3,B,LA NUOVA ITALIA EDITRICE,55.6,No,5"],
    ["ITALIANO ANTOLOGIE E STORIA LETTERATURA,9788830206793,SAMBUGAR MARTA- SALA' GABRIELLA,CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOL 1+LABORATORIO 3� 4� ANNO+DIVINA COMMEDIA+INVALSI,1,B,LA NUOVA ITALIA EDITRICE,43.8,No,3"],
    ["ITALIANO ANTOLOGIE E STORIA LETTERATURA,9788830212428,SAMBUGAR MARTA- SALA' GABRIELLA,CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOL 2 CON LEOPARDI+LABORATORIO 3� 4� ANNO,2,B,LA NUOVA ITALIA EDITRICE,45.4,No,4"],
    ["STORIA,9788835055204,GENTILE- RONGA- ROSSI,FUCINA DI VULCANO - VOLUME 1 (LA)  CORSO DI STORIA ED EDUCAZ.CIVICA,1,B,LA SCUOLA EDITRICE,25.1,No,1-2"],
    ["STORIA,9788835055211,GENTILE- RONGA- ROSSI,FUCINA DI VULCANO - VOLUME 2 (LA)  CORSO DI STORIA ED EDUCAZ.CIVICA,2,B,LA SCUOLA EDITRICE,25.1,No,2"],
    ["SISTEMI AUTOMATICI,9788836003785,CERRI FABRIZIO- ORTOLANI GIULIANO- VENTURI EZIO,NUOVO CORSO DI SISTEMI AUTOMATICI  PER L'ARTICOLAZIONE ELETTRONICA DEGLI ISTITUTI TECNICI SETTORE TECNOLOGICO,3,B,HOEPLI,32.9,No,5"],
    ["INFORMATICA,9788836007745,CAMAGNI PAOLO- NIKOLASSY RICCARDO,CORSO DI INFORMATICA SQL & PHP  PERCORSI MODULARI PER LINGUAGGI DI PROGRAMMAZIONE,U,B,HOEPLI,29.9,No,5"],
    ["LOGISTICA,9788836007943,DALLARI FABRIZIO,CORSO DI LOGISTICA E TRASPORTI  ELEMENTI DI BASE- SOLUZIONI TECNICHE E MODELLI OPERATIVI,1,B,HOEPLI,32.9,No,3"],
    ["TECNOLOGIE E PROGETTAZIONE DI SISTEMI INFO,9788836011728,CAMAGNI PAOLO- NIKOLASSY RICCARDO,TECNOLOGIE E PROGETTAZIONE DI SISTEMI INFORMATICI E DI TELECOMUNICAZION  PER L'ARTICOLAZIONE INFORMATICA DEGLI ISTITUTI TECNICI SETTORE TECNOLOGICO,1,B,HOEPLI,25.9,No,3"],
    ["LOGISTICA,9788836012275,DALLARI FABRIZIO- COSSU ELENA,CORSO DI LOGISTICA E TRASPORTI  ORGANIZZAZIONE E GESTIONE DELLA SUPPLY CHAIN E DELLA SICUREZZA,2,B,HOEPLI,32.9,No,4-5"],
    ["SCIENZE DELLA NAVIGAZIONE,9788836015221,DALLARI FABRIZIO- COSSU ELENA,CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE,3,B,HOEPLI,32.9,App,3"],
    ["RELIGIONE,9788839303394,CERA T- FAMA' A,STRADA CON L'ALTRO (LA) - VOLUME UNICO LEZIONI E PERCORSI + EBOOK,U,B,MARIETTI SCUOLA,19.35,No,3-4-5"],
    ["RELIGIONE,9788839303943,CERA T FAMA A- SORICE O,STRADA CON L'ALTRO - EDIZIONE VERDE (LA)  VOLUME UNICO + UDA MULTIDISCIPLINARI DI EDUCAZIONE CIVICA E IRC + EBOOK,U,B,MARIETTI SCUOLA,18.75,App,1-2"],
    ["STORIA,9788839538864,GIOVANNI DE LUNA- MARCO MERIGGI,VALORE STORIA 1 DALL'ANNO MILLE ALLA MET� DEL SEICENTO,1,B,PARAVIA,34.9,No,3"],
    ["STORIA,9788839538871,GIOVANNI DE LUNA- MARCO MERIGGI,VALORE STORIA 2 DALLA MET� DEL SEICENTO ALLA FINE DELL'OTTOCENTO,2,B,PARAVIA,38.3,No,4"],
    ["TECNOLOGIE E TECNICHE DI RAPPRESENT.GRAFICA,9788841651780,ZANIN ALBINO- BALDISSERI GIORGIO,TECNOGRAFICA + DISEGNO + TECNOLOGIA,U,B,PRINCIPATO,27.9,No,1-2"],
    ["INGLESE,9788844119836,ROBBA MARGHERITA- FAGGIANI MARIA LETIZIA,NEW MECHWAYS - ENGLISH FOR MECHANICS- MECHATRONICS AND ENERGY,U,B,EDISCO,25.8,No,3-4-5"],
    ["MATEMATICA,9788849422979,SASSO LEONARDO- ZOLI ENRICO,COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 3 + EBOOK +  STATISTICA E CALCOLO DELLE PROBABILIT�,1,B,PETRINI,41.85,No,3"],
    ["MATEMATICA,9788849422986,SASSO LEONARDO- ZOLI ENRICO,COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 4 + EBOOK +,2,B,PETRINI,31,No,4"],
    ["MATEMATICA,9788849422993,SASSO LEONARDO- ZOLI ENRICO,COLORI DELLA MATEMATICA - EDIZIONE VERDE VOL. 5 + EBOOK +,3,B,PETRINI,28.65,No,5"],
    ["SISTEMI E RETI,9788849423266,ANELLI S- MACCHI P- ANGIANI G ZICCHIERI G,GATEWAY - SISTEMI E RETI SECONDA EDIZIONE - VOLUME 2 + EBOOK,2,B,PETRINI,21.2,No,4"],
    ["SISTEMI E RETI,9788849423273,ANELLI S- MACCHI P- ANGIANI G ZICCHIERI G,GATEWAY - SISTEMI E RETI SECONDA EDIZIONE - VOLUME 3 + EBOOK- IN PREPARAZIONE,3,B,PETRINI,22.55,No,5"],
    ["MATEMATICA,9788849425215,SASSO L ZOLI E,TUTTI I COLORI DELLA MATEMATICA - EDIZIONE VERDE - PRIMO BIENNIO  VOLUME 1 + QUADERNO DI INCLUSIONE E RECUPERO 1 + EBOOK,1,B,PETRINI,35.65,No,1"],
    ["MATEMATICA,9788849425222,SASSO L ZOLI E,TUTTI I COLORI DELLA MATEMATICA - EDIZIONE VERDE - PRIMO BIENNIO  VOLUME 2 + QUADERNO DI INCLUSIONE E RECUPERO 2 + EBOOK,2,B,PETRINI,36.2,No,2"],
    ["SISTEMI E RETI,9788849426403,ANELLI S MACCHI P,GATEWAY TERZA EDIZIONE + EBOOK VOLUME 1 PER IL III ANNO + EBOOK,1,B,PETRINI,21.5,No,3"],
    ["GEOGRAFIA,9788851187477,BIANCHI S KOEHLER R,GEOBASE-CORSO DI GEOGRAFIA GENERALE ED ECONOMICA PER IST.TECNICI PROFESS. VOLUME BASE+ EBOOK,U,B,DE AGOSTINI,13.25,No,2"],
    ["DIRITTO ED ECONOMIA,9788861603820,MARIA RITA CATTANI,NUOVO SISTEMA DIRITTO APP - DIRITTO COMMERCIALE (IL),2,B,PARAMOND,33.5,No,4"],
    ["DIRITTO ED ECONOMIA,9788861604711,CATTANI MARIA RITA- GUZZI CLAUDIO,SISTEMA DIRITTO SECONDA EDIZIONE - SECONDO BIENNIO  CORSO DI DIRITTO,U,B,PARAMOND,43.2,No,3"],
    ["INGLESE,9788861618176,SBOLOGNINI- B C BARBER- K O'MALLEY,CAREER PATHS IN TECHNOLOGY ELECTRICITY AND ELECTRONICS� INFORMATION TECHNOLOGY AND TELECOMMUNICATIONS,U,B,LANG EDIZIONI,27.7,No,3-4-5"],
    ["SCIENZE INTEGRATE (FISICA),9788863648850,WALKER,FISICA DI WALKER (LA) - VOLUME UNICO,U,B,LINX,39.1,No,1-2"],
    ["ITALIANO ANTOLOGIE,9788869109225,SIMONA BRENNA- DANIELE DACCO,STORIE IN TASCA - NARRATIVA CON VEDERE LE STORIE,U,B,B.MONDADORI,25.7,No,1"],
    ["ITALIANO ANTOLOGIE,9788869109263,SIMONA BRENNA- DANIELE DACCO,STORIE IN TASCA - POESIA E TEATRO CON ANTOLOGIA DEI PROMESSI SPOSI,U,B,B.MONDADORI,24.5,No,2"],
    ["ITALIANO EPICA,9788869109348,SIMONA BRENNA- DANIELE DACCO',STORIE IN TASCA - MITO ED EPICA,U,B,B.MONDADORI,13.6,No,1"],
    ["GESTIONE PROGETTO- ORGANIZZAZIONE D'IMPRESA,9788874858323,IACOBELLI CESARE- COTTONE MARIO- GAIDO ELENA,DALL'IDEA ALLA STARTUP VOLUME UNICO,U,B,JUVENILIA,29.4,No,5"],
    ["INGLESE,9788883394485,AA VV,MY VOICE A2/B1,U,B,PEARSON LONGMAN,29.9,No,1-2"],
    ["INGLESE,9788883394492,AA VV,MY VOICE B1/B1+,U,B,PEARSON LONGMAN,29.9,No,2"],
    ["INGLESE,9788883395994,AA VV,MY VOICE B2,U,B,PEARSON LONGMAN,33.9,No,3-4-5"],
    ["STRUTTURA- COSTRUZIONE- SISTEMI E IMPIANTI,9788884883148,AA VV,TECNICA DELL'AUTOMOBILE MANUALE DI TECNOLOGIA DEI VEICOLI A MOTORE,U,B,SAN MARCO,42,No,3-4-5"],
    ["DIRITTO ED ECONOMIA,9788891420091,AVOLIO ALESSANDRA,TRASPORTI LOGISTICA LEGGI E MERCATI DIRITTO ED ECONOMIA PER SECONDO BIENNIO E QUINTO ANNO ARTICOL LOGISTICA,U,B,SIMONE PER LA SCUOLA,28,App,5"],
    ["INGLESE,9788899673154,GUALANDRI- CANELLINI,ALL ABOUT LOGISTICS PLUS + CD AUDIO 50241  STORAGE & DELIVERY,U,B,TRINITY WHITEBRIDGE,18.5,No,3-4-5"],
    ["ITALIANO GRAMMATICA,9791254550106,SAVIGLIANO C,GRAMMATUTOR - PER PARLARE E SCRIVERE BENE  VOLUME BASE + LABORATORIO DELLE COMPETENZE + EBOOK,U,B,GARZANTI SCUOLA,28.1,No,1-2"],
];

const books = [];
const library = localStorage;
const selectedBooks = [];
const sellers = [];
const buyers = [];
let currentBalance = 0.0;
  
// Funzione che carica i libri
function loadInitialData() {
    const tableContainer = document.getElementById("table-container");
    const table = document.getElementById("table-content");
    const thead = document.getElementById("table-header");
    const tbody = document.getElementById("table-data");

    for (let i = 0; i < initialData.length; i++) {
        const trow = document.createElement("tr");
        const row = initialData[i][0].split(",");
        
        // Inserisco i libri in una lista di libri
        if (i !== 0) {
            const book = new Book(row);
            book.numeroSerie = 0;
            books.push(book);
        }

        // Creo le celle che conterrani i dati o le header
        for (let j = 0; j < row.length; j++) {
            const tcell = document.createElement(i === 0 ? "th" : "td");
            tcell.classList.add("cell");
            tcell.innerText = row[j];
            trow.appendChild(tcell);
        }

        // Aggiunta checkbox
        const checkboxCell = document.createElement("td");
        if (i !== 0) {
            const check = document.createElement("input");
            check.setAttribute("type", "checkbox");
            check.setAttribute("id" , "check"+ (i - 1));
            check.addEventListener("click", selectBook);
            checkboxCell.appendChild(check);
            trow.appendChild(checkboxCell);
        }

        // Aggiungo le celle negli approrpiati tag
        if (i === 0) {
            thead.appendChild(trow);
        }
        else {
            tbody.appendChild(trow);
        }
    }

    // Aggiungio il theader e il tbody alla tabella e al contenitore della tabella
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}
  
// Funzione che estrapola il testo della ricerca una volta cliccato il bottone "cerca"
function search(event) {
    event.preventDefault(); // Previene il comportamento predefinito del form

    // Estrapolo il contenuto della casella di inserimento testo
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    // Filtra la tabella in base al testo di ricerca
    filterTable(searchText);
}
  
// Funzione che filtra la tabella in base al testo di ricerca
function filterTable(searchText) {
    const table = document.querySelector("table");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length && match == false; j++) {
            if (cells[j].innerText.toLowerCase().includes(searchText)) {
                match = true;
            }
        }

        // Mostra o nasconde la riga in base alla corrispondenza
        rows[i].style.display = match ? "" : "none";
    }
}

// Funzione per immetere nella tabella del carrello il libro selezionato
function selectBook(event) {
    const checkbox = event.target;
    const identifier = checkbox.getAttribute("id");
    const index = identifier.substring(5, identifier.length);

    if (checkbox.checked) {
        const table = document.getElementById("cart-content");
        books[index].numeroSerie++
            const bookToAdd = books[index]
        selectedBooks.push(bookToAdd);
        currentBalance += books[index].prezzo;
        const row = table.appendChild(document.createElement("tr"));
        row.setAttribute("id", "libro" + index);

        const properties = books[index].toString().split(",");
        for (let j = 0; j < 5; j++) {
            const cella = row.appendChild(document.createElement("td"));
            cella.innerHTML = properties[j];
            row.appendChild(cella);
        }

        const cellaSelect = row.appendChild(document.createElement("td"));
        cellaSelect.appendChild(document.createElement("select"));
        table.appendChild(row);
    
    }
    else {
        deselectBook(event, index);
    }
}

// Funzione per la deselezione di un libro
function deselectBook(event, index) {
    const checkbox = event.target;
    const table = document.getElementById("cart-content");
    table.removeChild(document.getElementById("libro" + index));
    let libro = books[index];
    libro.numeroSerie--;
    selectedBooks.splice(selectedBooks.indexOf(libro), 1);
    currentBalance -= libro.prezzo;
}

// Funzione per aprire il form per la registrazione di un venditore
function openSellerRegistration(event) {
    if(currentBalance !== 0.0){
    document.getElementById("seller-registration-container").style.display = "block";
    }else{
        alert("SI PREGA DI SELEZIONARE ALMENO UN LIBRO!")
    }
}

// Funzione per aprire il form per la registrazione di un acquirente
function openBuyerRegistration(event) {
    document.getElementById("buyer-registration-container").style.display = "block";
}

// Funzion per annullare la registrazione del cliente come venditore
function closeSellerRegistration() {
    document.getElementById("seller-registration-container").style.display = "none";
}

// Funzion per annullare la registrazione del cliente come aquirente
function closeBuyerRegistration() {
    document.getElementById("buyer-registration-container").style.display = "none";
}

function openCart() {
    document.getElementById("cart-button").style.display = "block";
}

function closeCart() {
    document.getElementById("cart-button").style.display = "none";
}

/**
 * Funzione per attendere l'inserimento dei dati nel form, utilizza una Promise (rappresenta un'operazione asincrona).
 * Alla funzione viene passato un parametro chiamato "resolve" che rappresenta una funzione che viene implementata di seguito (funzione Lambda).
 * Al bottone di conferma viene aggiunto un EventListener di tipo "click", come primo parametro e
 * come secondo parametro una funzione di risoluzione della promessa.
 */
function waitForRegistration() {
    return new Promise((resolve) => {
        document.getElementById("seller-closeButton").addEventListener("click", resolve());
    });
}

// Funzione asincrona per registrare il venditore (attende che il bottone di conferma venga cliccato per procedere)
// Il venditore "riceve" il pagamento dei libri selezionati, incrementando il suo saldo.
async function releaseBooks(event) {
    event.preventDefault();

    let primaRiga = false;

    const name = document.forms["seller-data"]["seller-name-field"].value;
    const surname = document.forms["seller-data"]["seller-surname-field"].value;
    const phoneNumber = document.forms["seller-data"]["seller-phoneNumber-field"].value;

    if (currentBalance !== 0.0) {
        openSellerRegistration(); // Apro il form per la Registrazione
        await waitForRegistration(); // Attendo che l'utente inserisca i dati e confermi la registrazione

        name.value;
        surname.value;
        phoneNumber.value;
        
        if (name !== "" && surname !== "" && phoneNumber !== "") {
            const seller = new Customer(name, surname, phoneNumber);

            seller.saldo += currentBalance;
            sellers.push(seller);

            for (let i = 0; i < sellers.length - 1; i++){
                if(sellers[i].phoneNumb === seller.phoneNumb){
                    sellers.pop();
                    sellers[i].saldo += currentBalance;
                    document.getElementById("proprietàV" + i + "," + 3).innerHTML = sellers[i].saldo;
                    primaRiga = true;
                }
            }

            if (!primaRiga) {
                const row = document.getElementById("sellers-content").appendChild(document.createElement("tr"));
                row.setAttribute("id", "venditore" + sellers.length );
                const properties = seller.toString().split(",");

                for (let i = 0; i < 4; i++) { 
                    const cella = row.appendChild(document.createElement("td"));
                    cella.setAttribute("id", "proprietàV" + (sellers.length - 1) + "," + i);
                    cella.innerHTML = properties[i];
                }
                document.getElementById("sellers-content").appendChild(row);
            }

            for(let i = 0;i<selectedBooks.length;i++){
                var libroRegistrato = selectedBooks[i]
                Object.defineProperty(libroRegistrato,'proprietario',seller);
                library.setItem(libroRegistrato.codice + "_" + libroRegistrato.numeroSerie, libroRegistrato.toString())
                }
            
        
            currentBalance = 0.0;
            const elenco = document.getElementById("cart-content");
            elenco.innerHTML = "";

            for (let i = 0; i < books.length; i++) {
                const tickbox = document.getElementById("check" + i);
                if (tickbox.checked) {
                    tickbox.checked = false;;
                }
            }

            document.forms["seller-data"]["seller-name-field"].value = "";
            document.forms["seller-data"]["seller-surname-field"].value = "";
            document.forms["seller-data"]["seller-phoneNumber-field"].value = "";
        }
        else {
            alert("SI PREGA DI COMPILARE TUTTI I CAMPI PRE PROCEDERE!");
        }
    }
    else {
        alert(("SI PREGA DI SELEZIONARE ALMENO UN LIBRO!"));
    }
    closeSellerRegistration()
}

// Funzione asincrona per registrare l'acquirente (attende che il bottone di conferma venga cliccato per procedere)
// L'acquirente "rilascia" i libri pagando, quindi il suo saldo diminuisce.
async function receiveBooks(event) {
    event.preventDefault();

    let primaRiga = false;

    const name = document.forms["buyer-data"]["buyer-name-field"];
    const surname = document.forms["buyer-data"]["buyer-surname-field"];
    const phoneNumber = document.forms["buyer-data"]["buyer-phoneNumber-field"];

    if (currentBalance !== 0.0) {
        openBuyerRegistration(); // Apro il form per la Registrazione
        await waitForRegistration(); // Attendo che l'utente inserisca i dati e confermi la registrazione

        name.value;
        surname.value;
        phoneNumber.value;
        
        if (name !== "" && surname !== "" && phoneNumber !== "") {
            const buyer = new Customer(name, surname, phoneNumber);

            buyer.saldo -= currentBalance;
            buyers.push(buyer);

            for(let i = 0; i < buyers.length - 1; i++){
                if(buyers[i].phoneNumb === buyer.phoneNumb){
                    buyers.pop();
                    buyers[i].saldo -= currentBalance;
                    document.getElementById("proprietàA" + i + "," + 3).innerHTML = buyers[i].saldo;
                    primaRiga = true;
                }
            }
            
            if (!primaRiga) {
                const row = document.getElementById("buyers-content").appendChild(document.createElement("tr"));
                row.setAttribute("id", "acquirente" + buyers.length);
                const properties = buyer.toString().split(",");

                for ( let i = 0; i < 4; i++) {
                    const cella = row.appendChild(document.createElement("td"));
                    cella.setAttribute("id", "proprietàA" + (buyers.length - 1) + "," + i);
                    cella.innerHTML = properties[i];
                }
                document.getElementById("buyers-content").appendChild(row);

            }
            
            currentBalance = 0.0;
            const elenco = document.getElementById("cart-content");
            elenco.innerHTML = "";

            for(let i = 0; i < books.length; i++){
                const tickbox = document.getElementById("check" + i);
                if (tickbox.checked) {
                    tickbox.checked = false;;
                }
            }
            
            document.forms["buyer-data"]["buyer-name-field"].value = "";
            document.forms["buyer-data"]["buyer-surname-field"].value = "";
            document.forms["buyer-data"]["buyer-phoneNumber-field"].value = "";
        }
        else {
            alert("SI PREGA DI COMPILARE TUTTI I CAMPI PRE PROCEDERE!");
        }
    }
    else {
        alert(("SI PREGA DI SELEZIONARE ALMENO UN LIBRO!"));
    }
}

//Passo a "window.onload" solo il riferimento alla funzione quindi non servono le parentesi
window.onload = loadInitialData;
document.getElementById("searchButton").addEventListener("click", search);
document.getElementById("bottoneVendita").addEventListener("click", openSellerRegistration);
document.getElementById("seller-confirmButton").addEventListener("click", releaseBooks);
document.getElementById("bottoneRicevi").addEventListener("click",openBuyerRegistration);

/**
* Aggiungo ai bottini un Event Listener di tipo "click" e associo il riferimento alla funzione da eseguire
* In altre parole, queste righe di codice dicono al borwser di eseguire le funzioni search e addBook
* (sono senza parentesi perché sono solo riferimenti alle funzioni) ogni volta che l'utente clicca sui bottoni corrispondeti
* alle funzioni delle funzioni
*/
const date = new Date().toLocaleDateString();
const typstCode = "#set page(width: 210mm, height: 297mm) 
		\n#set text(font: "Bungee Tint", size: 14pt)
		\n#set table(
		  \nstroke: none,
		  \ngutter: 0.2em,
		 \n fill: (x, y) =>
			\nif x == 0 or y == 0 { rgb(70, 76, 77) },
		 \n inset: (right: 1.5em),
		\n)

		\n#show table.cell: it => {
		  \nif it.x == 0 or it.y == 0 {
			\nset text(white)
			\nstrong(it)
		 \n } else if it.body == [] {
			\npad(..it.inset)[_N/A_]
		  \n} else {
		\n	it
		 \n }
		\n}

		\n= RICEVUTA ACQUISTO LIBRI di ClienteX:

		\n#rect(fill: rgb(196, 239, 245), width: 80%, height: 1mm)

		\n#box(
			\nstroke: 1pt,
			\nfill: rgb(196, 239, 245),
			\ninset: 12pt,
			\nradius: 4pt
		\n)[
			\n#set text(size: 18pt)

			\n**DATA DI ACQUISTO:**  

			\n#table(
			 \n columns: 3,
			 \n [], [TITOLO], [PREZZO],

			\n  [1], [libro1], [prezzo1],
			\n  [2], [libro2], [prezzo1],
			\n  [3], [libro3], [prezzo3],
			\n)


		\n]

		\n#rect(fill: rgb(211, 211, 211), width: 100%, height: 1mm)

		\n#box(
		\n	stroke: 1pt,
		\n	inset: 12pt,
		\n	radius: 6pt
		\n)[
		\n	*Grazie per aver utilizzato il nostro servizio!*  
		\n	*Ci auguriamo di rivedervi presto.*
		\n]

		\n#align(center)[
			*www.mercatinolibri.it*
		]

		#image("logoMarconi.png")
";
