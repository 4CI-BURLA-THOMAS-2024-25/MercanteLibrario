const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8081 });
const clientsWss = new Set();

wss.on('connection', function connection(ws) {
    console.log('Nuova connessione WebSocket su wss (8081)');
    clientsWss.add(ws);

    ws.on('message', (message) => {
        console.log('Messaggio ricevuto dal client wss (8081): %s', message);
        const mes = message.toString().trim();
        let stato = mes.split(",");

        if (stato[0] === "stato") {
            fs.readFile('db_server.txt', 'utf-8', (err, contenuto) => {
                if (err) {
                    console.error('Errore nella lettura del file:', err);
                    return;
                }

                

                let contenutoSplittato = contenuto.split("\n");
                let numeroStato = parseInt(stato[1]);
                console.log("File letto correttamente");
                // Verifica se numeroStato è valido
                if (isNaN(numeroStato) || numeroStato < 0 || numeroStato >= contenutoSplittato.length) {
                    console.error("Indice stato non valido: ", numeroStato);
                    return;
                }

                // Invia solo le nuove informazioni ai client
                console.log(numeroStato);
                for (let i = numeroStato; i < contenutoSplittato.length; i++) {
                    clientsWss.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(contenutoSplittato[i]);
                            console.log("cacca"+contenutoSplittato[i]);
                        }
                    });
                }
            });
        } else {
            // Inoltra a tutti i client connessi
            clientsWss.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    console.log("Inoltro messaggio: ", mes);
                    client.send(mes);
                }
            });

            // Scrittura su file
            fs.appendFile('db_server.txt', mes + "\n", (err) => {
                if (err) console.error('Errore durante la scrittura:', err);
                else console.log('Dati salvati su file!');
            });
        }
    });

    ws.on('close', () => {
        clientsWss.delete(ws);
        console.log('Connessione chiusa su wss (8081)');
    });
});

console.log('Server WebSocket in ascolto su ws://localhost:8081');