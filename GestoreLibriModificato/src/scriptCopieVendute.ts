import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { StatoCopia } from "./StatoCopia";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";

//database
let database: IDBDatabase;

//bottone che, quando cliccato, ripristina le copie selezionate
const bottoneAnnullaVendita = document.getElementById("annullaVendita") as HTMLButtonElement;
bottoneAnnullaVendita?.addEventListener("click", annullaVendita);

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

//ascolto modifiche al DB delle copie eliminate
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "Copie") {
        console.log("Aggiornamento ricevuto: ricarico copie vendute...");
        
        //aggiorno pagina
        location.reload();
    }
};

//prelevo da DB tutte le copie vendute con stato === "V"
async function prelevaCopieVendute(): Promise<Copia[]> {
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopieVendute = transazione.objectStore("Copie");

        const richiesta = tabellaCopieVendute.getAll();

        richiesta.onsuccess = () => {
            // filtro le copie con stato === "V"
            const copieVendute = richiesta.result.filter((copia: Copia) => copia.stato === StatoCopia.Venduta);
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
                                        copia.stato = StatoCopia.Disponibile;

                                        //richiedo aggiornamento nello store
                                        const richiestaPut = storeCopie.put(copia);

                                        //database accessibile
                                        richiestaPut.onsuccess = () => {
                                            //notifico modifiche al DB delle copie
                                            databaseChannel.postMessage({ store: "Copie" });
                                            //notifico modifica del totale da dare al venditore
                                            databaseChannel.postMessage({store: "Venditori"});

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

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaCopieVendute();

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});