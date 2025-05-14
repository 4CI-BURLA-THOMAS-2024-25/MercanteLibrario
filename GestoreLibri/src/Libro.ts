import { Copia } from "./Copia";

//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Libro{
    //creo attributi costanti
    readonly isbn: number;
    readonly materia: string;
    readonly autore: string;
    readonly titolo: string;
    readonly volume: string;
    readonly editore: string;
    readonly prezzoListino: number;
    readonly classe: string;

    //costruttore
    constructor(materia: string, isbn: string, autore: string, titolo: string, volume: string, editore: string, prezzoString: string, classe: string){
        //salvo prezzo separato da . anzichè da , e lo converto in numero
        let prezzo: number = Number(prezzoString.replace(",", "."));
        
        //controllo materia
        if(materia != undefined){
            this.materia = materia;
        }else{
            this.materia = "-";
        }

        //controllo isbn
        if(Number(isbn) > 0){
            this.isbn = Number(isbn);
        }else{
            this.isbn = 0;
        }

        //controllo autore
        if(autore != undefined){
            this.autore = autore;
        }else{
            this.autore = "-";
        }

        //controllo titolo
        if(titolo != undefined){
            this.titolo = titolo;
        }else{
            this.titolo = "-";
        }

        //controllo volume
        if((volume != undefined) && (volume.length == 1)){
            this.volume = volume;
        }else{
            this.volume = "-";
        }

        //controllo editore
        if(editore != undefined){
            this.editore = editore;
        }else{
            this.editore = "-";
        }

        //controllo prezzo 
        if(prezzo > 0.0){
            this.prezzoListino = prezzo;
        }else{
            this.prezzoListino = 0.0;
        }

        //controllo classe
        if(classe != undefined){
            this.classe = classe;
        }else{
            this.classe = "-";
        }
    }

    // toString per ottenere tutti i valori degli attributi accorpati in un'unica stringa
    toString(): string{
        //preparo array degli attributi
        let valoriAttributi: any[] = [this.materia, this.isbn, this.autore, this.titolo, this.volume, this.editore, this.prezzoListino, this.classe];
        
        //"converto" gli elementi dell'array in stringhe
        return valoriAttributi.join(" "); 
    }
}