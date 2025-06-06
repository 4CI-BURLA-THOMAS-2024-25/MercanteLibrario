import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";
import { ws } from "./websocket";

//operatore ternario per prendere il contatore o settarlo a 0 nel caso non esistesseMore actions
const cMLocalStorage = localStorage.getItem("contatoreMovimenti");
let contatoreMovimenti  = cMLocalStorage != null ? Number(cMLocalStorage) : 0;


// Dichiara JsBarcode come variabile globale
declare const JsBarcode: any;
//barcode
let canvas = document.getElementById("canvaBarcode") as HTMLCanvasElement;

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelevo ID del venditore
const venditoreID: number = Number(parametri.get("venditoreID"));
//prelevo eventuale isbn
const isbn:string = parametri.get("isbn") as string;

//database
let database: IDBDatabase;

//venditore di cui gestisco le copie
let venditore: Venditore;

//libro associato alla copia in registrazione
let libro: Libro | null;

//associo funzione al bottone per registrare una nuova copia associata al venditore
const bottoneAggiungiCopie = document.getElementById("aggiungiCopia") as HTMLButtonElement;
bottoneAggiungiCopie?.addEventListener("click", apriRegistrazioneCopia);

//prelevo reference del popup per aggiungere nuove copie
const popupAggiungiCopie = document.getElementById("popupRegistraCopia");

//reference del bottone che conferma la registrazione della copia con relativo comportamento associato
const bottoneRegistraCopia = document.getElementById("registraCopia");
bottoneRegistraCopia?.addEventListener("click", preparaCopiaDaRegistrare);

//prelevo reference del bottone per chiudere il popup e vi associo funzione per chiuderlo
const bottoneChiudiPopupCopie = document.getElementById("chiudiPopup") as HTMLButtonElement;
bottoneChiudiPopupCopie?.addEventListener("click", chiudiRegistrazioneCopia);

// prelevo reference del bottone per aprire finestra con i libri
const bottoneApriLibri = document.getElementById("scegliLibro") as HTMLButtonElement;
bottoneApriLibri?.addEventListener("click", mostraLibri);

//reference del campo di testo in cui inserire il prezzo di copertina
const campoPrezzoCopertina = document.getElementById("prezzoCopertina") as HTMLInputElement;

//reference del campo di testo non modificabile che mostra il libro selezionato per la registrazione della copia
const etichettaTitoloLibro = document.getElementById("titoloLibro") as HTMLInputElement;

//bottone che, quando cliccato, elimina le copie selezionate (NON SERVE A SEGNALARE UNA COPIA COME VENDUTA!)
const bottoneEliminaCopie = document.getElementById("eliminaCopie") as HTMLButtonElement;
bottoneEliminaCopie?.addEventListener("click", eliminaLogicamenteCopie);

//bottone per aggiungere copie al carrello
const bottoneAggiungiAlCarrello = document.getElementById("aggiungiAlCarrello") as HTMLButtonElement;
bottoneAggiungiAlCarrello?.addEventListener("click", aggiungiCopieAlCarrello);

//bottone per scaricare i barcode delle copie selezionate
const bottoneOttieniBarcode = document.getElementById("ottieniBarcode") as HTMLButtonElement;
bottoneOttieniBarcode?.addEventListener("click", scaricaBarcode);

//bottoncino per aprire il carrello
const bottoneApriCarrello = document.getElementById("apriCarrello") as HTMLDivElement;
bottoneApriCarrello?.addEventListener("click", () => {window.open("carrello.html")});

const bottoneDeposito = document.getElementById("vaiAllaRicevuta");
bottoneDeposito?.addEventListener("click", () => {window.open("../stampaRicevute/ricevutaDeposito.html")});

// funzione per aprire il database
function apriDatabase(): Promise<IDBDatabase>{
    let out: Promise<IDBDatabase> = new Promise((resolve, reject) => {
        const richiestaDB = indexedDB.open("Database", 1);

        //cosa fare in caso di errore
        richiestaDB.onerror = () => {
            // restituisco motivo errore
            reject(richiestaDB.onerror);
        }

        // richiesta accolta
        richiestaDB.onsuccess = () => {
            const database = richiestaDB.result;
            resolve(database);
        }
    });

    return out;
}

//comunicazione
ws.onopen = function () {
    console.log("aperto il server");
}

ws.onclose = function () {
    console.log("connessione server chiusa");
}

