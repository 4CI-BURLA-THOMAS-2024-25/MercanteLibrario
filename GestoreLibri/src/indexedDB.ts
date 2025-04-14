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
                    autoIncrement: true,
                });

                tabellaCopie.createIndex("venditore", "venditore", {unique: false});
                tabellaCopie.createIndex("prezzoScontato", "prezzoScontato", {unique: true});
            }
        }
    });

    return out;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
      const db = await apriDatabase();
      console.log("Database aperto:", db.name);
    } catch (err) {
      console.error("Errore apertura DB:", err);
    }
  });
  