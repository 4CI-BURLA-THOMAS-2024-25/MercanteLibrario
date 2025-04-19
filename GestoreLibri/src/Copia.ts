import { Libro } from "./Libro";
import { Venditore } from "./Venditore";

export class Copia{
    //readonly libroDellaCopia: Libro;
    readonly codiceUnivoco: number;
    readonly scontoPrezzoListino: number;
    readonly venditore: string;

    constructor(codiceUnivoco: number, scontoPrezzoListino: number, venditore: string){
        //libro a cui è associata la copia
        //this.libroDellaCopia = libroDellaCopia;

        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;
        
        //sconto del prezzo della copia rispetto al prezzo di listino del libro(60-70-80%)
        this.scontoPrezzoListino = scontoPrezzoListino;

        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditore = venditore;
    }
}