ws.onerror = function (error) {
    console.log("errore nel webSocket", error);
}

//comunico copia modificata
async function inviaDati(copia: Copia) {
    let copiaDaInviare: Copia;
    //controllo che l'oggetto passato sia una reale istanza, altrimenti la ricreo (se letta da DB)
    if(copia instanceof Copia){
        copiaDaInviare = copia;
    }else{
        const copiaGrezza: Copia = copia as Copia;
        //prelevo libro associato alla copia
        const libroDellaCopia: Libro = await prelevaLibroISBN(Number(copiaGrezza.libroDellaCopiaISBN));
        //prelevo venditore associato alla copia
        const venditoreDellaCopia: Venditore = await prelevaVenditoreID(Number(copiaGrezza.venditoreID));
        //ricostruisco istanza reale della copia
        copiaDaInviare = new Copia(libroDellaCopia, Number(copiaGrezza.codiceUnivoco), Number(copiaGrezza.prezzoCopertina), venditoreDellaCopia, copiaGrezza.stato, copiaGrezza.ultimaModifica);
    }

    ws.send("C-" + String(copiaDaInviare?.toString()));
}

//ascolto modifiche al DB delle copie
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "Copie") {
        console.log("Aggiornamento ricevuto: ricarico copie...");
        
        //aggiorno pagina
        await caricaCopieVenditore();
    }
};

// funzione per registrare una nuova copia di un determinato libro, passando eventuale venditore
function apriRegistrazioneCopia(): void{
    if(popupAggiungiCopie != null){
        //quando clicco il bottone per registrare una nuova copia, apro il form
        popupAggiungiCopie.style.display = "flex";
    }
}

function chiudiRegistrazioneCopia(): void{
    if(popupAggiungiCopie != null){
        // quando clicco il bottone per chiudere il popupAggiungiCopie, lo imposto come nascosto
        popupAggiungiCopie.style.display = "none";
    }
}

//funzione che ripristina il popup aperto (quando ritorno dalla pagina di selezione del libro)
async function ripristinaPopup(): Promise<void>{
    //gestisco errore di venditore non reperibile
    try{
        //se isbn non  è vuoto, sono di ritorno dalla scelta del libro
        if(isbn != null){
            //recupero libro da DB, dato ISBN
            libro = await prelevaLibroISBN(Number(isbn));
            
            //ripristino prezzo di copertina, inserito prima
            campoPrezzoCopertina.value = parametri.get("prezzoCopertina") as string;
    
            //imposto titolo del libro nella casella
            etichettaTitoloLibro.value = libro.titolo;
        
            //riapro popup di registrazione
            apriRegistrazioneCopia();
        }

    //venditore non reperibile
    }catch(errore){
        console.error("Venditore NON reperibile", errore);
    }
}

