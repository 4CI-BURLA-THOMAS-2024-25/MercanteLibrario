"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venditore = void 0;
//creo classe esportabile, così da essere importata e usata dalla classe "main"
var Venditore = /** @class */ (function () {
    //costruttore
    function Venditore(nome, cognome, email, nTelefonoString, classe) {
        //provo a convertire numero di telefono da stringa a numero effettivo
        var nTelefono = Number(nTelefonoString);
        // controllo nome
        if (nome != undefined) {
            this.nome = nome;
        }
        else {
            this.nome = "-";
        }
        // controllo cognome
        if (cognome != undefined) {
            this.cognome = cognome;
        }
        else {
            this.cognome = "-";
        }
        // controllo email
        if (email != undefined) {
            this.email = email;
        }
        else {
            this.email = "-";
        }
        // controllo numero di telefono, verificando che sia convertibile
        if (nTelefono > 0) {
            this.nTelefono = nTelefono;
        }
        else {
            this.nTelefono = 0;
        }
        // controllo classe a cui appartiene lo studente
        if (classe != undefined) {
            this.classe = classe;
        }
        else {
            this.classe = "-";
        }
        // soldi da dare alla persona in relazione al numero dei suoi libri che ho venduto
        this.soldiDaDare = 0;
        //elenco dei libri che la persona mi ha dato per la vendita
        this.copieDate = [];
    }
    return Venditore;
}());
exports.Venditore = Venditore;
