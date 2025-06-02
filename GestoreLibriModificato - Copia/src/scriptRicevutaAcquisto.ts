import { Copia } from "./Copia";
import { Libro } from "./Libro";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelevo nome cliente
const nome:string = parametri.get("nome") as string;
//prelevo cognome cliente
const cognome:string = parametri.get("cognome") as string;

//database
let database: IDBDatabase;

//campo in cui mostro l'importo totale
const campoImportoTotale = document.getElementById("importoTotale") as HTMLParagraphElement;

//campo in cui mostro la data e l'ora di acquisto
const campoDataAcquisto = document.getElementById("dataAcquisto") as HTMLParagraphElement;

//campo in cui segno nome e cognome del cliente
const campoDatiCliente = document.getElementById("datiCliente") as HTMLParagraphElement;

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

//leggo tutte le copie da includere nella ricevuta
async function prelevaCopieRicevuta(): Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("CopieRicevuta", "readonly");
        const tabellaCopieRicevuta = transazione.objectStore("CopieRicevuta");

        const richiesta = tabellaCopieRicevuta.getAll();

        richiesta.onsuccess = () => {
            resolve(richiesta.result);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}

async function caricaRicevuta(): Promise<void>{
    try{
        //prelevo copie 
        const copieRicevuta: Copia[] = await prelevaCopieRicevuta();
        
        //calcolo importo totale e lo mostro
        calcolaTotale(copieRicevuta);
        
        // prelevo reference del corpo della tabella per visualizzare le singole copie del venditore
        const corpoTabellaCopie = document.getElementById("corpoTabellaCopie") as HTMLTableSectionElement;
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";
        
        //itero e visualizzo ogni copia
        for(let i = 0; i < copieRicevuta.length; i++){
            let copia: Copia = copieRicevuta[i];

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

            //creo cella titolo libro associato alla copia e la aggiungo alla riga
            const cellaTitoloLibro = document.createElement("td");
            cellaTitoloLibro.textContent = libro.titolo;
            riga.appendChild(cellaTitoloLibro);

            //creo cella prezzo scontato e la aggiungo alla riga
            const cellaPrezzoScontato = document.createElement("td");
            cellaPrezzoScontato.textContent = String(copia.prezzoScontato);
            riga.appendChild(cellaPrezzoScontato);

            // inserisco riga nel corpo della tabella
            corpoTabellaCopie.appendChild(riga);
        }

        //segno data e ora della transazione
        campoDataAcquisto.innerHTML = new Date().toLocaleString();

        //imposto nome e cognome del cliente
        campoDatiCliente.innerHTML = `${nome} ${cognome}`;

    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
        
    }
}

//funzione che calcola l'importo totale delle copie nel carrello
function calcolaTotale(elencoCopie: Copia[]): void{
    //importo totale
    let importoTotale: number = 0;
    
    //itero e sommo
    elencoCopie.forEach((copia: Copia) => {
        importoTotale += copia.prezzoScontato;
    });

    //imposto totale
    campoImportoTotale.innerHTML = String(importoTotale);
}

async function svuotaRicevuta(): Promise<void>{
    //transazione
    const transazione = database.transaction("CopieRicevuta", "readwrite");
    const tabellaCopieRicevuta = transazione.objectStore("CopieRicevuta");

    const richiestaSvuota = tabellaCopieRicevuta.clear();

    richiestaSvuota.onsuccess = () => {
        //chiudo pagina
    }

    richiestaSvuota.onerror = () => {
        throw new Error("Errore, impossbile completare la stampa!");
    }
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //preparo ricevuta
        await caricaRicevuta();

        //stampo ricevuta
        window.print();

        //svuoto ricevuta
        await svuotaRicevuta();

    } catch (errore) {
        if(errore instanceof Error){
            console.error(errore.message);
        }
    }
});