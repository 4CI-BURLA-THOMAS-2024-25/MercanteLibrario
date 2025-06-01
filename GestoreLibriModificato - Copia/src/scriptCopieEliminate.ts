import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";
import { ws } from "./websocket";

//database
let database: IDBDatabase;

//bottone che, quando cliccato, ripristina le copie selezionate
const bottoneEliminaCopie = document.getElementById("ripristinaCopie") as HTMLButtonElement;
bottoneEliminaCopie?.addEventListener("click", ripristinaCopieEliminate);

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

//ascolto modifiche al DB delle copie eliminate
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "Copie") {
        console.log("Aggiornamento ricevuto: ricarico copie eliminate...");
        
        //aggiorno pagina
        location.reload();
    }
};

//prelevo da DB tutte le copie nel cestino con stato === "E"
async function prelevaCopieEliminate(): Promise<Copia[]> {
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopieEliminate = transazione.objectStore("Copie");

        const richiesta = tabellaCopieEliminate.getAll(); // cerca tutte le copie

        richiesta.onsuccess = () => {
            // filtro le copie con stato === "E"
            const copieEliminate: Copia[] = richiesta.result.filter((copia: Copia) => copia.stato === "E");
            resolve(copieEliminate);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

async function caricaCopieCestino(): Promise<void>{
    try{
        //prelevo copie 
        const copieCestino: Copia[] = await prelevaCopieEliminate();
        
        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia
        for(let i = 0; i < copieCestino.length; i++){
            let copiaEliminata: Copia = copieCestino[i];

            // Prelevo il libro associato alla copia
            const libro: Libro = await new Promise<Libro>((resolve, reject) => {
                const transazioneLibri = database.transaction("Libri", "readonly");
                const tabellaLibri = transazioneLibri.objectStore("Libri");
                //prelevo libro in base a ISBN associato alla copia
                const richiestaLibro = tabellaLibri.get(copiaEliminata.libroDellaCopiaISBN);

                //acesso a DB andato a buon fine
                richiestaLibro.onsuccess = () => {
                    //venditore trovato
                    if (richiestaLibro.result) {
                        resolve(richiestaLibro.result);

                    //venditore non trovato
                    } else {
                        reject(new Error("Libro con ISBN non trovato")); 
                    }
                };

                //accesso a DB negato
                richiestaLibro.onerror = () => {
                    reject(new Error("Database dei libri non reperibile")); 
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
            cellaIDCopia.textContent = String(copiaEliminata.codiceUnivoco);
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
            cellaPrezzoCopertina.textContent = String(copiaEliminata.prezzoCopertina);
            riga.appendChild(cellaPrezzoCopertina);

            //creo cella prezzo scontato e la aggiungo alla riga
            const cellaPrezzoScontato = document.createElement("td");
            cellaPrezzoScontato.textContent = String(copiaEliminata.prezzoScontato);
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
async function ripristinaCopieEliminate(): Promise<void> {
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

                //itero sulle copie selezionate, eseguendo le modifiche
                const ripristini = Array.from(checkboxSelezionate).map(async (checkbox) => {
                    //prelevo riga corrispondente alla checkbox selezionata
                    const riga = checkbox.closest("tr");

                    //verifico che la riga sia valida
                    if (riga) {
                        //prelevo id copia
                        const idCopia = riga.cells[0]?.textContent?.trim();

                        //controllo che l'id copia sia valido
                        if (idCopia) {
                            return new Promise<void>((resolve, reject) => {
                                //prelevo copia da modificare
                                const richiestaGet = storeCopie.get(Number(idCopia));

                                //database accessibile
                                richiestaGet.onsuccess = () => {
                                    //prelevo copia
                                    const copia: Copia = richiestaGet.result;

                                    //se la copia è stata trovata...
                                    if (copia) {
                                        //modifico lo stato della copia
                                        copia.stato = "D";
                                        //aggiorno ultima modifica
                                        copia.ultimaModifica = new Date().toLocaleString();

                                        //aggiorno la copia nel database
                                        const richiestaPut = storeCopie.put(copia);

                                        //database accessibile
                                        richiestaPut.onsuccess = () => {
                                            //notifico modifica al DB delle copie
                                            databaseChannel.postMessage({ store: "Copie" });
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

                //risolvo quando tutte le modifiche sono state effettuate; attendo
                await Promise.all(ripristini);
                window.alert("Copia/e ripristinate correttamente.");

                //aggiorno tabella
                await caricaCopieCestino();

            //stampo errore
            } catch (errore) {
                if(errore instanceof Error){
                    console.error(errore.message);
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

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaCopieCestino();

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});