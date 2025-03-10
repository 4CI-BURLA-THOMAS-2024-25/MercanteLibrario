"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Libro = void 0;
//creo classe esportabile, così da essere importata e usata dalla classe "main"
var Libro = /** @class */ (function () {
    //costruttore
    function Libro(materia, isbn, autore, titolo, volume, editore, prezzoString, classe) {
        //salvo prezzo separato da . anzichè da , e lo converto in numero
        var prezzo = Number(prezzoString.replace(",", "."));
        //controllo materia
        if (materia != null) {
            this.materia = materia;
        }
        else {
            this.materia = "-";
        }
        //controllo isbn
        if (Number(isbn) > 0) {
            this.isbn = Number(isbn);
        }
        else {
            this.isbn = 0;
        }
        //controllo autore
        if (autore != null) {
            this.autore = autore;
        }
        else {
            this.autore = "-";
        }
        //controllo titolo
        if (titolo != null) {
            this.titolo = titolo;
        }
        else {
            this.titolo = "-";
        }
        //controllo volume
        if ((volume != null) && (volume.length == 1)) {
            this.volume = volume;
        }
        else {
            this.volume = "-";
        }
        //controllo editore
        if (editore != null) {
            this.editore = editore;
        }
        else {
            this.editore = "-";
        }
        //controllo prezzo 
        if (prezzo > 0.0) {
            this.prezzo = prezzo;
        }
        else {
            this.prezzo = 0.0;
        }
        //controllo classe
        if ((Number(classe) >= 1) && (Number(classe) <= 5)) {
            this.classe = Number(classe);
        }
        else {
            this.classe = 0;
        }
    }
    return Libro;
}());
exports.Libro = Libro;
