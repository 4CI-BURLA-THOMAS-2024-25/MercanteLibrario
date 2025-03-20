//importo classe Libro
import { Libro } from "./Libro";

//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Persona{
    //creo attributi costanti
    readonly nome: string;
    readonly cognome: string;
    readonly email: string;
    readonly nTelefono: number;
    readonly matricolaStudente: string;
    readonly classe: string;
    private soldiDaDare: number;
    private libriDati: Libro[];

    //costruttore
    constructor(nome: string, cognome: string, email: string, nTelefonoString: string, matricolaStudente: string, classe: string){
        //provo a convertire numero di telefono da stringa a numero effettivo
        let nTelefono = Number(nTelefonoString);

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
        if(email != undefined){
            this.email = email;
        }else{
            this.email = "-";
        }

        // controllo numero di telefono, verificando che sia convertibile
        if(nTelefono > 0){
            this.nTelefono = nTelefono;
        }else{
            this.nTelefono = 0;
        }

        // controllo matricola dello studente
        if(matricolaStudente != undefined){
            this.matricolaStudente = matricolaStudente;
        }else{
            this.matricolaStudente = "-";
        }
    }
}