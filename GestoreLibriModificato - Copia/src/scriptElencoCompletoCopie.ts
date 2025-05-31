import { databaseChannel } from "./broadcast";
import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";
import { ws } from "./websocket";

//database
let database: IDBDatabase;

// Dichiara JsBarcode come variabile globale
declare const JsBarcode: any;
//barcode
let canvas = document.getElementById("canvaBarcode") as HTMLCanvasElement;

//bottone per vendere copie
const bottoneVendiCopie = document.getElementById("vendiCopie") as HTMLButtonElement;
bottoneVendiCopie?.addEventListener("click", vendiCopieSelezionate);

//bottone per scaricare i barcode dellee copie selezionate
const bottoneOttieniBarcode = document.getElementById("ottieniBarcode") as HTMLButtonElement;
bottoneOttieniBarcode?.addEventListener("click", scaricaBarcode);

//bottone che apre popup per scansionare barcode di una copia e vendere
const bottonebarcodeVendita = document.getElementById("barcodeVendita") as HTMLButtonElement;
bottonebarcodeVendita?.addEventListener("click", apriScansioneBarcode);

//popup che mostra l'interfaccia per leggere barcode e vendere
const popupScansionaBarcode = document.getElementById("popupScansionaBarcode");

//campo in cui inserisco il barcode letto
const campoBarcodeLetto = document.getElementById("barcodeLetto") as HTMLInputElement;
campoBarcodeLetto?.addEventListener("keydown", (event) => vendiCopiaBarcode(event));

//campo in cui mostro il prezzo di copertina della copia letto da barcode
const campoPrezzoCopertinaBarcode = document.getElementById("prezzoCopertinaBarcode") as HTMLInputElement;

//area in cui mostro il titolo del libro associato alla copia e letto da DB
const areaTitoloLibroBarcode = document.getElementById("titoloLibroBarcode") as HTMLTextAreaElement;

//bottone per chiudere il popup dei barcode
const bottoneChiudiPopupBarcode = document.getElementById("chiudiPopupBarcode") as HTMLButtonElement;
bottoneChiudiPopupBarcode?.addEventListener("click", chiudiScansioneBarcode);

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
        const libroDellaCopia:  Libro = await prelevaLibroISBN(Number(copiaGrezza.libroDellaCopiaISBN));
        //prelevo venditore associato alla copia
        const venditoreDellaCopia: Venditore = await prelevaVenditoreID(Number(copiaGrezza.venditoreID));
        //ricostruisco istanza reale della copia
        copiaDaInviare = new Copia(libroDellaCopia, Number(copiaGrezza.codiceUnivoco), Number(copiaGrezza.prezzoCopertina), venditoreDellaCopia, copiaGrezza.stato);
    }

    ws.send("C," + String(copiaDaInviare?.toString()));
}

//ascolto modifiche al DB delle copie
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "Copie") {
        console.log("Aggiornamento ricevuto: ricarico copie...");
        
        //aggiorno pagina
        location.reload();
    }
};

function apriScansioneBarcode(): void{
    if(popupScansionaBarcode != null){
        //quando clicco il bottone per leggere barcode, apro popup
        popupScansionaBarcode.style.display = "flex";

        //assegno il focus al campo di lettura del barcode
        campoBarcodeLetto.focus();
    }
}

function chiudiScansioneBarcode(): void{
    if(popupScansionaBarcode != null){
        //svuoto campi
        campoBarcodeLetto.value = "";
        campoPrezzoCopertinaBarcode.value = "";
        areaTitoloLibroBarcode.value = "";

        //chiudo popup
        popupScansionaBarcode.style.display = "none";

    }
}

