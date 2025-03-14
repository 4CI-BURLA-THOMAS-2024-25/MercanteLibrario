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
        if (classe != null) {
            this.classe = classe;
        }
        else {
            this.classe = "-";
        }
        //imposto copie del libro a zero
        this.nCopie = 0;
    }
    // toString per ottenere tutti i valori degli attributi accorpati in un'unica stringa
    Libro.prototype.toString = function () {
        //preparo array degli attributi
        var valoriAttributi = [this.materia, this.isbn, this.autore, this.titolo, this.volume, this.editore, this.prezzo, this.classe];
        //"converto" gli elementi dell'array in stringhe
        return valoriAttributi.join(" ");
    };
    //ottieni numero copie del libro
    Libro.prototype.getNCopie = function () {
        return this.nCopie;
    };
    //metodo per aggiungere una nuova copia del libro
    Libro.prototype.aggiungiCopia = function () {
        this.nCopie++;
    };
    return Libro;
}());
exports.Libro = Libro;
