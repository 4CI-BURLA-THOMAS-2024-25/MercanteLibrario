//importo classe Libro nel "main" 
import { Copia } from "./Copia";
// importo classe Copia nel "main"
import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

//importo dato per notificare aggiornamenti al DB
import { databaseChannel} from "./broadcast";

//prelevo parametri passati da URL
const parametri = new URLSearchParams(window.location.search);
//prelevo isbn
const isbn:string = parametri.get("isbn") as string;
//prelevo eventuale CV di venditore, nel caso in cui sia di ritorno dalla selezione del venditore
const codiceFiscaleVenditore = parametri.get("codiceFiscale");

//database
let database: IDBDatabase;

// libro di cui analizzo le copie
let libro: Libro;

//venditore associato alla copia in registrazione
let venditore: Venditore;

//associo funzione al bottone per registrare una nuova copia del libro
const bottoneAggiungiCopie = document.getElementById("aggiungiCopia") as HTMLButtonElement;
bottoneAggiungiCopie?.addEventListener("click", apriRegistrazioneCopia);

//prelevo reference del popup per aggiungere nuove copie
const popupAggiungiCopie = document.getElementById("popupRegistraCopia");

//reference del bottone che conferma la registrazione della copia con relativo comportamento associato
const bottoneRegistraCopia = document.getElementById("registraCopia");
bottoneRegistraCopia?.addEventListener("click", registraCopia);

//prelevo reference del bottone per chiudere il popup e vi associo funzione per chiuderlo
const bottoneChiudiPopup = document.getElementById("chiudiPopup") as HTMLButtonElement;
bottoneChiudiPopup?.addEventListener("click", chiudiRegistrazioneCopia);

// prelevo reference del bottone per aprire finestra con i venditori
const bottoneApriVenditori = document.getElementById("scegliVenditore") as HTMLButtonElement;
bottoneApriVenditori?.addEventListener("click", mostraVenditori);

//reference della casella di scelta per il prezzo del libro, scontato
const casellaPercentualeSconto = document.getElementById("selezionaSconto") as HTMLSelectElement;

//reference del campo di testo non modificabile che mostra il venditore selezionato per la registrazione della copia
const etichettaIDVenditore = document.getElementById("IDVenditore") as HTMLInputElement;

//funzione che ripristina il popup aperto (quando ritorno dalla pagina di selezione del venditore)
async function ripristinaPopup(): Promise<void>{
    //gestisco errore di venditore non reperibile
    try{
        if(codiceFiscaleVenditore != null){
            //recupero venditore da database dato il suo CF, con funzione anonima asincrona
            venditore = await prelevaVenditore(codiceFiscaleVenditore);
            
            //ripristino percentuale di sconto, selezionata prima
            casellaPercentualeSconto.value = parametri.get("percentualeSconto") as string;
    
            //imposto nome e cognome del venditore nella casella
            etichettaIDVenditore.value = venditore.nome + " " + venditore.cognome;
        
            //riapro popup di registrazione
            apriRegistrazioneCopia();
        }

    //venditore non reperibile
    }catch(errore){
        console.error("Venditore NON reperibile", errore);
    }
}

//recupero venditore dato CF
async function prelevaVenditore(codiceFiscale: string): Promise<Venditore>{
    //preparo transazione per leggere
    const transazione = database.transaction("Venditori", "readonly");
    //prelevo reference dell'object store
    const tabellaVenditori = transazione.objectStore("Venditori");

    const venditoreLetto = await new Promise<Venditore>((resolve, reject) => {
        //cerco per CF (chiave primaria)
        const richiesta = tabellaVenditori.get(codiceFiscale);

        //richiesta andata a buon fine
        richiesta.onsuccess = () => {
            //venditore trovato
            if (richiesta.result) {
                resolve(richiesta.result);

            //venditore NON trovato
            } else {
                reject(new Error("Venditore non trovato con codice fiscale: " + codiceFiscale));
            }
        }

        //errore nella richiesta
        richiesta.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiesta.error);
        };
    });

    //restituisco venditore
    return venditoreLetto;
}

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

