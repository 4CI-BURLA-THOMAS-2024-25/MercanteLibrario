import { Libro } from "./Libro";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelvo ID del venditore di cui si sta registrando la copia e alla quale si vuole associare un libro
const venditoreID:string = parametri.get("venditoreID") as string;
//prelevo prezzo di copertina, per poi ripassarlo indietro
const prezzoCopertina:string = parametri.get("prezzoCopertina") as string;

//associo listener alla casella di ricerca,se non è null ed è definita
const casellaRicerca = document.getElementById("casellaRicerca") as HTMLInputElement;
casellaRicerca?.addEventListener("input", ricercaLibri);

//database
let database: IDBDatabase;

//elenco libri
let elencoLibri: Libro[] | null;

//bottone per confermare la selezione
const bottoneTornaAlleCopie = document.getElementById("tornaAlleCopie");
bottoneTornaAlleCopie?.addEventListener("click", () => tornaAlleCopie());

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

//prelevo elenco completo libri da DB
async function prelevaLibri(): Promise<Libro[] | null>{
    //gestisco eventuale errore di lettura da DB
    try{
        let libri: Libro[];
        //preparo transazione per leggere dal database
        const transazione = database.transaction("Libri", "readonly");
        //prelevo reference tabella libri del database
        const tabellaLibri = transazione.objectStore("Libri");
        //array dei libri, come oggetti grezzi
        const rawLibri: Libro[] = await new Promise<any[]>((resolve, reject) => {
            //ottengo tutti libri
            const richiesta = tabellaLibri.getAll();
            //accetto richiesta e restituisco risultato
            richiesta.onsuccess = () => resolve(richiesta.result);
            //rifiuto richiesta e restituisco errore
            richiesta.onerror = () => reject(richiesta.error);
        });

        //ricostruisco le istanze reali di Libro
        libri = rawLibri.map(oggettoGrezzo => new Libro(
            oggettoGrezzo.materia,
            String(oggettoGrezzo.isbn),
            oggettoGrezzo.autore,
            oggettoGrezzo.titolo, 
            oggettoGrezzo.volume,
            oggettoGrezzo.editore,
            oggettoGrezzo.classe
        ));
    
        return libri;
    }catch(errore){
        window.alert("Errore durante il caricamento dei venditori:" + errore);
        return null;
    }
}

//mostro in tabella elenco che mi viene passato
async function mostraLibri(libri: Libro[] | null): Promise<void>{
    if(libri != null){
        //calcolo totale dei soldi da dare a ciascun venditore
        const numeroCopiePerLibro: number[] | null = await caricaNumeroCopieDeiLibri();
    
        if(numeroCopiePerLibro != null){
            //prelevo reference del corpo della tabella dei venditori
            const corpoLibri = document.getElementById("corpoTabellaLibri") as HTMLTableSectionElement;
            //svuoto tabella
            corpoLibri.innerHTML = "";
        
            //itero e creo riga per ogni libro
            for(let i = 0; i < libri.length; i++){
                //creo riga con le info del libro
                const riga: HTMLTableRowElement = document.createElement("tr");
        
                //creo cella per checkbox
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
        
                //creo cella materia e la aggiungo alla riga
                const cellaMateria = document.createElement("td");
                cellaMateria.textContent = libri[i].materia;
                riga.appendChild(cellaMateria);
        
                //creo cella isbn e la aggiungo alla riga
                const cellaISBN = document.createElement("td");
                cellaISBN.textContent = String(libri[i].isbn);
                riga.appendChild(cellaISBN);
                
                //creo cella autore e la aggiungo alla riga
                const cellaAutore = document.createElement("td");
                cellaAutore.textContent = libri[i].autore;
                riga.appendChild(cellaAutore);
                
                //creo cella titolo e la aggiungo alla riga
                const cellaTitolo = document.createElement("td");
                cellaTitolo.textContent = libri[i].titolo;
                riga.appendChild(cellaTitolo);
        
                //creo cella volume e la aggiungo alla riga
                const cellaVolume = document.createElement("td");
                cellaVolume.textContent = libri[i].volume;
                riga.appendChild(cellaVolume);
        
                //creo cella editore e la aggiungo alla riga
                const cellaEditore = document.createElement("td");
                cellaEditore.textContent = libri[i].editore;
                riga.appendChild(cellaEditore);
                
                //creo cella classe e la aggiungo alla riga
                const cellaClasse = document.createElement("td");
                cellaClasse.textContent = libri[i].classe;
                riga.appendChild(cellaClasse);
        
                //reperisco numero di copie del libro
                const cellaNumeroCopie = document.createElement("td");
                cellaNumeroCopie.textContent = String(numeroCopiePerLibro[i]);
                riga.appendChild(cellaNumeroCopie);

                //inserisco riga nel corpo della tabella
                corpoLibri.appendChild(riga);
            }
        }

    }else{
        console.log("Nessun libro da mostrare");
    }
} 