//prelevo da DB tutte le copie del venditore, in base al suo ID
async function prelevaCopieVenditoreID():Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");
        const indice = tabellaCopie.index("venditoreID");

        const richiesta = indice.getAll(venditoreID); // cerca tutte le copie con quel ID venditore

        richiesta.onsuccess = () => {
            //array delle copie con ID venditore cercato
            resolve(richiesta.result);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

async function caricaCopieVenditore(): Promise<void>{
    try{
        //prelevo copie che hanno ID del venditore coerente con il venditore che si sta gestendo
        const copieVenditore: Copia[] = await prelevaCopieVenditoreID();
    
        if (!venditoreID) throw new Error("ID venditore non valido");
    
        //preparo transazione per leggere dal database
        const transazioneVenditori = database.transaction("Venditori", "readonly");
        //prelevo reference tabella venditori del database
        const tabellaVenditori = transazioneVenditori.objectStore("Venditori");
        
        //assegno venditore o errore di recupero
        venditore = await new Promise<Venditore>((resolve, reject) => {
            // cerco per ID
            const richiestaVenditore = tabellaVenditori.get(venditoreID);
    
            richiestaVenditore.onsuccess = () => {
                if (richiestaVenditore.result) {
                    resolve(richiestaVenditore.result);
                } else {
                    reject(new Error("Venditore non trovato con ID: " + venditoreID));
                }
            };
    
            richiestaVenditore.onerror = (event) => {
                console.error("Errore nella richiesta:", event);
                reject(richiestaVenditore.error);
            };
        });

        //prelevo reference del corpo della tabella (ad una riga) che utilizzo per mostrare le info del venditore di cui sto gestendo le copie
        const corpoInfoVenditore = document.getElementById("corpoInfoVenditore") as HTMLTableSectionElement;
        //svuoto tabella
        corpoInfoVenditore.innerHTML = "";

        //chiamo funzione per calcolare il denaro MAX da dare al venditore
        const denaroMAX: number = calcolaSommaPrezzoVenditore(copieVenditore);

        //creo riga con le info del venditore
        const rigaInfoVenditore: HTMLTableRowElement = document.createElement("tr");
        //inserisco info del venditore in analisi nella riga creata
        rigaInfoVenditore.innerHTML = `<td>${venditore.id}</td><td>${venditore.nome}</td><td>${venditore.cognome}</td><td>${venditore.email}</td><td>${venditore.nTelefono}</td><td>${venditore.classe}</td><td>${denaroMAX}</td>`;
        //inserisco riga con le info del libro nella tabella a singola riga
        corpoInfoVenditore.appendChild(rigaInfoVenditore);

        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia del venditore
        for(let i = 0; i < copieVenditore.length; i++){
            const copiaDelVenditore: Copia = copieVenditore[i];
            //controllo che la copia esaminata non sia contrassegnata come eliminata
            if(copiaDelVenditore.stato !== "E"){
                // Prelevo il libro associato alla copia
                const libro: Libro = await new Promise<Libro>((resolve, reject) => {
                    const transazioneLibri = database.transaction("Libri", "readonly");
                    const tabellaLibri = transazioneLibri.objectStore("Libri");
                    //prelevo libro in base a ISBN associato alla copia
                    const richiestaLibro = tabellaLibri.get(copiaDelVenditore.libroDellaCopiaISBN);
    
                    //acesso a DB andato a buon fine
                    richiestaLibro.onsuccess = () => {
                        //venditore trovato
                        if (richiestaLibro.result) {
                            resolve(richiestaLibro.result);
    
                        //venditore non trovato
                        } else {
                            reject(new Error("Libro con ISBN non trovato"));  // fallback
                        }
                    };
    
                    //accesso a DB negato
                    richiestaLibro.onerror = () => {
                        reject(new Error("Database dei libri non reperibile")); // fallback
                    };
                });
    
                //creo riga nella tabella
                const riga: HTMLTableRowElement = document.createElement("tr");
    
                //creo cella per selezionare le copie da eliminare "fake"
                const cellaSelezione = document.createElement("td");

                //copia nel carrello
                if(copiaDelVenditore.stato === "CAR"){
                    const iconaCarrello = document.createElement("img");
                    iconaCarrello.src = "../img/carrello.png";
                    iconaCarrello.setAttribute("class", "nelCarrello");

                    //aggiungo immagine alla sua cella
                    cellaSelezione.appendChild(iconaCarrello);
                    //aggiungo cella alla riga
                    riga.appendChild(cellaSelezione);

                }else{
                    //creo checkbox per la selezione
                    const casellaSelezione = document.createElement("input");
                    //imposto casella con spunta
                    casellaSelezione.setAttribute("type", "checkbox");
                    //imposto classe per CSS
                    casellaSelezione.setAttribute("class", "caselleSelezione");

                    //copia venduta
                    if(copiaDelVenditore.stato === "V"){
                        //copia venduta
                        casellaSelezione.disabled = true;
                        riga.classList.add("venduta");
                    }

                    //aggiungo casella alla sua cella
                    cellaSelezione.appendChild(casellaSelezione);
                    //aggiungo cella alla riga
                    riga.appendChild(cellaSelezione);
                }
                
                //creo cella id copia e la aggiungo alla riga
                const cellaIDCopia = document.createElement("td");
                cellaIDCopia.textContent = String(copiaDelVenditore.codiceUnivoco);
                riga.appendChild(cellaIDCopia);
    
                //creo cella isbn libro associato alla copia e la aggiungo alla riga
                const cellaISBNLibro = document.createElement("td");
                cellaISBNLibro.textContent = String(libro.isbn);
                riga.appendChild(cellaISBNLibro);
    
                //creo cella titolo libro associato alla copia e la aggiungo alla riga
                const cellaTitoloLibro = document.createElement("td");
                cellaTitoloLibro.textContent = libro.titolo;
                riga.appendChild(cellaTitoloLibro);
    
                //creo cella prezzo copertina e la aggiungo alla riga
                const cellaPrezzoCopertina = document.createElement("td");
                cellaPrezzoCopertina.textContent = String(copiaDelVenditore.prezzoCopertina);
                riga.appendChild(cellaPrezzoCopertina);
    
                //creo cella prezzo scontato e la aggiungo alla riga
                const cellaPrezzoScontato = document.createElement("td");
                cellaPrezzoScontato.textContent = String(copiaDelVenditore.prezzoScontato);
                riga.appendChild(cellaPrezzoScontato);
    
                // inserisco riga nel corpo della tabella
                corpoTabellaCopie.appendChild(riga);
            }
        }
    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
    }
}

//calcolo il totale da dare al venditore, in base alle copie vendute
function calcolaSommaPrezzoVenditore(copieDelVenditore: Copia[]): number {
    let sommaPrezziCopie: number = 0;

    //sommo prezzi scontati delle copie vendute (stato === "V")
    for (let i = 0; i < copieDelVenditore.length; i++) {
        if (copieDelVenditore[i].stato == "V") {
            sommaPrezziCopie += copieDelVenditore[i].prezzoScontato;
        }
    }

    return Number(sommaPrezziCopie.toFixed(2));
}

//funzione per preparare la registrazione di una copia del venditore in questione
async function preparaCopiaDaRegistrare():Promise<void>{
    const codiceUltimaCopia = await leggiUltimaChiaveCopia();

    let codiceCopiaAttuale; 
    //verifico che vi siano copie nello store
    if(codiceUltimaCopia !== null){
        codiceCopiaAttuale = codiceUltimaCopia + 1;
    //store vuoto
    }else{
        codiceCopiaAttuale = 1;
    }

    //verifico che sia stata indicata la  percentuale di sconto
    if(!(campoPrezzoCopertina.value === "")){
        //verifico che sia stato scelto il libro da associare alla copia
        if(libro != null){
            //creo oggetto copia
            const copia: Copia = new Copia(libro, codiceCopiaAttuale, parseFloat(campoPrezzoCopertina.value), venditore, "D", new Date().toLocaleString());
    
            //svuoto libro
            libro = null;
    
            //chiamo scrittura su DB
            await registraCopia(copia, false);

        }else{
            window.alert("Scegliere un libro dalla libreria da associarte alla copia che si vuole registrare");
        }
    }else{
        window.alert("Inserire il prezzo di copertina per procedere con la registrazione");
    }
}

//funzione che inserisce padding a id copie e venditori
function inserisciPadding(num: number, totalLength: number, padChar: string = '0'): string {
    return num.toString().padStart(totalLength, padChar);
}

//leggo eventuale ultimo numero della copia
async function leggiUltimaChiaveCopia(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");

        // Apro un cursore ordinato in modo DECRESCENTE per chiavi
        const request = tabellaCopie.openCursor(null, "prev");

        request.onsuccess = () => {
            //prelevo cursore
            const cursor = request.result;
            if (cursor) {
                // La prima chiave che troviamo è la più grande (ultima)
                resolve(cursor.primaryKey as number);
            } else {
                // Nessun record nello store
                resolve(null);
            }
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

//funzione per registrare una copia del libro
async function registraCopia(copiaDaSalvare: Copia, messaggioAggiornamentoStato : boolean):Promise<void>{    //aumenta il contatore dei movimenti 
    contatoreMovimenti = Number(localStorage.getItem("contatoreMovimenti"));
    contatoreMovimenti++;
    localStorage.setItem("contatoreMovimenti", String(contatoreMovimenti))

    //apro transazione
    const transazione = database.transaction("Copie", "readwrite");
    const tabellaCopie = transazione.objectStore("Copie");

    const richiestaAggiungiCopia = tabellaCopie.add(copiaDaSalvare);

    //richiesta andata a buon fine
    richiestaAggiungiCopia.onsuccess = () => {
        //svuoto campi
        campoPrezzoCopertina.value = "";
        etichettaTitoloLibro.value = "";

        //rimuovo parametri da URL non più necessari
        parametri.delete("isbn");
        parametri.delete("prezzoCopertina");

        //notifico aggiunta nuova copia
        databaseChannel.postMessage({store: "Copie"});

        //invia dati se non è un messaggio di aggiornamento statoMore actions
        if(!messaggioAggiornamentoStato){
            inviaDati(copiaDaSalvare);
        }

        //preparo barcode
        const barCode: string = newBarcode(copiaDaSalvare.codiceUnivoco, venditore.id);

        barcodeToJPG(barCode, `${copiaDaSalvare.codiceUnivoco}_copiaID`);

        // Applica le modifiche all'URL (senza ricaricare la pagina)
        const nuovoURL = `${window.location.pathname}?${parametri.toString()}`;
        window.history.replaceState({}, "", nuovoURL);

        //aggiorno lista copie, rileggendo da DB
        caricaCopieVenditore();

        //chiudo popup di inserimento
        chiudiRegistrazioneCopia();
    }

    //errore, copia già presente (improbabile, genero io la chiave primaria)
    richiestaAggiungiCopia.onerror = () => {
        console.error("Copia già presente");
    }
}

// funzione che mostra la pagina per scegliere un libro dalla libreria
function mostraLibri(): void{
    //preparo passaggio di parametri tramite URL, per non perderli quando apro pagina venditori con la scelta
    const parametriTrasmessi = new URLSearchParams();
    //passo ID del venditore
    parametriTrasmessi.set("venditoreID", String(venditore.id));
    //leggo valore della casella del prezzo di copertina
    const prezzoCopertina = campoPrezzoCopertina.value;
    //passo prezzo di copertina
    parametriTrasmessi.set("prezzoCopertina", prezzoCopertina);

    //cambio pagina aprendo i libri e passando il parametro ID venditore, insieme a eventuale prezzo di copertina inserito (così al ritorno nella pagina attuale NON verrà perso)
    window.location.href = `selezionaLibro.html?${parametriTrasmessi.toString()}`;
}

//recupero libro dato isbn; esportabile su pagina principale che ascolta ws
async function prelevaLibroISBN(isbnRicerca: number): Promise<Libro>{
    //preparo transazione per leggere
    const transazione = database.transaction("Libri", "readonly");
    //prelevo reference dell'object store
    const tabellaLibri = transazione.objectStore("Libri");

    const libroLetto: Libro = await new Promise<Libro>((resolve, reject) => {
        //cerco per isbn (chiave primaria)
        const richiesta = tabellaLibri.get(isbnRicerca);

        //richiesta andata a buon fine
        richiesta.onsuccess = () => {
            //venditore trovato
            if (richiesta.result) {
                resolve(richiesta.result);

            //venditore NON trovato
            } else {
                reject(new Error("Libro non trovato con ISBN" + isbnRicerca));
            }
        }

        //errore nella richiesta
        richiesta.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiesta.error);
        };
    });

    //restituisco venditore
    return libroLetto;
}

//funzione che preleva un venditore dato il suo ID; esportabile su pagina principale che ascolta ws
async function prelevaVenditoreID(venditoreIDPassato: number): Promise<Venditore>{
    //apro transazione
    const transazione = database.transaction("Venditori", "readonly");
    const tabellaVenditori = transazione.objectStore("Venditori");

    //assegno venditore o errore di recupero
    const venditorePrelevato: Venditore = await new Promise<Venditore>((resolve, reject) => {
        // cerco per id venditore
        const richiestaVenditori = tabellaVenditori.get(venditoreIDPassato);

        richiestaVenditori.onsuccess = () => {
            if (richiestaVenditori.result) {
                resolve(richiestaVenditori.result);
            } else {
                reject(new Error("Venditore non trovato con codice fiscale: " + venditoreIDPassato));
            }
        };

        richiestaVenditori.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiestaVenditori.error);
        };
    });  
    
    return venditorePrelevato;
}

