import { Copia } from "./Copia";
import { Libro } from "./Libro";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";

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

//ascolto modifiche al DB delle copie eliminate
databaseChannel.onmessage = async (evento) => {
    const dati = evento.data;

    if (dati.store === "CopieEliminate") {
        console.log("Aggiornamento ricevuto: ricarico copie del cestino...");
        
        //mostro le copie del libro (aggiornate)
        await caricaCopieCestino();
    }
};

//prelevo da DB tutte le copie nel cestino
async function prelevaCopieCestino():Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("CopieEliminate", "readonly");
        const tabellaCopieEliminate = transazione.objectStore("CopieEliminate");

        const richiesta = tabellaCopieEliminate.getAll(); // cerca tutte le copie con quel ID venditore

        richiesta.onsuccess = () => {
            //array di tutte le copie nel cestino
            resolve(richiesta.result);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

async function caricaCopieCestino(): Promise<void>{
    try{
        //prelevo copie 
        const copieCestino: Copia[] = await prelevaCopieCestino();
        
        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia
        for(let i = 0; i < copieCestino.length; i++){
            let copiaDelVenditore: Copia = copieCestino[i];

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
            cellaPrezzoScontato.textContent = String(copiaDelVenditore.prezzoCopertina);
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
        if(confermaRipristino){
            try {
                const transazione = database.transaction(["Copie", "CopieEliminate"], "readwrite");
                const storeCopie = transazione.objectStore("Copie");
                const storeEliminate = transazione.objectStore("CopieEliminate");
        
                //itero sulle copie selezionate, eseguendo le eliminazioni
                const ripristini = Array.from(checkboxSelezionate).map(async (checkbox) => {
                    //prelevo riga corrispondente alla checkbox selezionata
                    const riga = checkbox.closest("tr");

                    //verifico che la riga sia valida
                    if(riga){
                        //prelevo id copia
                        const idCopia = riga.cells[0]?.textContent?.trim();
                        
                        //controllo che l'id copia sia valido (sicuramente)
                        if(idCopia){
                            return new Promise<void>((resolve, reject) => {
                                //prelevo copia da ripristinare
                                const richiestaGet = storeEliminate.get(Number(idCopia));
                
                                //database accessibile
                                richiestaGet.onsuccess = () => {
                                    //prelevo copia
                                    const copia: Copia = richiestaGet.result;

                                    //se la copia è stata trovata...
                                    if (copia) {
                                        //richiedo aggiunta allo store delle copie non eliminate
                                        const richiestaAdd = storeCopie.add(copia);

                                        //database accessibile
                                        richiestaAdd.onsuccess = () => {
                                            //rimuovo copia dal cestino
                                            storeEliminate.delete(Number(idCopia));
                                            
                                            //notifico modifiche ai due DB delle copie
                                            databaseChannel.postMessage({store: "Copie"});
                                            databaseChannel.postMessage({store: "CopieEliminate"});

                                            resolve();
                                        };

                                        //database non accessibile
                                        richiestaAdd.onerror = () => {
                                            reject(new Error("Errore nel ripristino della copia."));
                                        };

                                    //copia non trovata
                                    } else {
                                        reject(new Error(`Copia con ID ${idCopia} non trovata nello store 'CopieEliminate'.`));
                                    }
                                };
                
                                //errore di accesso a DB
                                richiestaGet.onerror = () => {
                                    reject(new Error("Errore nel recupero della copia eliminata."));
                                };
                            });

                        }
                    }
                });
        
                //risolvo quando tutti i ripristini sono state effettuate; attendo
                await Promise.all(ripristini);
                window.alert("Copie ripristinate correttamente.");
                
                //aggiorno tabella
                await caricaCopieCestino();
            }catch (errore) {
                console.error("Errore durante il ripristino:", errore);
                alert("Errore durante il ripristino delle copie.");
            }
        }
    }else{
        window.alert("Seleziona almeno una copia da ripristinare");
    }

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