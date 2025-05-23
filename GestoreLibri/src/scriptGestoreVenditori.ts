import { Copia } from "./Copia";
import { Venditore } from "./Venditore";

//importo daro per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";

//database
let database: IDBDatabase;

//prelevo reference del bottone per aggiungere venditori e vi associo la relativa funzione
const bottoneAggiungiVenditore = document.getElementById("aggiungiVenditore") as HTMLButtonElement;
bottoneAggiungiVenditore?.addEventListener("click", apriRegistrazioneVenditore);

//prelevo reference del popup che appare per permettere l'inserimento di un nuovo venditore
const popupAggiungiVenditore = document.getElementById("popupNuovoVenditore");

//prelevo reference del bottone per confermare l'aggiunta del venditore
const bottoneRegistraVenditore = document.getElementById("registraVenditore");
bottoneRegistraVenditore?.addEventListener("click", registraVenditore);

//prelevo reference del bottone per annullare l'aggiunta del venditore
const bottoneChiudiPopup = document.getElementById("chiudiPopup");
bottoneChiudiPopup?.addEventListener("click", chiudiRegistrazioneVenditore);

//prelevo reference delle caselle di input
const caselleInput = document.querySelectorAll(".testoInputPopup");

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

//funzione per registrare nuovo venditore
function apriRegistrazioneVenditore(): void {
    if(popupAggiungiVenditore != null){
        //quando clicco il bottone per registrare un nuovo venditore, apro il form
        popupAggiungiVenditore.style.display = "flex";
    }
}

function chiudiRegistrazioneVenditore(): void{
    if(popupAggiungiVenditore != null){
        // quando clicco il bottone per chiudere il popupAggiungiCopie, lo imposto come nascosto
        popupAggiungiVenditore.style.display = "none";
    }
}

function registraVenditore(): void{
    //array in cui salvo l'input dell'utente e che uso per creare nuovo oggetto venditore
    let datiVenditore: any[] = new Array(6);

    //leggo tutte le caselle
    for(let i = 0; i < caselleInput.length; i++){
        datiVenditore[i] = (caselleInput[i] as HTMLInputElement).value;
    }

    //creo oggetto venditore
    const venditore: Venditore = new Venditore(datiVenditore[0], datiVenditore[1], datiVenditore[2], datiVenditore[3], datiVenditore[4], datiVenditore[5]);

    //apro transazione verso object store dei venditori, in scrittura
    const transazione = database.transaction("Venditori", "readwrite");
    //salvo reference dell'object store
    const tabellaVenditori = transazione.objectStore("Venditori");
    //richiesta di aggiunta all'object store
    const richiestaAggiuntaVenditore = tabellaVenditori.add(venditore);

    //aggiunta andata a buon fine
    richiestaAggiuntaVenditore.onsuccess = () => {

        //aggiorno lista venditori, rileggendo da DB
        prelevaVenditori();

        //chiudo popup di inserimento
        chiudiRegistrazioneVenditore();

        //notifico aggiunta
        databaseChannel.postMessage({store: "Venditori", action: "add"});
    }

    //errore, venditore già presente
    richiestaAggiuntaVenditore.onerror = () => {
        console.log("Venditore già presente");
    }
}

//prelevo elenco completo vendirori da DB
async function prelevaVenditori(): Promise<void>{
    //preparo transazione per leggere dal database
    const transazione = database.transaction("Venditori", "readonly");
    //prelevo reference tabella libri del database
    const tabellaVenditori = transazione.objectStore("Venditori");

    //gestisco eventuale errore di lettura da DB
    try{
        //array dei venditori
        const venditori: Venditore[] = await new Promise<any[]>((resolve, reject) => {
            //ottengo tutti venditori
            const richiesta = tabellaVenditori.getAll();
            //accetto richiesta e restituisco risultato
            richiesta.onsuccess = () => resolve(richiesta.result);
            //rifiuto richiesta e restituisco errore
            richiesta.onerror = () => reject(richiesta.error);
        });
    
        //se la lettura non genera errore, chiamo funzione per mostrare lista dei venditori
        mostraVenditori(venditori);
    }catch(errore){
        window.alert("Errore durante il caricamento dei venditori:" + errore);
    }
}

//mostro in tabella elenco che mi viene passato
async function mostraVenditori(venditori: Venditore[]): Promise<void>{
    //prelevo reference del corpo della tabella dei venditori
    const corpoVenditori = document.getElementById("corpoTabellaVenditori") as HTMLTableSectionElement;
    //svuoto tabella
    corpoVenditori.innerHTML = "";

    //calcolo totale dei soldi da dare a ciascun venditore
    const totaleDaDare: number[] = await caricaSommaPrezzoPerTuttiIVenditori();

    //itero e creo riga per ogni venditore
    for(let i = 0; i < venditori.length; i++){
        //creo riga con le info del venditore
        const riga: HTMLTableRowElement = document.createElement("tr");

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaCF = document.createElement("td");
        cellaCF.textContent = venditori[i].codFiscale;
        riga.appendChild(cellaCF);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaNome = document.createElement("td");
        cellaNome.textContent = venditori[i].nome;
        riga.appendChild(cellaNome);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaCognome = document.createElement("td");
        cellaCognome.textContent = venditori[i].cognome;
        riga.appendChild(cellaCognome);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaEmail = document.createElement("td");
        cellaEmail.textContent = venditori[i].email;
        riga.appendChild(cellaEmail);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaTelefono = document.createElement("td");
        cellaTelefono.textContent = String(venditori[i].nTelefono);
        riga.appendChild(cellaTelefono);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaClasse = document.createElement("td");
        cellaClasse.textContent = venditori[i].classe;
        riga.appendChild(cellaClasse);

        //creo cella codicefiscale e la aggiungo alla riga
        const cellaSoldi = document.createElement("td");
        cellaSoldi.textContent = String(totaleDaDare[i]);
        riga.appendChild(cellaSoldi);

        //creo cella con bottone per vedere copie
        const cellaBottoneVediCopie = document.createElement("td");
        //creo bottone per mostrare le copie associate a ciascun venditore
        const bottoneCopieVenditore = document.createElement("button");
        //aggiungo testo al bottone
        bottoneCopieVenditore.textContent = "Visualizza copie consegnate";
        //associo ascoltatore e passo riga
        bottoneCopieVenditore.addEventListener("click", () => mostraCopieVenditore(venditori[i].codFiscale));
        //aggiungo cella alla riga
        cellaBottoneVediCopie.appendChild(bottoneCopieVenditore);
        //inserisco bottone nella cella
        riga.appendChild(cellaBottoneVediCopie);

        //inserisco riga nel corpo della tabella
        corpoVenditori.appendChild(riga);
    }
} 

async function caricaSommaPrezzoPerTuttiIVenditori(): Promise<number[]> {
    let sommaPrezziCopie: number[] = new Array;
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
            const indice = tabellaCopie.index("venditoreCF");

            const richiesta = indice.getAll(venditore.codFiscale); // Usa l’indice per filtrare

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



//funzione per mostrare le copie di un venditore
function mostraCopieVenditore(codFiscale: string): void{
    //prelevo dimensioni schermo
    const altezza = screen.height;
    const larghezza = screen.width;

    //apro nuova pagina e passo CV
    window.open(`gestoreCopieVenditore.html?codFiscale=${codFiscale}`, "_blank", `menubar=no", height=${altezza}, width=${larghezza}, top=0, left=0`);
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        await prelevaVenditori();
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});