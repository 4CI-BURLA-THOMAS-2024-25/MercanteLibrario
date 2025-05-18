import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelevo ID del venditore
const venditoreID: number = Number(parametri.get("id"));
//prelevo eventuale isbn
const isbn:string = parametri.get("isbn") as string;

//database
let database: IDBDatabase;

//venditore di cui gestisco le copie
let venditore: Venditore;

//libro associato alla copia in registrazione
let libro: Libro;

//associo funzione al bottone per registrare una nuova copia associata al venditore
const bottoneAggiungiCopie = document.getElementById("aggiungiCopia") as HTMLButtonElement;
bottoneAggiungiCopie?.addEventListener("click", apriRegistrazioneCopia);

//prelevo reference del popup per aggiungere nuove copie
const popupAggiungiCopie = document.getElementById("popupRegistraCopia");

//reference del bottone che conferma la registrazione della copia con relativo comportamento associato
const bottoneRegistraCopia = document.getElementById("registraCopia");
bottoneRegistraCopia?.addEventListener("click", preparaCopiaDaRegistrare);

//prelevo reference del bottone per chiudere il popup e vi associo funzione per chiuderlo
const bottoneChiudiPopup = document.getElementById("chiudiPopup") as HTMLButtonElement;
bottoneChiudiPopup?.addEventListener("click", chiudiRegistrazioneCopia);

// prelevo reference del bottone per aprire finestra con i libri
const bottoneApriLibri = document.getElementById("scegliLibro") as HTMLButtonElement;
bottoneApriLibri?.addEventListener("click", mostraLibri);

//reference del campo di testo in cui inserire il prezzo di copertina
const campoPrezzoCopertina = document.getElementById("prezzoCopertina") as HTMLInputElement;

//reference del campo di testo non modificabile che mostra il libro selezionato per la registrazione della copia
const etichettaTitoloLibro = document.getElementById("titoloLibro") as HTMLInputElement;

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
            //recupero venditore da database dato il suo CF, con funzione anonima asincrona
            libro = await prelevaLibro(Number(isbn));
            
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

//recupero libro dato isbn
async function prelevaLibro(isbnRicerca: number): Promise<Libro>{
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

//prelevo da DB tutte le copie del venditore, in base al suo ID
async function prelevaCopieVenditoreID():Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");
        const indice = tabellaCopie.index("venditoreID");

        console.log(venditoreID);

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
        //prelevo copie che hanno Id del venditore coerente con il venditore che si sta gestendo
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

        //prelevo reference del corpo della tabella (ad una riga) che utilizzo per mostrare le info del libro di cui sto gestendo le copie
        const corpoInfoVenditore = document.getElementById("corpoInfoVenditore") as HTMLTableSectionElement;
        //svuoto tabella
        corpoInfoVenditore.innerHTML = "";

        //creo riga con le info del venditore
        const rigaInfoVenditore: HTMLTableRowElement = document.createElement("tr");
        //inserisco info del venditore in analisi nella riga creata
        rigaInfoVenditore.innerHTML = `<td>${venditore.id}</td><td>${venditore.nome}</td><td>${venditore.cognome}</td><td>${venditore.email}</td><td>${venditore.nTelefono}</td><td>${venditore.classe}</td><td>${}</td>`;
        //inserisco riga con le info del libro nella tabella a singola riga
        corpoInfoLibro.appendChild(rigaInfoLibro);

        // prelevo reference del corpo della tabella per visualizzare le singole copie del libro
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //itero e visualizzo ogni copia del libro
        for(let i = 0; i < copieLibro.length; i++){
            let copiaDelLibro: Copia = copieLibro[i];

            // Prelevo il venditore associato alla copia
            const venditore = await new Promise<Venditore | null>((resolve, reject) => {
                const transazioneVenditori = database.transaction("Venditori", "readonly");
                const tabellaVenditori = transazioneVenditori.objectStore("Venditori");
                //prelevo venditore in base al codice fiscale associato alla copia
                const richiestaVenditore = tabellaVenditori.get(copiaDelLibro.venditoreCF);

                //acesso a DB andato a buon fine
                richiestaVenditore.onsuccess = () => {
                    //venditore trovato
                    if (richiestaVenditore.result) {
                        resolve(richiestaVenditore.result);

                    //venditore non trovato
                    } else {
                        resolve(null);  // fallback
                    }
                };

                //accesso a DB negato
                richiestaVenditore.onerror = () => {
                    resolve(null); // fallback
                };
            });

            //creo riga nella tabella
            const riga: HTMLTableRowElement = document.createElement("tr");
            riga.innerHTML = `<td>${copiaDelLibro.codiceUnivoco}</td>
                            <td>${venditore?.nome + "  " + venditore?.cognome}</td>
                            <td>${copiaDelLibro.prezzoScontato}</td>`;
            // inserisco riga nel corpo della tabella
            corpoTabellaCopie.appendChild(riga);
        }
    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
        
    }

}

//calcolo il prezzo MAX da dare al venditore, nel caso in cui vengano vendute tutte le sue copie
async function caricaSommaPrezzoVenditore(): Promise<number> {
    let sommaPrezziCopie: number;
    // 1. Preleva tutti i venditori
    const venditori: Venditore[] = await new Promise((resolve, reject) => {
        const transazione = database.transaction("Venditori", "readonly");
        const tabellaVenditori = transazione.objectStore("Venditori");
        const richiesta = tabellaVenditori.getAll();

        //accesso approvato
        richiesta.onsuccess = () => resolve(richiesta.result);
        //accesso negato
        richiesta.onerror = () => reject(richiesta.error);
    });

    // 2. Itera su ciascun venditore
    for (const venditore of venditori) {
        //prelevo elenco delle copie per ciascun venditore
        const copie: Copia[] = await new Promise((resolve, reject) => {
            const transazione = database.transaction("Copie", "readonly");
            const tabellaCopie = transazione.objectStore("Copie");
            const indice = tabellaCopie.index("venditoreID");

            const richiesta = indice.getAll(venditore.id); // Usa l’indice per filtrare

            richiesta.onsuccess = () => resolve(richiesta.result);
            richiesta.onerror = () => reject(richiesta.error);
        });

        // 3. Somma i prezzi scontati delle copie di ciascun venditore; sommo partendo da 0
        const sommaPrezzi = copie.reduce((totale, copia) => {
            return totale + copia.prezzoScontato;
        }, 0);

        //salvo totale del prezzo delle copie del venditore
        sommaPrezziCopie.push(sommaPrezzi);
    }

    //restituisco array con tutte le somme delle copie per venditore
    return sommaPrezziCopie;
}


// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaCopieLibro();
        
        //se CF ha del contenuto, significa che sono di ritorno dalla scelta del venditore: riapro popup per registrare la copia
        if(codiceFiscaleVenditore != null){
            ripristinaPopup();
        }

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});