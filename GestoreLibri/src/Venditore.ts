//importo classe Libro
import { Copia } from "./Copia";

//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Venditore{
    //creo attributi costanti
    readonly codFiscale: string;
    readonly nome: string;
    readonly cognome: string;
    readonly email: string;
    readonly nTelefono: number;
    readonly classe: string;
    private soldiDaDare: number;
    private copieDate: Copia[];

    //costruttore
    constructor(codFiscale: string, nome: string, cognome: string, email: string, nTelefonoString: string, classe: string){
        //provo a convertire numero di telefono da stringa a numero effettivo
        let nTelefono = Number(nTelefonoString);

        //controllo codice fiscale
        if(codFiscale != undefined){
            this.codFiscale = codFiscale;
        }else{
            this.codFiscale = "-";
        }

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

        // controllo classe a cui appartiene lo studente
        if(classe != undefined){
            this.classe = classe;
        }else{
            this.classe = "-";
        }

        // soldi da dare alla persona in relazione al numero dei suoi libri che ho venduto
        this.soldiDaDare = 0;

        //elenco dei libri che la persona mi ha dato per la vendita
        this.copieDate = [];
    }

    addSoldiDaDare(soldi: number): void{
        if(soldi > 0){
            this.soldiDaDare += soldi;
        }
    }

    getSoldiDaDare(): number{
        return this.soldiDaDare;
    }

    addCopia(copia: Copia): void{
        if(copia != undefined){
            this.copieDate.push(copia);
        }
    }

    getCopie(): Copia[]{
        return this.copieDate;
    }
}