//funzione per eliminare apparentemente le copie (imposto flag) (NON SERVE PER SEGNALARE UNA COPIA COME VENDUTA!)
async function eliminaLogicamenteCopie(): Promise<void> {
    //prelevo checkbox selezionate
    const checkboxSelezionate = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].caselleSelezione:checked');

    //controllo che sia selezionata almeno una checkbox
    if (checkboxSelezionate.length !== 0) {
        //chiedo conferma
        const confermaEliminazione = window.confirm("Sei sicuro di voler eliminare le copie selezionate?");

        //se la conferma non viene fornita, non eseguo
        if (confermaEliminazione) {
            try {
                const transazione = database.transaction("Copie", "readwrite");
                const storeCopie = transazione.objectStore("Copie");
                //itero sulle copie selezionate, eseguendo le eliminazioni logiche
                const eliminazioni = Array.from(checkboxSelezionate).map(async (checkbox) => {
                    // Trova la riga della checkbox
                    const riga = checkbox.closest("tr");

                    //controllo che sia stata selezionata una riga
                    if (riga) {
                        // Preleva la seconda cella (indice 1) che contiene l'ID della copia
                        const idCopia = riga.cells[1]?.textContent?.trim();

                        //controllo id copia (anche se dovrebbe sempre essere valido)
                        if (idCopia) {
                            return new Promise<void>((resolve, reject) => {
                                //cerco copia da eliminare
                                const richiestaGet = storeCopie.get(Number(idCopia));

                                //richiesta accettata da DB
                                richiestaGet.onsuccess = () => {
                                    const copia: Copia = richiestaGet.result;

                                    //copia trovata
                                    if (copia) {
                                        console.log("RIsultato prova eliminazione:" + copia);
                                        //imposto stato della copia come "E" (eliminata)
                                        copia.stato = "E";
                                        //aggiorno ultima modifica
                                        copia.ultimaModifica = new Date().toLocaleString();
                                        //aggiorno la copia nel database
                                        const richiestaUpdate = storeCopie.put(copia);

                                        //aggiornamento andato a buon fine
                                        richiestaUpdate.onsuccess = () => {
                                            //aumenta il contatore dei movimenti More actions
                                            contatoreMovimenti = Number(localStorage.getItem("contatoreMovimenti"));
                                            contatoreMovimenti++;
                                            localStorage.setItem("contatoreMovimenti", String(contatoreMovimenti))

                                            //notifico modifiche al DB delle copie
                                            databaseChannel.postMessage({ store: "Copie" });
                                            //invia copia aggiornata
                                            inviaDati(copia);

                                            resolve();
                                        };

                                        //errore di aggiornamento
                                        richiestaUpdate.onerror = () => {
                                            reject(new Error(`Errore nell'aggiornamento della copia ${idCopia}.`));
                                        };

                                    //copia non trovata
                                    } else {
                                        reject(new Error(`Copia con ID ${idCopia} non trovata.`));
                                    }
                                };

                                richiestaGet.onerror = () => {
                                    reject(new Error(`Errore nel recupero della copia ${idCopia}.`));
                                };
                            });
                        }else{
                            Promise.resolve(); //ignora elemento non valido
                        }
                    }else{
                        Promise.resolve(); //ignora elemento non valido
                    }
                });

                //risolvo quando tutte le eliminazioni logiche sono state effettuate
                await Promise.all(eliminazioni);
                window.alert("Copia/e eliminate.");
                // Ricarica la tabella per aggiornare la UI
                await caricaCopieVenditore();

            //stampo errore nella console
            } catch (errore) {
                if (errore instanceof Error) {
                    console.error(errore.message);
                }
            }
        }

    } else {
        window.alert("Seleziona almeno una copia da eliminare.");
    }
}