//prelevo da DB tutte le copie del libro, in base al suio isbn
async function prelevaCopieLibroISBN():Promise<Copia[]>{
    return new Promise((resolve, reject) => {
        const transazione = database.transaction("Copie", "readonly");
        const tabellaCopie = transazione.objectStore("Copie");
        const indice = tabellaCopie.index("libroDellaCopiaISBN");

        console.log(isbn);

        const richiesta = indice.getAll(Number(isbn)); // cerca tutte le copie con quel isbn

        richiesta.onsuccess = () => {
            //array delle copie con l'isbn cercato
            resolve(richiesta.result);
        };

        richiesta.onerror = () => {
            reject(richiesta.error);
        };
    });
}


async function caricaCopieLibro(): Promise<void>{
    //prelevo copie che hanno libro con ISBN coerente con il libro con cui si sta operando
    const copieLibro: Copia[] = await prelevaCopieLibroISBN();

    if (!isbn) throw new Error("ISBN non valido");

    //preparo transazione per leggere dal database
    const transazioneLibri = database.transaction("Libri", "readonly");
    //prelevo reference tabella libri del database
    const tabellaLibri = transazioneLibri.objectStore("Libri");
    
    //assegno libro o errore di recupero
    libro = await new Promise<Libro>((resolve, reject) => {
        // cerco per isbn
        const richiestaLibri = tabellaLibri.get(Number(isbn));

        richiestaLibri.onsuccess = () => {
            if (richiestaLibri.result) {
                resolve(richiestaLibri.result);
            } else {
                reject(new Error("Libro non trovato con ISBN: " + isbn));
            }
        };

        richiestaLibri.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiestaLibri.error);
        };
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
    }
}

// funzione per registrare una nuova copia di un determinato libro, passando eventuale venditore
function apriRegistrazioneCopia(): void{
    if(popupAggiungiCopie != null){
        //quando clicco il bottone per registrare una nuova copia, apro il form
        popupAggiungiCopie.style.display = "flex";
    }
}

