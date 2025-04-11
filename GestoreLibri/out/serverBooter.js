const fs = require('fs');
const WebSocket = require('ws');

// Percorso al file da leggere
const filePath = './prova.txt'; // Assicurati di avere un file chiamato 'prova.txt'

// Crea un server WebSocket sulla porta 8080
const wss = new WebSocket.Server({ port: 8080 });

let condizione = false;
let istruzione = "";
wss.on('connection', (ws) => {
    console.log('Un client si è connesso!');
	ws.on('message', (message) => {
        console.log(`Messaggio ricevuto dal client: ${message}`);
		istruzione = message.toString().trim();
        switch (istruzione) {
            case 'prendi':
                if(!condizione){	
					condizione =  true;	
					fs.readFile('J:/mercatino/prova.txt', 'utf8', (err, data) => {
					if (err) {
						console.error('Errore nella lettura del file:', err);
						ws.send('Errore nella lettura del file.');
						return;
					}

					// Invia i dati letti al client
					ws.send(data);
					console.log('Dati inviati al client:', data);
				});	
				}
				break;
			case 'lascia':
				if(condizione){
					condizione = false;
				}
				break;
            default:
                ws.send(`Messaggio "${message}" non riconosciuto.`);
                console.log(`Messaggio "${message}" non gestito.`);
                break;
        }
    });
	 ws.on('close', () => {
        console.log('Il client si è disconnesso.');
    });
});
console.log('Server WebSocket avviato su ws://localhost:8080');