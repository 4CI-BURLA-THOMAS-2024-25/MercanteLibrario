import { Copia } from "../Copia";

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
            if(!database.objectStoreNames.contains("Copie")){
                //creo nuova tabella e specifico chiave primaria che viene incrementata in automatico
                const tabellaCopie = database.createObjectStore("Copie", {
                    keyPath: "codiceUnivoco",
                });

                tabellaCopie.createIndex("prezzoScontato", "prezzoScontato", {unique: false});
                tabellaCopie.createIndex("venditore", "venditore", {unique: false});
            }
        }
    });

    return out;
}

// salvo Copia, se non esiste già il codice univoco
function salvaCopia(database: IDBDatabase, copia: Copia): Promise<boolean>{
    let out: Promise<boolean> = new Promise((resolve, reject) => {
        // creo transazione sullo store/tabella copie per leggere e scrivere
        const transazione = database.transaction("Copie", "readwrite");
        // recupero reference della tabella/object store, fornito dalla transazione aperta
        const tabellaCopie = transazione.objectStore("Copie");

        // provo ad aggiungere copia, se la sua chiave primaria non è già presente
        const richiestaAggiunta = tabellaCopie.add(copia);

        //richiesta e aggiunta andate a buon fine
        richiestaAggiunta.onsuccess = () => {
            resolve(true);
        }

        // richiesta e aggiunta fallite
        richiestaAggiunta.onerror = () => {
            // nome del codice di errore generato in caso di chiave primaria già presente
            if((richiestaAggiunta.error as DOMException).name === "ConstraintError"){
                resolve(false);
            
            // errore imprevisto, di altro tipo
            }else{
                reject(richiestaAggiunta.error);
            }
        }
    });

    return out;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const database = await apriDatabase();
        console.log("Database aperto:", database.name);

        let copia: Copia;
        for(let i = 0; i < 10; i++){
            copia = new Copia(i, i + 20, i + "ciao");

            salvaCopia(database, copia).then((inserita) => {
                //copia salvata
                if(inserita){
                    console.log("Nuova copia aggiunta!");
                }else{
                    console.log("Copia già esistente, non aggiunta");
                }
            }).catch((erroreAggiunta) => {
                console.error("Errore durante il salvataggio:", erroreAggiunta);
            });
        }
        
    } catch (erroreDB) {
        console.error("Errore apertura DB:", erroreDB);
    }
});