//funzione per aggiungere una copia al carrello
async function aggiungiCopieAlCarrello(): Promise<void> {
    //prelevo checkbox selezionate
    const checkboxSelezionate = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].caselleSelezione:checked');

    //controllo che sia selezionata almeno una checkbox
    if (checkboxSelezionate.length !== 0) {
        try {
            const transazione = database.transaction("Copie", "readwrite");
            const storeCopie = transazione.objectStore("Copie");

            //itero sulle copie selezionate, eseguendo le vendite
            const vendite = Array.from(checkboxSelezionate).map(async (checkbox) => {
                // Trova la riga della checkbox
                const riga = checkbox.closest("tr");

                //controllo che sia stata selezionata una riga
                if (riga) {
                    // Preleva la seconda cella (indice 0) che contiene l'ID della copia
                    const idCopia = riga.cells[1]?.textContent?.trim();

                    //controllo id copia (anche se dovrebbe sempre essere valido)
                    if (idCopia) {
                        return new Promise<void>((resolve, reject) => {
                            //cerco copia da vendere
                            const richiestaGet = storeCopie.get(Number(idCopia));

                            //richiesta accettata da DB
                            richiestaGet.onsuccess = () => {
                                const copia: Copia = richiestaGet.result;

                                //copia trovata
                                if (copia) {
                                    //imposto stato della copia come "V" (venduta)
                                    copia.stato = "CAR";
                                    //aggiorno ultima modifica
                                    copia.ultimaModifica = new Date().toLocaleString();
                                    //aggiorno la copia nel database
                                    const richiestaUpdate = storeCopie.put(copia);

                                    //aggiornamento andato a buon fine
                                    richiestaUpdate.onsuccess = () => {
                                        //notifico modifiche al DB delle copie
                                        databaseChannel.postMessage({store: "Copie" });
                                        //invia copia aggiornata
                                        inviaDati(copia);

                                        resolve();
                                    };

                                    //errore di aggiornamento
                                    richiestaUpdate.onerror = () => {
                                        reject(new Error(`Errore nell'aggiornamento della copia ${idCopia}.`));
                                    };

                                //copia non trovata
                                } else {
                                    reject(new Error(`Copia con ID ${idCopia} non trovata.`));
                                }
                            };

                            richiestaGet.onerror = () => {
                                reject(new Error(`Errore nel recupero della copia ${idCopia}.`));
                            };
                        });
                    }else{
                        Promise.resolve(); //ignora elemento non valido
                    }
                }else{
                    Promise.resolve(); //ignora elemento non valido
                }
            });

            //risolvo quando tutte le vendite sono state effettuate
            await Promise.all(vendite);
            window.alert("Copia/e aggiunte al carrello con successo.");
            // Ricarica la tabella per aggiornare la UI
            await caricaCopieVenditore();

        //stampo errore nella console
        } catch (errore) {
            if (errore instanceof Error) {
                console.error(errore.message);
            }
        }

    } else {
        window.alert("Seleziona almeno una copia da vendere.");
    }
}

