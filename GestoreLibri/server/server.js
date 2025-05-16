const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8081 });
const wss1 = new WebSocket.Server({ port: 8082 });

const clientsWss = new Set();
const clientsWss1 = new Set();

wss.on('connection', function connection(ws) {
    console.log('Nuova connessione WebSocket su wss (8081)');
    clientsWss.add(ws);

    ws.on('message', (message) => {
        console.log('Messaggio ricevuto dal client wss (8081): %s', message);
        const mes = message.toString().trim();

        // Inoltra a tutti i client di wss1
        clientsWss1.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(mes);
            }
        });

        
        // Scrittura su file
        const mess1 = mes.replace(/(nome|isCopia|prezzo|codiceVolume|numero|[{}:" ])/g, '');
        fs.appendFile('db_server.txt', mess1 + "\n", (err) => {
            if (err) console.error('Errore:', err);
            else console.log('Dati salvati su file!');
        });
    });

    ws.on('close', () => {
        clientsWss.delete(ws);
        console.log('Connessione chiusa su wss (8081)');
    });
});

wss1.on('connection', function connection(ws) {
    console.log('Nuova connessione WebSocket su wss1 (8082)');
    clientsWss1.add(ws);

    ws.on('message', (message) => {
        console.log('Messaggio ricevuto dal client wss1 (8082): %s', message);
        const mes = message.toString().trim();

        // Inoltra a tutti i client di wss
        clientsWss.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(mes);
            }
        });

        // Scrittura su file
        const mess1 = mes.replace(/(nome|isCopia|prezzo|codiceVolume|numero|[{}:" ])/g, '');
        fs.appendFile('db_server.txt', mess1 + "\n", (err) => {
            if (err) console.error('Errore:', err);
            else console.log('Dati salvati su file!');
        });
    });

    ws.on('close', () => {
        clientsWss1.delete(ws);
        console.log('Connessione chiusa su wss1 (8082)');
    });
});

console.log('Server WebSocket in ascolto su ws://localhost:8081 e ws://localhost:8082');