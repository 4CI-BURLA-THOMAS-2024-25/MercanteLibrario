import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

export class Copia{
    readonly libroDellaCopiaISBN: number; //prendo isbn
    readonly codiceUnivoco: number;
    readonly prezzoScontato: number;
    readonly venditoreCF: string; //prendo CF del venditore

    constructor(libroDellaCopia: Libro, codiceUnivoco: number, scontoPrezzoListino: number, venditore: Venditore){
        //libro a cui è associata la copia
        this.libroDellaCopiaISBN = libroDellaCopia.isbn;

        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;
        
        //prezzo della copia già scontato, max 2 cifre decimali
        this.prezzoScontato = parseFloat((libroDellaCopia.prezzoListino * scontoPrezzoListino).toFixed(2));

        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditoreCF = venditore.codFiscale;
    }
}