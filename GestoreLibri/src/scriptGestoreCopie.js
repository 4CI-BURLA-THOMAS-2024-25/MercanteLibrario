"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// libro di cui analizzo le copie
var libro;
//associo funzione al bottone per registrare una nuova copia del libro
var bottoneAggiungiCopie = document.getElementById("aggiungiCopia");
bottoneAggiungiCopie === null || bottoneAggiungiCopie === void 0 ? void 0 : bottoneAggiungiCopie.addEventListener("click", apriRegistrazioneCopia);
//prelevo reference del popup per aggiungere nuove copie
var popupAggiungiCopie = document.getElementById("popupRegistraCopia");
//prelevo reference del bottone per chiudere il popup e vi associo funzione per chiuderlo
var bottoneChiudiPopup = document.getElementById("chiudiPopup");
bottoneChiudiPopup === null || bottoneChiudiPopup === void 0 ? void 0 : bottoneChiudiPopup.addEventListener("click", chiudiRegistrazioneCopia);
// prelevo reference del bottone per aprire finestra con i venditori
var bottoneApriVenditori = document.getElementById("scegliVenditore");
bottoneApriVenditori === null || bottoneApriVenditori === void 0 ? void 0 : bottoneApriVenditori.addEventListener("click", mostraVenditori);
function isLibro(obj) {
    return obj && typeof obj.materia === 'string' && typeof obj.isbn === 'number' && typeof obj.autore === 'string' && typeof obj.titolo === 'string' && typeof obj.volume === 'string' && typeof obj.editore === 'string' && typeof obj.prezzoListino === 'number' && typeof obj.classe === 'string';
}
function caricaCopieLibro(evento) {
    libro = evento.data;
    console.log(libro);
    // controllo se l'evento contiene dati ed è di tipo libro
    if (isLibro(libro)) {
        //prelevo reference del corpo della tabella (ad una riga) che utilizzo per mostrare le info del libro di cui sto gestendo le copie
        var corpoInfoLibro = document.getElementById("corpoInfoLibro");
        //svuoto tabella
        corpoInfoLibro.innerHTML = "";
        //creo riga con le info del libro
        var rigaInfoLibro = document.createElement("tr");
        //inserisco info del libro in analisi nella riga creata
        rigaInfoLibro.innerHTML = "<td>".concat(libro.materia, "</td><td>").concat(libro.isbn, "</td><td>").concat(libro.autore, "</td><td>").concat(libro.titolo, "</td><td>").concat(libro.volume, "</td><td>").concat(libro.editore, "</td><td>").concat(libro.prezzoListino, "</td><td>").concat(libro.classe, "</td>");
        //inserisco riga con le info del libro nella tabella a singola riga
        corpoInfoLibro.appendChild(rigaInfoLibro);
        // prelevo reference del corpo della tabella per visualizzare le singole copie del libro
        var corpoTabellaCopie = document.getElementById("corpoTabellaCopie");
        //svuoto tabella
        corpoTabellaCopie.innerHTML = "";
        //prelevo elenco di copie del libro
        var copieLibro = libro.getCopieAsArray();
        //itero e visualizzo ogni copia del libro
        for (var i = 0; i < libro.getNCopie(); i++) {
            var copiaDelLibro = copieLibro[i];
            //creo riga nella tabella
            var riga = document.createElement("tr");
            riga.innerHTML = "<td>".concat(copiaDelLibro.codiceUnivoco, "</td><td>").concat(copiaDelLibro.venditore, "</td><td>").concat(copiaDelLibro.scontoPrezzoListino, "</td>");
            // inserisco riga nel corpo della tabella
            corpoTabellaCopie.appendChild(riga);
        }
    }
}
// funzione per registrare una nuova copia di un determinato libro
function apriRegistrazioneCopia() {
    if (popupAggiungiCopie != null) {
        //quando clicco il bottone per registrare una nuova copia, apro il form
        popupAggiungiCopie.style.display = "flex";
    }
}
function chiudiRegistrazioneCopia() {
    if (popupAggiungiCopie != null) {
        // quando clicco il bottone per chiudere il popupAggiungiCopie, lo imposto come nascosto
        popupAggiungiCopie.style.display = "none";
    }
}
// funzione che mostra la pagina per scegliere un venditore/aggiungerne uno nuovo
function mostraVenditori() {
    window.open("gestoreVenditori.html", "_blank", "menubar=no, width=700px, height=500px");
}
// registro ascoltatore quando la pagina è pronta
window.addEventListener("DOMContentLoaded", function () {
    //ascolto messaggi inviati alla finestra
    window.addEventListener("message", function (evento) { return caricaCopieLibro(evento); });
});