//funzione che restituisce il numero di copie dei libri
async function caricaNumeroCopieDeiLibri(): Promise<number[] | null>{
    if(elencoLibri != null){
        let  numeroCopieDeiLibri: number[] = [];

        //per ogni libro dell'elenco...
        for(const libro of elencoLibri){
            //...prelevo il numero delle copie in base a quelle che hanno ISBN del libro
            const numeroCopieLibro: number = await new Promise((resolve, reject) => {
                const transazione = database.transaction("Copie", "readonly");
                const tabellaCopie = transazione.objectStore("Copie");
                //prelevo indice per la ricerca
                const indice = tabellaCopie.index("libroDellaCopiaISBN");
        
                //filtro copie per isbn del libro
                const richiestaConta = indice.count(libro.isbn);

                richiestaConta.onsuccess = () => resolve(richiestaConta.result);
                richiestaConta.onerror = () =>reject(richiestaConta.onerror);
            });

            numeroCopieDeiLibri.push(numeroCopieLibro);
        }

        return numeroCopieDeiLibri;

    }
    return null;
}

//funzione per tornare alle copie, dopo aver selezionato un libro salvando isbn in URL
function tornaAlleCopie():void {
    //prelevo prima spunta (e unica) e cerco la riga alla quale apprtiene
    const rigaSelezionata = document.querySelector("input[type='checkbox']:checked")?.closest("tr");

    //verifico se è stata selezionata una spunta
    if (rigaSelezionata) {
        //ottieni isbn dalla cella corrispondente (nella terzza colonna della riga)
        const isbn: string = rigaSelezionata.querySelector("td:nth-child(3)")?.textContent as string;

        //preparo parametri da passare alla pagina precedente
        const parametriRitorno = new URLSearchParams();
        //venditoreID, da mantenere, passato all'apertura della suddetta pagina
        parametriRitorno.set("venditoreID", venditoreID);
        //percentuale sconto, da mantenere
        parametriRitorno.set("prezzoCopertina", prezzoCopertina);
        //passo isbn del libro selezionato
        parametriRitorno.set("isbn", isbn);

        //cambio pagina, torno indietro
        window.location.href = `gestoreCopieVenditore.html?${parametriRitorno.toString()}`;

    //nessun venditore selezionato
    } else {
        alert("Seleziona una riga prima di tornare indietro.");
    }
}

//funzione che ricerca tra i libri e mostra quelli che soddisafno il criterio di ricerca
function ricercaLibri(): void{
    if(elencoLibri != null){
        let criterioRicerca: string;
        //libro con gli oggetti corrispondenti al criterio di ricerca
        let risultatiRicerca: Libro[] = [];
    
        //leggo dalla casella di ricerca, se non è null ed è definita e la assegno se non è vuota
        if(casellaRicerca && (casellaRicerca.value.trim() !== "")){
            //ricerca case unsensitive, tutto minuscolo
            criterioRicerca = casellaRicerca.value.toLowerCase();
    
            //array che contiene i libri corrispondenti al campo di ricerca
            for(let i = 0; i < elencoLibri.length; i++){
    
                //se tra gli attributi del libro compare il criterio di ricerca...
                if((elencoLibri[i].toString().toLowerCase()).includes(criterioRicerca)){
                    //salvo il libro nell'array che contiene i libri corrispondenti alla ricerca
                    risultatiRicerca.push(elencoLibri[i]);
                }
            }
            
            //passo nuova lista libri e la visualizzo
            mostraLibri(risultatiRicerca);
        
        //con campo di ricerca vuoto, mostra lista completa
        }else{
            mostraLibri(elencoLibri);
        }
    }
}


// al caricamento della pagina, apro database
document.addEventListener("DOMContentLoaded", async () => {
    try {
        database = await apriDatabase();
        console.log("Database aperto:", database.name);

        //prelevo elenco completo dei libri 
        elencoLibri = await prelevaLibri();
        
        //mostro tutti i libri in tabella
        await mostraLibri(elencoLibri);

        //prelevo tutte le caselle di selezione
        const checkboxes = document.querySelectorAll<HTMLInputElement>(".caselleSelezione");
        //ad ognuna assegno ascoltatore che reagisce al cambiamento (spunta/despunta)
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                //se una viene selezionata...
                if (checkbox.checked) {
                    //tutte le altre diverse da lei vengono deselezionate
                    checkboxes.forEach((checkboxesDeselezionate) => {
                        if (checkboxesDeselezionate !== checkbox) {
                            checkboxesDeselezionate.checked = false;
                        }
                    });
                }
            });
        });
        
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});