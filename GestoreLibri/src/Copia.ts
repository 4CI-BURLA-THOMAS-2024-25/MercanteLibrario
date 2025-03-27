import { Libro } from "./Libro";

export class Copia{
    readonly libroDellaCopia: Libro;
    readonly scontoPrezzoListino: number;

    constructor(libroDellaCopia: Libro,scontoPrezzoListino: number){
        this.libroDellaCopia = libroDellaCopia;

        this.scontoPrezzoListino = scontoPrezzoListino;
    }
}