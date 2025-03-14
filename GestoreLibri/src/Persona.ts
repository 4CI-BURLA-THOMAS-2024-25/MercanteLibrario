//importo classe Libro
import { Libro } from "./Libro";

//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Persona{
    //creo attributi costanti
    readonly nome: string;
    readonly cognome: string;
    readonly email: string;
    readonly nTelefono: string;
    readonly matricolaStudente: string;
    readonly classe: string;
    private soldiDaDare: number;
    private libriDati: Libro[];

    //costruttore
    constructor(nome: string, cognome: string, email: string, nTelefono: string, matricolaStudente: string, classe: string){
        // controllo nome
        if(nome != undefined){
            this.nome = nome;
        }else{
            this.nome = "-";
        }

        // controllo cognome
        if(cognome != undefined){
            this.cognome = cognome;
        }else{
            this.cognome = "-";
        }

        // controllo email
        
    }
}