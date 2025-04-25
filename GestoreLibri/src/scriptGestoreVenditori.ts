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
    
}
