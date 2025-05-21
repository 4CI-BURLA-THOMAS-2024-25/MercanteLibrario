import { Copia } from "./Copia";
import { Venditore } from "./Venditore";

//importo daro per notificare aggiornamenti al DB
import { databaseChannel } from "./broadcast";

//database
let database: IDBDatabase;

//array dei venditori
let elencoVenditori: Venditore[] | null;

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

//associo listener alla casella di ricerca,se non è null ed è definita
const casellaRicerca = document.getElementById("casellaRicerca") as HTMLInputElement;
casellaRicerca?.addEventListener("input", ricercaVenditori);

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

        //database aggiornato o creato per la prima volta
        richiestaDB.onupgradeneeded = () => {
            const database = richiestaDB.result;

            //controllo che non esista già una tabella con questo nome
            if(!database.objectStoreNames.contains("Libri")){
                //creo nuova tabella e specifico chiave primaria
                const tabellaLibri = database.createObjectStore("Libri", {
                    keyPath: "isbn",
                });

                tabellaLibri.createIndex("materia", "materia", {unique: false});
                tabellaLibri.createIndex("autore", "autore", {unique: false});
                tabellaLibri.createIndex("titolo", "titolo", {unique: false});
                tabellaLibri.createIndex("volume", "volume", {unique: false});
                tabellaLibri.createIndex("editore", "editore", {unique: false});
                tabellaLibri.createIndex("prezzoListino", "prezzoListino", {unique: false});
                tabellaLibri.createIndex("classe", "classe", {unique: false});
            }

            //controllo che non esista già una tabella con questo nome
            if(!database.objectStoreNames.contains("Copie")){
                //creo nuova tabella e specifico chiave primaria che viene incrementata in automatico
                const tabellaCopie = database.createObjectStore("Copie", {
                    keyPath: "codiceUnivoco",
                });

                tabellaCopie.createIndex("libroDellaCopiaISBN", "libroDellaCopiaISBN", {unique: false});
                tabellaCopie.createIndex("prezzoScontato", "prezzoScontato", {unique: false});
                tabellaCopie.createIndex("venditoreID", "venditoreID", {unique: false});
            }

            //controllo che non esista già una tabella con questo nome
            if(!database.objectStoreNames.contains("Venditori")){
                //creo nuova tabella e specifico chiave primaria
                const tabellaVenditori = database.createObjectStore("Venditori", {
                    keyPath: "id",
                });

                tabellaVenditori.createIndex("nome", "nome", {unique: false});
                tabellaVenditori.createIndex("cognome", "cognome", {unique: false});
                tabellaVenditori.createIndex("email", "email", {unique: false});
                tabellaVenditori.createIndex("nTelefono", "nTelefono", {unique: true});
                tabellaVenditori.createIndex("classe", "classe", {unique: false});
            }

            //creo object store in cui salvare le copie eliminate, così da poterle reperire in caso di errore umano
            if(!database.objectStoreNames.contains("CopieEliminate")){
                //creo nuova tabella e specifico chiave primaria che viene incrementata in automatico
                const tabellaCopie = database.createObjectStore("CopieEliminate", {
                    keyPath: "codiceUnivoco",
                });

                tabellaCopie.createIndex("libroDellaCopiaISBN", "libroDellaCopiaISBN", {unique: false});
                tabellaCopie.createIndex("prezzoScontato", "prezzoScontato", {unique: false});
                tabellaCopie.createIndex("venditoreID", "venditoreID", {unique: false});
            }
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

async function registraVenditore(): Promise<void>{
    //array in cui salvo l'input dell'utente e che uso per creare nuovo oggetto venditore
    let datiVenditore: any[] = new Array(5);

    //leggo tutte le caselle
    for(let i = 0; i < caselleInput.length; i++){
        datiVenditore[i] = (caselleInput[i] as HTMLInputElement).value;
    }

    //leggo id dell'ultimo venditore
    const ultimoIDVenditore = await leggiUltimoIDVenditore();
    let venditoreID; 
    //verifico che vi siano venditori nello store
    if(ultimoIDVenditore !== null){
        venditoreID = ultimoIDVenditore + 1;
    //store vuoto
    }else{
        venditoreID = 1;
    }

    //creo oggetto venditore
    const venditore: Venditore = new Venditore(venditoreID, datiVenditore[0], datiVenditore[1], datiVenditore[2], Number(datiVenditore[3]), datiVenditore[4]);

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

        //svuoto campi di inserimento
        for(let i = 0; i < caselleInput.length; i++){
            (caselleInput[i] as HTMLInputElement).value = "";
        }

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

//prelevo ID dell'ultimo venditore, se il DB è popolato
async function leggiUltimoIDVenditore(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction("Venditori", "readonly");
        const store = transaction.objectStore("Venditori");

        // Apro un cursore ordinato in modo DECRESCENTE per chiavi
        const request = store.openCursor(null, "prev");

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

//prelevo elenco completo venditori da DB
async function prelevaVenditori(): Promise<Venditore[] | null>{
    let venditori: Venditore[];

    //gestisco eventuale errore di lettura da DB
    try{
        //preparo transazione per leggere dal database
        const transazione = database.transaction("Venditori", "readonly");
        //prelevo reference tabella libri del database
        const tabellaVenditori = transazione.objectStore("Venditori");
        //array dei venditori (puri, come oggetti plain, da convertire in Venditori effettivi per applicare toString)
        const rawVenditori = await new Promise<Venditore[]>((resolve, reject) => {
            //ottengo tutti venditori
            const richiesta = tabellaVenditori.getAll();
            //accetto richiesta e restituisco risultato
            richiesta.onsuccess = () => resolve(richiesta.result);
            //rifiuto richiesta e restituisco errore
            richiesta.onerror = () => reject(richiesta.error);
        });

        //ricostruisco le istanze reali di Venditore
        venditori = rawVenditori.map(oggettoGrezzo => new Venditore(
            oggettoGrezzo.id,
            oggettoGrezzo.nome,
            oggettoGrezzo.cognome,
            oggettoGrezzo.email,
            oggettoGrezzo.nTelefono,
            oggettoGrezzo.classe
        ));

        return venditori;
    }catch(errore){
        window.alert("Errore durante il caricamento dei venditori:" + errore);
        return null;
    }
}

//mostro in tabella elenco dei venditori
async function mostraVenditori(listaVenditori: Venditore[] | null): Promise<void>{
    //prelevo reference del corpo della tabella dei venditori
    const corpoVenditori = document.getElementById("corpoTabellaVenditori") as HTMLTableSectionElement;
    //svuoto tabella
    corpoVenditori.innerHTML = "";

    if(listaVenditori != null){
        //calcolo totale dei soldi da dare a ciascun venditore
        const totaleDaDare: number[] = await caricaSommaPrezzoPerTuttiIVenditori();
    
        //itero e creo riga per ogni venditore
        for(let i = 0; i < listaVenditori.length; i++){
            //creo riga con le info del venditore
            const riga: HTMLTableRowElement = document.createElement("tr");
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaCF = document.createElement("td");
            cellaCF.textContent = String(listaVenditori[i].id);
            riga.appendChild(cellaCF);
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaNome = document.createElement("td");
            cellaNome.textContent = listaVenditori[i].nome;
            riga.appendChild(cellaNome);
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaCognome = document.createElement("td");
            cellaCognome.textContent = listaVenditori[i].cognome;
            riga.appendChild(cellaCognome);
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaEmail = document.createElement("td");
            cellaEmail.textContent = listaVenditori[i].email;
            riga.appendChild(cellaEmail);
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaTelefono = document.createElement("td");
            cellaTelefono.textContent = String(listaVenditori[i].nTelefono);
            riga.appendChild(cellaTelefono);
    
            //creo cella codicefiscale e la aggiungo alla riga
            const cellaClasse = document.createElement("td");
            cellaClasse.textContent = listaVenditori[i].classe;
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
            bottoneCopieVenditore.addEventListener("click", () => mostraCopieVenditore(listaVenditori[i].id));
            //aggiungo cella alla riga
            cellaBottoneVediCopie.appendChild(bottoneCopieVenditore);
            //inserisco bottone nella cella
            riga.appendChild(cellaBottoneVediCopie);
    
            //inserisco riga nel corpo della tabella
            corpoVenditori.appendChild(riga);
        }
    }else{
        console.log("Nessun venditore da mostrare");
    }
}

//calcolo il prezzo MAX da dare al venditore, nel caso in cui vengano vendute tutte le sue copie
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

//funzione per mostrare le copie di un venditore
function mostraCopieVenditore(id: number): void{
    //prelevo dimensioni schermo
    const altezza = screen.height;
    const larghezza = screen.width;

    //apro nuova pagina e passo CV
    window.open(`html/gestoreCopieVenditore.html?venditoreID=${id}`, "_blank", `menubar=no", height=${altezza}, width=${larghezza}, top=0, left=0`);
}

//funzione che ricerca tra i venditori e mostra quelli che soddisafno il criterio di ricerca
async function ricercaVenditori(): Promise<void>{
    if(elencoVenditori != null){
        let criterioRicerca: string;
        //array di venditori con gli oggetti corrispondenti al criterio di ricerca
        let risultatiRicerca: Venditore[] = [];

        //leggo dalla casella di ricerca, se non è null ed è definita e la assegno se non è vuota
        if(casellaRicerca && (casellaRicerca.value.trim() !== "")){
            //ricerca case unsensitive, tutto minuscolo
            criterioRicerca = casellaRicerca.value.toLowerCase();
    
            //array che contiene i venditori corrispondenti al campo di ricerca
            for(let i = 0; i < elencoVenditori.length; i++){
                //se tra gli attributi del venditore compare il criterio di ricerca...
                if((elencoVenditori[i].toString().toLowerCase()).includes(criterioRicerca)){
                    //salvo il venditore nell'array che contiene i venditori corrispondenti alla ricerca
                    risultatiRicerca.push(elencoVenditori[i]);
                }
            }
            
            //passo nuova lista venditori e la visualizzo
            await mostraVenditori(risultatiRicerca);
        //con campo di ricerca vuoto, mostra lista completa
        }else{
            await mostraVenditori(elencoVenditori);
        }
    }
}

// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //prelevo array dei venditori
        elencoVenditori = await prelevaVenditori();

        await mostraVenditori(elencoVenditori);
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});