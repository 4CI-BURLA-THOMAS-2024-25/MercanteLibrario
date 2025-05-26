import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

export class Copia{
    readonly libroDellaCopiaISBN: number; //prendo isbn
    readonly codiceUnivoco: number;
    readonly prezzoCopertina: number;
    readonly prezzoScontato: number;
    readonly venditoreID: number; //prendo CF del venditore
    public stato: string; //tengo traccia di copia disponibile(D), venduta(V) o cancellata(C)

    constructor(libroDellaCopia: Libro, codiceUnivoco: number, prezzoCopertina: number, venditore: Venditore){
        //libro a cui è associata la copia
        this.libroDellaCopiaISBN = libroDellaCopia.isbn;

        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;
        
        //prezzo di copertina della copia
        this.prezzoCopertina = prezzoCopertina;

        //prezzo della copia già scontato al 50%, max 2 cifre decimali
        this.prezzoScontato = parseFloat((prezzoCopertina * 0.5).toFixed(2));

        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditoreID = venditore.id;

        //di default, la copia è disponibile
        this.stato = "D";
    }

    toString(): string {
        return `${this.libroDellaCopiaISBN};${this.codiceUnivoco};${this.prezzoCopertina};${this.prezzoScontato};${this.venditoreID};${this.stato}`;
    }
}