import { Venditore } from "./Venditore";

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

        //aggiorno lista venditori
        aggiornaListaVenditori();

        //chiudo popup di inserimento
        chiudiRegistrazioneVenditore();
    }

    //errore, venditore già presente
    richiestaAggiuntaVenditore.onerror = () => {
        console.log("Libro già presente");
    }
}

function aggiornaListaVenditori(): void{

}

//prelevo elenco completo vendirori da DB
async function prelevaVenditori(): Promise<void>{
    //preparo transazione per leggere dal database
    const transazione = database.transaction("Venditori", "readonly");
    //prelevo reference tabella libri del database
    const tabellaVenditori = transazione.objectStore("Venditori");
    //array dei venditori
    const venditori: Venditore[] = await new Promise<any[]>((resolve, reject) => {
        //ottengo tutti venditori
        const richiesta = tabellaVenditori.getAll();
        //accetto richiesta e restituisco risultato
        richiesta.onsuccess = () => resolve(richiesta.result);
        //rifiuto richiesta e restituisco errore
        richiesta.onerror = () => reject(richiesta.error);
    });

    mostraVenditori(venditori);
}

//mostro in tabella elenco che mi viene passato
async function mostraVenditori(venditori: Venditore[]): Promise<void>{
    //prelevo reference del corpo della tabella dei venditori
    const corpoVenditori = document.getElementById("corpoTabellaVenditori") as HTMLTableSectionElement;
    //svuoto tabella
    corpoVenditori.innerHTML = "";

    //itero e creo riga per ogni venditore
    for(let i = 0; i < venditori.length; i++){
        //creo riga con le info del venditore
        const riga: HTMLTableRowElement = document.createElement("tr");
        riga.innerHTML = `<td>${venditori[i].codFiscale}</td><td>${venditori[i].nome}</td><td>${venditori[i].cognome}</td><td>${venditori[i].email}</td><td>${venditori[i].nTelefono}</td><td>${venditori[i].classe}</td><td>${venditori[i].soldiDaDare}</td>`;

        //creo bottone per mostrare le copie associate a ciascun venditore
        const bottone = document.createElement("button");
        //aggiungo testo al bottone
        bottone.textContent = "Visualizza copie consegnate";
        //associo ascoltatore e passo riga
        bottone.addEventListener("click", () => mostraCopieVenditore(venditori[i].codFiscale));

        //aggiungo cella alla riga
        const cella = riga.insertCell();
        //inserisco bottone nella cella
        cella.appendChild(bottone);

        //inserisco riga nel corpo della tabella
        corpoVenditori.appendChild(riga);
    }
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
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});