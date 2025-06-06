import { Copia } from "./Copia";
import { Libro } from "./Libro";
import { elencoLibri } from "./elencoLibri";  // Importa elencoLibri

// parametri da URL
const parametri = new URLSearchParams(window.location.search);
const idVenditore = parametri.get("venditoreID");

// database
let database: IDBDatabase;
let copie: Copia[] = [];
let importoTotale = 0;

// apertura database
function apriDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const richiesta = indexedDB.open("Database", 1);
    richiesta.onerror = () => reject(richiesta.error);
    richiesta.onsuccess = () => resolve(richiesta.result);
  });
}

// recupera nome venditore da DB
function prelevaNomeVenditore(): Promise<string> {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("Venditori", "readonly");
    const store = tx.objectStore("Venditori");
    const richiesta = store.get(Number(idVenditore));
    richiesta.onsuccess = () => {
      if (richiesta.result)
        resolve(richiesta.result.nome + " " + richiesta.result.cognome);
      else reject(new Error("Venditore non trovato"));
    };
    richiesta.onerror = () => reject(richiesta.error);
  });
}

// recupera copie del venditore
function prelevaCopie(): Promise<Copia[]> {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("Copie", "readonly");
    const store = tx.objectStore("Copie");
    const richiesta = store.getAll();
    
    richiesta.onsuccess = () => {
      const tutte = richiesta.result;
      console.log("Tutte le copie nel database:", tutte);  // Aggiungi log
      const filtrate = tutte.filter(c => c.venditoreID === Number(idVenditore));
      console.log("Copie filtrate per venditoreID:", filtrate);  // Aggiungi log
      resolve(filtrate);
    };
    
    richiesta.onerror = () => {
      console.error("Errore nel recupero delle copie:", richiesta.error);
      reject(richiesta.error);
    };
  });
}

// recupera libro da elencoLibri
function prelevaLibro(isbn: string): Promise<Libro> {
  return new Promise((resolve, reject) => {
    const libro = elencoLibri.find(l => l.isbn === Number(isbn));
    if (libro) {
      resolve(libro);
    } else {
      reject(new Error("Libro non trovato"));
    }
  });
}

// carica dati nella pagina
async function caricaPagina(
  campoNomeVenditore: HTMLElement,
  campoData: HTMLElement,
  corpoTabella: HTMLElement,
  campoTotale: HTMLElement
) {
  try {

    const nomeVenditore = await prelevaNomeVenditore();
    campoNomeVenditore.textContent = nomeVenditore;
    campoData.textContent = new Date().toLocaleString();
    copie = await prelevaCopie();

    corpoTabella.innerHTML = "";
    importoTotale = 0;

    for (const copia of copie) {
      const libro = await prelevaLibro(String(copia.libroDellaCopiaISBN));
      const riga = document.createElement("tr");

      const cellaTitolo = document.createElement("td");
      cellaTitolo.textContent = libro.titolo;

      const cellaPrezzo = document.createElement("td");
      cellaPrezzo.textContent = copia.prezzoScontato.toFixed(2) + " €";

      riga.appendChild(cellaTitolo);
      riga.appendChild(cellaPrezzo);
      corpoTabella.appendChild(riga);

      importoTotale += copia.prezzoScontato;
    }

    campoTotale.textContent = importoTotale.toFixed(2);
    
  } catch (e) {
    console.error("Errore nel caricamento:", e);
  }
}

// inizializzazione DOM
document.addEventListener("DOMContentLoaded", async () => {
  database = await apriDatabase();
  const campoNomeVenditore = document.getElementById("nomeVenditore");
  const campoData = document.getElementById("dataDeposito");
  const corpoTabella = document.getElementById("corpoTabellaCopie");
  const campoTotale = document.getElementById("importoTotale");
  const bottoneStampa = document.getElementById("stampa");

  if (
    campoNomeVenditore &&
    campoData &&
    corpoTabella &&
    campoTotale &&
    bottoneStampa
  ) {
    bottoneStampa.addEventListener("click", () => {
      console.log("Stampa avviata");
      window.print();
    });

    caricaPagina(
      campoNomeVenditore,
      campoData,
      corpoTabella,
      campoTotale
    );
  } else {
    console.error("Uno o più elementi DOM non trovati.");
  }
});