async function prelevaElencoCompletoCopie(): Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");

        const richiesta = tabellaCopie.getAll(); // cerca tutte le copie

        richiesta.onsuccess = () => {
            //array delle copie
            resolve(richiesta.result);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

//funzione che carica tutte le copie e le mostra
async function caricaElencoCompletoCopie(): Promise<void>{
    try{
        //prelevo copie
        const elencoCopie: Copia[] = await prelevaElencoCompletoCopie();

        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia
        for(let i = 0; i < elencoCopie.length; i++){
            const copiaDelVenditore: Copia = elencoCopie[i];
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
    
                        //libro non trovato
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
                //creo checkbox per la selezione
                const casellaSelezione = document.createElement("input");
                //imposto casella con spunta
                casellaSelezione.setAttribute("type", "checkbox");
                //imposto classe per CSS
                casellaSelezione.setAttribute("class", "caselleSelezione");
                //se la copia è venduta, disabilito la checkbox
                if(copiaDelVenditore.stato === "V"){
                    casellaSelezione.disabled = true;
                    riga.classList.add("venduta");
                }
                //aggiungo casella alla sua cella
                cellaSelezione.appendChild(casellaSelezione);
                //aggiungo cella alla riga
                riga.appendChild(cellaSelezione);
    
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

//funzione per segnalare una copia come venduta
async function vendiCopieSelezionate(): Promise<void> {
    //prelevo checkbox selezionate
    const checkboxSelezionate = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].caselleSelezione:checked');

    //controllo che sia selezionata almeno una checkbox
    if (checkboxSelezionate.length !== 0) {
        //chiedo conferma
        const confermaVendita = window.confirm("Sei sicuro di voler vendere le copie selezionate?");

        //se la conferma non viene fornita, non eseguo
        if (confermaVendita) {
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
                                        copia.stato = "V";
                                        //aggiorno la copia nel database
                                        const richiestaUpdate = storeCopie.put(copia);

                                        //aggiornamento andato a buon fine
                                        richiestaUpdate.onsuccess = () => {
                                            //notifico modifiche al DB delle copie
                                            databaseChannel.postMessage({ store: "Copie" });
                                            //notifico modifica del totale da dare al venditore
                                            databaseChannel.postMessage({store: "Venditori"});
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
                window.alert("Copia/e vendute con successo.");
                // Ricarica la tabella per aggiornare la UI
                await caricaElencoCompletoCopie();

            //stampo errore nella console
            } catch (errore) {
                if (errore instanceof Error) {
                    console.error(errore.message);
                }
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

//funzione che inserisce padding a id copie e venditori
function inserisciPadding(num: number, totalLength: number, padChar: string = '0'): string {
    return num.toString().padStart(totalLength, padChar);
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
                                const barCode: string = newBarcode(copiaPrelevata.codiceUnivoco, copiaPrelevata.venditoreID);

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
    }else{
        window.alert("Seleziona le copie di cui vuoi scaricare il barcode");
    }
}

async function vendiCopiaBarcode(event: KeyboardEvent): Promise<void> {
    // Verifico che sia stato cliccato INVIO (la scansionatrice lo fa alla fine della lettura del barcode)
    if (event.key === "Enter") {
        try {
            // Prelevo barcode, ovvero id della copia
            const idCopiaBarcode: string = campoBarcodeLetto.value;
            // Prelevo copia da DB dato il suo ID letto
            const copiaBarcode: Copia = await prelevaCopia(Number(idCopiaBarcode));

            if(copiaBarcode.stato === "V"){
                window.alert("Copia già venduta!");
            }else{
                // Prelevo libro associato alla copia
                const libroDellaCopia: Libro = await prelevaLibroISBN(copiaBarcode.libroDellaCopiaISBN);
    
                // Imposto contenuto campi
                campoPrezzoCopertinaBarcode.value = String(copiaBarcode.prezzoCopertina);
                areaTitoloLibroBarcode.value = libroDellaCopia.titolo;
    
                //do al browser il tempo di effettuare il repainting della pagina così da aggiornare i campi del popup
                await new Promise(resolve => setTimeout(resolve, 50));
    
                // Chiedo conferma di vendita
                const confermaVendita = window.confirm("Sei sicuro di voler vendere la copia?");
                if (confermaVendita) {
                    // Cambio stato della copia
                    copiaBarcode.stato = "V";
    
                    // Aggiorno copia su DB
                    await aggiornaStatoCopia(copiaBarcode);
    
                    //ricarico la pagina
                    location.reload();
                }else{
                    chiudiScansioneBarcode();
                }
            }

        } catch (errore) {
            if (errore instanceof Error) {
                console.error(errore.message);
            }
        } finally {
            // Pulisco il campo barcode dopo la conferma o errore
            campoBarcodeLetto.value = "";
        }
    }
}

async function prelevaCopia(idCopia: number): Promise<Copia>{
    //preparo transazione per leggere da store delle copie
    const transazione = database.transaction("Copie", "readwrite");
    const tabellaCopie = transazione.objectStore("Copie");

    const copiaCercata: Copia = await new Promise((resolve,reject) => {
        //richiedo copia cercata
        const richiestaCopia = tabellaCopie.get(idCopia);
    
        //accesso riuscito
        richiestaCopia.onsuccess = () => {
            //copia trovata
            if(richiestaCopia.result){
                resolve(richiestaCopia.result);

            //copia non trovata
            }else{
                reject(window.alert("Copia non trovata"));
            }
        }
    
        ///accesso fallito
        richiestaCopia.onerror = () => {
            reject(new Error("Errore nella richiesta"));
        }
    });

    return copiaCercata;
}

async function aggiornaStatoCopia(copiaDaAggiornare: Copia): Promise<void>{
    //preparo transazione per leggere da store delle copie
    const transazione = database.transaction("Copie", "readwrite");
    const tabellaCopie = transazione.objectStore("Copie");

    //aggiorno copia
    const richiestaUpdate = tabellaCopie.put(copiaDaAggiornare);

    //aggiornamento andato a buon fine
    richiestaUpdate.onsuccess = () =>{
        //notifico modifiche al DB delle copie
        databaseChannel.postMessage({store: "Copie" });
        //notifico modifica del totale da dare al venditore
        databaseChannel.postMessage({store: "Venditori"});
        //invia copia aggiornata
        inviaDati(copiaDaAggiornare);
    }

    richiestaUpdate.onerror = () => {
        throw new Error("Impossibile aggiornare lo stato della copia");
    }
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaElencoCompletoCopie();
    } catch (erroreDB) {
        console.error(erroreDB);
    }
});
