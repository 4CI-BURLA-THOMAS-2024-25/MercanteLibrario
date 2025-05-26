//connessione tra host
export const ws = new WebSocket('ws://localHost:8082');

//comunicazione
ws.onopen = function () {
    console.log("aperto il server");
}

ws.onclose = function () {
    console.log("connessione server chiusa");
}

ws.onerror = function (error) {
    console.log("errore nel webSocket", error);
}