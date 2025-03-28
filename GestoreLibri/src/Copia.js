"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Copia = void 0;
var Copia = /** @class */ (function () {
    function Copia(libroDellaCopia, scontoPrezzoListino, codiceUnivoco, venditore) {
        //libro a cui è associata la copia
        this.libroDellaCopia = libroDellaCopia;
        //sconto del prezzo della copia rispetto al prezzo di listino del libro(60-70-80%)
        this.scontoPrezzoListino = scontoPrezzoListino;
        // codice univoco per identificare la copia senza abiguità tra le altre
        this.codiceUnivoco = codiceUnivoco;
        // per ogni copia mi serve sapere chi me l'ha portata per la vendita
        this.venditore = venditore;
    }
    return Copia;
}());
exports.Copia = Copia;
