//creo classe esportabile, così da essere importata e usata dalla classe "main"
export class Venditore{
    //creo attributi costanti
    readonly id: number;
    readonly nome: string;
    readonly cognome: string;
    readonly email: string;
    readonly nTelefono: number;
    readonly classe: string;

    //costruttore
    constructor(id: number, nome: string, cognome: string, email: string, nTelefonoString: string, classe: string){
        //provo a convertire numero di telefono da stringa a numero effettivo
        let nTelefono = Number(nTelefonoString);

        //controllo id
        if(id >= 0){
            this.id = id;
        }else{
            this.id = 0;
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
    }
}