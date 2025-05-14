import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

export class Copia{
    readonly libroDellaCopiaISBN: number; //prendo isbn
    readonly codiceUnivoco: number;
    readonly prezzoScontato: number;
    readonly venditore: Venditore;

    constructor(libroDellaCopia: Libro, codiceUnivoco: number, scontoPrezzoListino: number, venditore: Venditore){
        //libro a cui è associata la copia
        this.libroDellaCopiaISBN = libroDellaCopia.isbn;

        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;
        
        //prezzo della copia già scontato
        this.prezzoScontato = libroDellaCopia.prezzoListino * scontoPrezzoListino;

        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditore = venditore;
    }
}