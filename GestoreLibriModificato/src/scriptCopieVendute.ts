import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";
import { ws } from "./websocket";

//database
let database: IDBDatabase;

//password tentata nel login
let passTentata = String(localStorage.getItem("passwordTentata"))

//bottone che, quando cliccato, ripristina le copie selezionate
const bottoneAnnullaVendita = document.getElementById("annullaVendita") as HTMLButtonElement;
bottoneAnnullaVendita?.addEventListener("click", annullaVendita);

//campo in cui mostro il totale ricavato
const campoRicavoTotale = document.getElementById("ricavoTotale") as HTMLInputElement;

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

    ws.send("C-" + String(copiaDaInviare?.toString())+"-"+passTentata);
}


//ascolto modifiche al DB delle copie 
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "Copie") {
        console.log("Aggiornamento ricevuto: ricarico copie vendute...");
        
        //aggiorno pagina
        await caricaCopieVendute();
    }
};

//prelevo da DB tutte le copie vendute con stato === "V"
async function prelevaCopieVendute(): Promise<Copia[]> {
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");

        const richiesta = tabellaCopie.getAll();

        richiesta.onsuccess = () => {
            // filtro le copie con stato === "V"
            const copieVendute: Copia[] = richiesta.result.filter((copia: Copia) => copia.stato === "V");
            resolve(copieVendute);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

async function caricaCopieVendute(): Promise<void>{
    try{
        //prelevo copie 
        const copieVendute: Copia[] = await prelevaCopieVendute();
    
        //calcolo ricavo totale e lo mostro
        calcolaTotale(copieVendute);

        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia
        for(let i = 0; i < copieVendute.length; i++){
            let copia: Copia = copieVendute[i];

            // Prelevo il libro associato alla copia
            const libro: Libro = await new Promise<Libro>((resolve, reject) => {
                const transazioneLibri = database.transaction("Libri", "readonly");
                const tabellaLibri = transazioneLibri.objectStore("Libri");
                //prelevo libro in base a ISBN associato alla copia
                const richiestaLibro = tabellaLibri.get(copia.libroDellaCopiaISBN);

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

            //creo cella per selezionare le copie da ripristinare
            const cellaSelezione = document.createElement("td");
            //creo checkbox per la selezione
            const casellaSelezione = document.createElement("input");
            //imposto casella con spunta
            casellaSelezione.setAttribute("type", "checkbox");
            //imposto classe per CSS
            casellaSelezione.setAttribute("class", "caselleSelezione");
            //aggiungo casella alla sua cella
            cellaSelezione.appendChild(casellaSelezione);
            //aggiungo cella alla riga
            riga.appendChild(casellaSelezione);

            //creo cella id copia e la aggiungo alla riga
            const cellaIDCopia = document.createElement("td");
            cellaIDCopia.textContent = String(copia.codiceUnivoco);
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
            cellaPrezzoCopertina.textContent = String(copia.prezzoCopertina);
            riga.appendChild(cellaPrezzoCopertina);

            //creo cella prezzo scontato e la aggiungo alla riga
            const cellaPrezzoScontato = document.createElement("td");
            cellaPrezzoScontato.textContent = String(copia.prezzoScontato);
            riga.appendChild(cellaPrezzoScontato);

            // inserisco riga nel corpo della tabella
            corpoTabellaCopie.appendChild(riga);
        }
    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
    }
}

//funzione per il ripristino delle copie nel cestino
async function annullaVendita(): Promise<void> {
    //prelevo checkbox selezionate
    const checkboxSelezionate = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"].caselleSelezione:checked');

    //controllo che sia stata selezionata almeno una casella
    if (checkboxSelezionate.length !== 0) {
        //chiedo conferma di ripristino
        const confermaRipristino = window.confirm("Vuoi ripristinare le copie selezionate?");

        //ripristino dopo conferma dell'utente
        if (confermaRipristino) {
            try {
                const transazione = database.transaction("Copie", "readwrite");
                const storeCopie = transazione.objectStore("Copie");

                //itero sulle copie selezionate, eseguendo gli aggiornamenti uno alla volta
                const ripristini = Array.from(checkboxSelezionate).map(async (checkbox) => {
                    //prelevo riga corrispondente alla checkbox selezionata
                    const riga = checkbox.closest("tr");

                    //verifico che la riga sia valida
                    if (riga) {
                        //prelevo id copia
                        const idCopia = riga.cells[0]?.textContent?.trim();

                        //controllo che l'id copia sia valido (sicuramente)
                        if (idCopia) {
                            return new Promise<void>((resolve, reject) => {
                                //prelevo copia da aggiornare
                                const richiestaGet = storeCopie.get(Number(idCopia));

                                //database accessibile
                                richiestaGet.onsuccess = () => {
                                    //prelevo copia
                                    const copia: Copia = richiestaGet.result;

                                    //se la copia è stata trovata...
                                    if (copia) {
                                        //aggiorno lo stato della copia a "D"
                                        copia.stato = "D";
                                        //aggiorno ultima modifica
                                        copia.ultimaModifica = new Date().toLocaleString();

                                        //richiedo aggiornamento nello store
                                        const richiestaPut = storeCopie.put(copia);

                                        //database accessibile
                                        richiestaPut.onsuccess = () => {
                                            //notifico modifiche al DB delle copie
                                            databaseChannel.postMessage({ store: "Copie" });
                                            //notifico modifica del totale da dare al venditore
                                            databaseChannel.postMessage({store: "Venditori"});
                                            //invia dati
                                            inviaDati(copia);

                                            resolve();
                                        };

                                        //database non accessibile
                                        richiestaPut.onerror = () => {
                                            reject(new Error("Errore nell'aggiornamento dello stato della copia."));
                                        };

                                    //copia non trovata
                                    } else {
                                        reject(new Error(`Copia con ID ${idCopia} non trovata nello store 'Copie'.`));
                                    }
                                };

                                //errore di accesso a DB
                                richiestaGet.onerror = () => {
                                    reject(new Error("Errore nel recupero della copia."));
                                };
                            });
                        }
                    }
                });

                //risolvo quando tutti gli aggiornamenti sono stati effettuati; attendo
                await Promise.all(ripristini);
                window.alert("Copia/e ripristinate correttamente.");

                //aggiorno tabella
                await caricaCopieVendute();
            } catch (errore) {
                if(errore instanceof Error){
                    console.log(errore.message);
                }
            }
        }
    } else {
        window.alert("Seleziona almeno una copia da ripristinare");
    }
}

//recupero libro dato isbn
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

//funzione che preleva un venditore dato il suo ID
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

//funzione che calcola l'incasso totale in base alle copie vendute
function calcolaTotale(elencoCopie: Copia[]): void{
    //incasso totale
    let incassoTotale: number = 0;
    
    //itero e sommo
    elencoCopie.forEach((copia: Copia) => {
        incassoTotale += copia.prezzoScontato;
    });

    //imposto totale
    campoRicavoTotale.value = String(incassoTotale);
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie vendute
        await caricaCopieVendute();

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});