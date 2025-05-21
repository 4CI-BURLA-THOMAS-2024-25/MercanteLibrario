import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

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

        //chiamo funzione per calcolare il denaro MAX da dare al venditore, se vendo tutte le sue copie
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
            let copiaDelVenditore: Copia = copieVenditore[i];

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
            riga.innerHTML = `<td>${copiaDelVenditore.codiceUnivoco}</td>
                            <td>${libro.isbn}</td>
                            <td>${libro.titolo}</td>
                            <td>${copiaDelVenditore.prezzoCopertina}</td>
                            <td>${copiaDelVenditore.prezzoScontato}</td>`;
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
function calcolaSommaPrezzoVenditore(copieDelVenditore: Copia[]): number {
    let sommaPrezziCopie: number = 0;

    //sommo prezzi scontati delle copie
    for(let i = 0; i < copieDelVenditore.length; i++){
        sommaPrezziCopie += copieDelVenditore[i].prezzoScontato;
    }

    return sommaPrezziCopie;
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
            const copia: Copia = new Copia(libro, codiceCopiaAttuale, parseFloat(campoPrezzoCopertina.value), venditore);
    
            //svuoto libro
            libro = null;
    
            //chiamo scrittura su DB
            await registraCopia(copia);

        }else{
            window.alert("Scegliere un libro dalla libreria da associarte alla copia che si vuole registrare");
        }
    }else{
        window.alert("Inserire il prezzo di copertina per procedere con la registrazione");
    }
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
async function registraCopia(copiaDaSalvare: Copia):Promise<void>{
    //apro transazione
    const transazione = database.transaction("Copie", "readwrite");
    const tabellaCopie = transazione.objectStore("Copie");

    const richiestaAggiungiCopia = tabellaCopie.add(copiaDaSalvare);

    //richiesta andata a buon fine
    richiestaAggiungiCopia.onsuccess = () => {
        //comunico scrittura copia 
        //inviaDati(copiaDaSalvare);

        //aggiorno lista copie, rileggendo da DB
        caricaCopieVenditore();

        //chiudo popup di inserimento
        chiudiRegistrazioneCopia();

        //notifico aggiunta nuova copia
        //databaseChannel.postMessage({store: "Copie", action: "add"});
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

    //assegno libro o errore di recupero
    const venditorePrelevato: Venditore = await new Promise<Venditore>((resolve, reject) => {
        // cerco per isbn
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
        await caricaCopieVenditore();
        
        //se ISBN ha del contenuto, significa che ritorno dalla scelta del libro: riapro popup per registrare la copia
        if(isbn != null){
            ripristinaPopup();
        }

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});