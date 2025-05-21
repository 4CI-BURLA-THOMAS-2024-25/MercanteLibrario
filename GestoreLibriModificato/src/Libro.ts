//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Libro{
    //creo attributi costanti
    readonly isbn: number;
    readonly materia: string;
    readonly autore: string;
    readonly titolo: string;
    readonly volume: string;
    readonly editore: string;
    readonly classe: string;

    //costruttore
    constructor(materia: string, isbn: string, autore: string, titolo: string, volume: string, editore: string, classe: string){
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
        const valoriAttributi: any[] = [this.materia, this.isbn, this.autore, this.titolo, this.volume, this.editore, this.classe];
        
        //"converto" gli elementi dell'array in stringhe
        return valoriAttributi.join(" "); 
    }
}