import { Copia } from "./Copia";
import { Libro } from "./Libro";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);

//database
let database: IDBDatabase;

//elenco delle copie nella ricevuta
let copieRicevuta: Copia[];

//importo totale
let importoTotale: number;

//campo in cui mostro l'importo totale
const campoImportoTotale = document.getElementById("importoTotale") as HTMLParagraphElement;

//campo in cui mostro la data e l'ora di acquisto
const campoDataAcquisto = document.getElementById("dataAcquisto") as HTMLParagraphElement;

//campo in cui segno nome e cognome del cliente
const campoDatiCliente = document.getElementById("nomeCliente") as HTMLInputElement;

//campo in cui l'utente digita i soldi con cui il cliente paga; al click dell'invio o al click furoi dalla casella, calcolo resto
const campoSoldiDati = document.getElementById("contantiDati") as HTMLInputElement;
campoSoldiDati?.addEventListener("keydown", (event) => calcolaResto(event));
campoSoldiDati?.addEventListener("blur", () => calcolaResto(null));

//campo del resto
const campoResto = document.getElementById("resto") as HTMLTableCellElement;

//bottone per stampare
const bottoneStampa = document.getElementById("stampa") as HTMLButtonElement;
bottoneStampa?.addEventListener("click", (event) => calcolaResto(event));

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



    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
        
    }
}

//funzione che calcola l'importo totale delle copie nel carrello
function calcolaTotale(): number{
    //importo totale
    let importoTotale: number = 0;
    
    //itero e sommo
    copieRicevuta.forEach((copia: Copia) => {
        importoTotale += copia.prezzoScontato;
    });

    //imposto totale
    campoImportoTotale.innerHTML = String(importoTotale);

    //restituisco totale
    return importoTotale;
}

//calcolo resto, al click di invio o al click su stampa
async function calcolaResto(event: KeyboardEvent | MouseEvent | null): Promise<void>{
    //controllo che siano stati inseriti i dati del cliente, quando clicco invio nel campo dei contanti o quando clicco stampa
    if(campoDatiCliente.value === "" && event !== null){
        window.alert("Inserire nome e cognome del cliente!");
    }else{
        if((event instanceof KeyboardEvent && event.key === "Enter") || (event instanceof MouseEvent && event.target === bottoneStampa) || (event === null)){
            //calcolo resto come differenza tra dato e totale
            const resto: number = parseFloat((Number(campoSoldiDati.value) - importoTotale).toFixed(2));
    
            //controllo che il cliente abbia dato soldi a sufficienza
            if(resto < 0){
                //se l'ascoltatore viene triggerato dalla perdita del focus della casella, evito popup fastidiosi
                if(event !== null){
                    window.alert("Contanti insufficienti!");
                }
    
            }else{
                campoResto.textContent = String(resto);
    
                //se l'ascoltatore viene triggerato dalla perdita del focus della casella, evito popup di stampa fastidiosi
                if(event !== null){
                    window.print();
                }
            }
        }
    }
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //prelevo copie
        copieRicevuta = await prelevaCopieRicevuta();
        
        //preparo ricevuta
        await caricaRicevuta();

        //calcolo totale
        importoTotale = calcolaTotale();

    } catch (errore) {
        if(errore instanceof Error){
            console.error(errore.message);
        }
    }
});