function newBarcode(codiceUnivoco: number, venditoreID: number): any{
    canvas = document.createElement("canvas")
    canvas.id = "canvaBarcode"
    document.body.appendChild(canvas);

    JsBarcode(canvas, inserisciPadding(codiceUnivoco, 4),{
        format: "CODE128",
        width: 2,
        text: inserisciPadding(venditoreID, 4),
        height:100,
        displayValue: true
    });

    //converte il contenuto di canvas (barcode) in un URL PNG a 64 bit
    return canvas.toDataURL("image/jpeg")
}

function barcodeToJPG(img: string, nomeFile: string): void {
    //creazione di un link temporaneo per eseguire il download del file
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = img;
    link.download = nomeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    canvas.remove();
}

async function scaricaBarcode(): Promise<void>{
    //prelevo checkbox selezionate
    const checkboxSelezionate = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].caselleSelezione:checked');

    //controllo che sia selezionata almeno una checkbox
    if (checkboxSelezionate.length !== 0) {
        try {
            const transazione = database.transaction("Copie", "readwrite");
            const storeCopie = transazione.objectStore("Copie");

            //itero sulle copie selezionate, eseguendo la stampa
            const selezionate = Array.from(checkboxSelezionate).map(async (checkbox) => {
                // Trova la riga della checkbox
                const riga = checkbox.closest("tr");

                //controllo che sia stata selezionata una riga
                if (riga) {
                    // Preleva la seconda cella (indice 0) che contiene l'ID della copia
                    const idCopia = riga.cells[1]?.textContent?.trim();

                    //controllo id copia (anche se dovrebbe sempre essere valido)
                    if (idCopia) {
                        return new Promise<void>((resolve, reject) => {
                            //cerco copia da vendere
                            const richiestaGet = storeCopie.get(Number(idCopia));

                            //richiesta accettata da DB
                            richiestaGet.onsuccess = () => {
                                const copiaPrelevata: Copia = richiestaGet.result;
                                //preparo barcode
                                const barCode: string = newBarcode(copiaPrelevata.codiceUnivoco, venditore.id);

                                barcodeToJPG(barCode, `${copiaPrelevata.codiceUnivoco}_copiaID`);
                                resolve();
                            };

                            richiestaGet.onerror = () => {
                                reject(new Error(`Errore nel recupero della copia ${idCopia}.`));
                            };
                        });
                    }else{
                        Promise.resolve(); //ignora elemento non valido
                    }
                }else{
                    Promise.resolve(); //ignora elemento non valido
                }
            });

            //risolvo quando tutte le vendite sono state effettuate
            await Promise.all(selezionate);
            window.alert("Download avviati!");

        //stampo errore nella console
        } catch (errore) {
            if (errore instanceof Error) {
                console.error(errore.message);
            }
        }
    }
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaCopieVenditore();
        
        //se ISBN ha del contenuto, significa che ritorno dalla scelta del libro: riapro popup per registrare la copia
        if(isbn != null){
            ripristinaPopup();
        }

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});