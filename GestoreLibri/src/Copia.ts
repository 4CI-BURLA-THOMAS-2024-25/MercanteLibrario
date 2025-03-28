import { Libro } from "./Libro";
import { Persona } from "./Persona";

export class Copia{
    readonly libroDellaCopia: Libro;
    readonly scontoPrezzoListino: number;
    readonly codiceUnivoco: number;
    readonly venditore: Persona;

    constructor(libroDellaCopia: Libro,scontoPrezzoListino: number, codiceUnivoco: number, venditore: Persona){
        //libro a cui è associata la copia
        this.libroDellaCopia = libroDellaCopia;

        //sconto del prezzo della copia rispetto al prezzo di listino del libro(60-70-80%)
        this.scontoPrezzoListino = scontoPrezzoListino;

        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;

        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditore = venditore;
    }
}