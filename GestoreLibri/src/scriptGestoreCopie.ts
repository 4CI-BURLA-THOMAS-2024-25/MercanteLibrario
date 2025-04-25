//importo classe Libro nel "main" 
import { Copia } from "./Copia";
// importo classe Copia nel "main"
import { Libro } from "./Libro";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelevo isbn
const isbn = parametri.get("isbn");
//database
let database: IDBDatabase;

// libro di cui analizzo le copie
let libro: Libro;

//associo funzione al bottone per registrare una nuova copia del libro
const bottoneAggiungiCopie = document.getElementById("aggiungiCopia") as HTMLButtonElement;
bottoneAggiungiCopie?.addEventListener("click", apriRegistrazioneCopia);

//prelevo reference del popup per aggiungere nuove copie
const popupAggiungiCopie = document.getElementById("popupRegistraCopia");
//prelevo reference del bottone per chiudere il popup e vi associo funzione per chiuderlo
const bottoneChiudiPopup = document.getElementById("chiudiPopup");
bottoneChiudiPopup?.addEventListener("click", chiudiRegistrazioneCopia);

// prelevo reference del bottone per aprire finestra con i venditori
const bottoneApriVenditori = document.getElementById("scegliVenditore");
bottoneApriVenditori?.addEventListener("click", mostraVenditori);

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

async function caricaCopieLibro(): Promise<void>{
    if (!isbn) throw new Error("ISBN non valido");

    console.log("ISBN cercato:", isbn);  // Aggiungi questo log per verificare l'ISBN

    //preparo transazione per leggere dal database
    const transazione = database.transaction("Libri", "readonly");
    //prelevo reference tabella libri del database
    const tabellaLibri = transazione.objectStore("Libri");
    
    //assegno libro o errore di recupero
    libro = await new Promise<Libro>((resolve, reject) => {
        // cerco per isbn
        const richiesta = tabellaLibri.get(Number(isbn));

        richiesta.onsuccess = () => {
            if (richiesta.result) {
                resolve(richiesta.result);
            } else {
                reject(new Error("Libro non trovato con ISBN: " + isbn));
            }
        };

        richiesta.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiesta.error);
        };

        console.log("Libro trovato:", libro);
    });   

    //controllo se il libro è stato trovato
    if (!libro) {
        console.error("Libro non trovato con ISBN:", isbn);

    }else{
        //prelevo reference del corpo della tabella (ad una riga) che utilizzo per mostrare le info del libro di cui sto gestendo le copie
        const corpoInfoLibro = document.getElementById("corpoInfoLibro") as HTMLTableSectionElement;
        //svuoto tabella
        corpoInfoLibro.innerHTML = "";

        //creo riga con le info del libro
        const rigaInfoLibro: HTMLTableRowElement = document.createElement("tr");
        //inserisco info del libro in analisi nella riga creata
        rigaInfoLibro.innerHTML = `<td>${libro.materia}</td><td>${libro.isbn}</td><td>${libro.autore}</td><td>${libro.titolo}</td><td>${libro.volume}</td><td>${libro.editore}</td><td>${libro.prezzoListino}</td><td>${libro.classe}</td>`;
        //inserisco riga con le info del libro nella tabella a singola riga
        corpoInfoLibro.appendChild(rigaInfoLibro);

        // prelevo reference del corpo della tabella per visualizzare le singole copie del libro
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";

        //prelevo elenco di copie del libro
        const copieLibro: Copia[] = libro.getCopieAsArray();

        //itero e visualizzo ogni copia del libro
        for(let i = 0; i < libro.getNCopie(); i++){
            let copiaDelLibro: Copia = copieLibro[i];

            //creo riga nella tabella
            const riga: HTMLTableRowElement = document.createElement("tr");
            riga.innerHTML = `<td>${copiaDelLibro.codiceUnivoco}</td><td>${copiaDelLibro.venditore}</td><td>${copiaDelLibro.scontoPrezzoListino}</td>`;
            // inserisco riga nel corpo della tabella
            corpoTabellaCopie.appendChild(riga);
        }
    }
}

// funzione per registrare una nuova copia di un determinato libro
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

// funzione che mostra la pagina per scegliere un venditore/aggiungerne uno nuovo
function mostraVenditori(): void{
    window.open("gestoreVenditori.html", "_blank", "menubar=no, width=700px, height=500px");
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //mostro le copie del libro
        await caricaCopieLibro();
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});