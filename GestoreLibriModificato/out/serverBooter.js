const fs = require('fs');
const WebSocket = require('ws');

// Crea un server WebSocket sulla porta 8080
const wss = new WebSocket.Server({ port: 8080 });
let istruzioneprecedente;
let condizione = false;
let modifiche = false;
let istruzione = "";
wss.on('connection', (ws) => {
    console.log('Un client si è connesso!');
	ws.on('message', (message) => {
        console.log(`Messaggio ricevuto dal client: ${message}`);
		istruzione = message.toString().trim();
        switch (istruzione) {
            case '':
              
				
				break;
			case 'lascia':
				
				break;
            default:
        }
    });
	 ws.on('close', () => {
        console.log('Il client si è disconnesso.');
    });
});
console.log('Server WebSocket avviato su ws://localhost:8080');