//funzione per registrare una copia del libro in questione
async function registraCopia():Promise<void>{
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
    if(!(casellaPercentualeSconto.value === "default")){
        //creo oggetto copia
        const copia: Copia = new Copia(libro, codiceCopiaAttuale, parseFloat(casellaPercentualeSconto.value), venditore);

        //apro transazione
        const transazione = database.transaction("Copie", "readwrite");
        const tabellaCopie = transazione.objectStore("Copie");

        const richiestaAggiungiCopia = tabellaCopie.add(copia);

        //richiesta andata a buon fine
        richiestaAggiungiCopia.onsuccess = () => {
            //aggiorno lista copie, rileggendo da DB
            caricaCopieLibro();

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

}

//genero numero della copia
async function leggiUltimaChiaveCopia(): Promise<number | null> {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction("Copie", "readonly");
        const store = transaction.objectStore("Copie");

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

function chiudiRegistrazioneCopia(): void{
    if(popupAggiungiCopie != null){
        // quando clicco il bottone per chiudere il popupAggiungiCopie, lo imposto come nascosto
        popupAggiungiCopie.style.display = "none";
    }
}

// funzione che mostra la pagina per scegliere un venditore/aggiungerne uno nuovo
function mostraVenditori(): void{

    //preparo passaggio di partametri tramite URL, per non perderli quando apro pagina venditori con la scelta
    const parametriTrasmessi = new URLSearchParams();
    //passo isbn
    parametriTrasmessi.set("isbn", isbn);
    //leggo valore della casella dello sconto
    const percentualeSconto = casellaPercentualeSconto.value;
    //passo percentuale sconto
    parametriTrasmessi.set("percentualeSconto", percentualeSconto);

    //cambio pagina aprendo i venditori e passando il parametro isbn (così al ritorno nella pagina attuale NON verrà perso)
    window.location.href = `selezionaVenditore.html?${parametriTrasmessi.toString()}`;
}

//funzione che preleva un libro dato il suo isbn
async function prelevaLibroISBN(isbnPassato: number): Promise<Libro>{
    //apro transazione
    const transazione = database.transaction("Libri", "readonly");
    const tabellaLibri = transazione.objectStore("Libri");

    //assegno libro o errore di recupero
    const libroPrelevato = await new Promise<Libro>((resolve, reject) => {
        // cerco per isbn
        const richiestaLibri = tabellaLibri.get(isbnPassato);

        richiestaLibri.onsuccess = () => {
            if (richiestaLibri.result) {
                resolve(richiestaLibri.result);
            } else {
                reject(new Error("Libro non trovato con ISBN: " + isbn));
            }
        };

        richiestaLibri.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiestaLibri.error);
        };
    });  
    
    return libroPrelevato;
}

//funzione che preleva un venditore dato il suo CF
async function prelevaVenditoreCF(codiceFiscalePassato: string): Promise<Libro>{
    //apro transazione
    const transazione = database.transaction("Venditori", "readonly");
    const tabellaVenditori = transazione.objectStore("Venditori");

    //assegno libro o errore di recupero
    const libroPrelevato = await new Promise<Libro>((resolve, reject) => {
        // cerco per isbn
        const richiestaVenditori = tabellaVenditori.get(codiceFiscalePassato);

        richiestaLibri.onsuccess = () => {
            if (richiestaLibri.result) {
                resolve(richiestaLibri.result);
            } else {
                reject(new Error("Venditore non trovato con codice fiscale: " + codiceFiscalePassato));
            }
        };

        richiestaLibri.onerror = (event) => {
            console.error("Errore nella richiesta:", event);
            reject(richiestaLibri.error);
        };
    });  
    
    return libroPrelevato;
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

        // parte comunicazione
        const ws = new WebSocket('ws://localHost:8081');

        ws.onopen = function () {
            console.log("aperto il server");
        }

        ws.onclose = function () {
            console.log("connessione server chiusa");
        }

        ws.onerror = function (error) {
            console.log("errore nel webSocket", error);
        }

        //comunico la copia da rimuovere
        function inviaDatiRimozione(codiceUnivoco: number) {
            ws.send("1," + String(codiceUnivoco));
        }

        //comunico la copia da aggiungere
        function inviadati(copia: Copia) {
            ws.send("0," + String(copia.toString()));
        }

        //ricevo messaggio
        ws.onmessage = function (event) {
            console.log(event.data);

            //prelevo dati dell'evento
            let data = event.data;
            //dividio azione e contenuto
            let smista = data.split(',');
            //aggiungi copia
            if (smista[0] == 0) {
                riceviMessaggio(event);

            //rimuovi
            } else {
                //riceviDatiRimozione(event);
            }
        }

        // function riceviDatiRimozione(event) {
        //     let data = event.data;
        //     data = data.replace(/(nome|isCopia|prezzo|codiceVolume|numero|[{}:" ])/g, '');
        //     let vet5 = data.split(',');
        //     let c = new copiaLibro(vet5[1], vet5[3], vet5[4], true, vet5[2]);
        //     rimuoviCopiaLibro(c.nome, c.prezzo, c.numero);
        // }

        //gestisco aggiunta copia
        async function riceviMessaggio(event: any) {
            try{
                //ricostruisco oggeto copia che mi hanno trasmesso
                const parametriCopia: string[] = (event.data).split(",");
    
                //prelevo oggetto libro associato alla copia in base a isbn
                const libroPrelevato: Libro = await prelevaLibroISBN(Number(parametriCopia[0]));
                //
                const copiaRicevuta: Copia = new Copia(libroPrelevato, Number(parametriCopia[1]), Number(parametriCopia[2]), parametriCopia[3]);

            }catch(error){
                console.error("Errore nel recupero del libro mediante ISBN trasmesso da socket");
            }
        }

        // let data = event.data;
        // data = data.replace(/(nome|isCopia|prezzo|codiceVolume|numero|[{}:" ])/g, '');
        // let vet = data.split(',');
        // let c = new copiaLibro(vet[1], vet[3], vet[4], true, vet[2]);
        // copialibri.push(c);
        // c.aggiungiCopiaLibro();
        // for (let i = 0; i < libri.length; i++) {
        //     let li = libri[i];
        //     let cod1 = libri[i].codiceVolume;
        //     if (cod1 == c.codiceVolume) {
        //     li.visualizzaCopie();
        //     }
        // }
        // }

    } catch (erroreDB) {
        console.error(erroreDB);
    }
});