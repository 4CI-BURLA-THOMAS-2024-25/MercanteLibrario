const path = require('path');

module.exports = {
  mode: "production",
  entry: {
    scriptGestoreVenditori: './src/scriptGestoreVenditori.ts', //script pagina gestore venditori
    scriptGestoreCopieVenditore: './src/scriptGestoreCopieVenditore.ts', //script pagina per gestire le copie di ciascun venditore
    scriptSelezionaLibro: './src/scriptSelezionaLibro.ts', //script pagina per scegliere libro da associare alla copia in registrazione
    scriptCopieEliminate: './src/scriptCopieEliminate.ts', //script per gestire la pagina del cestino delle copie
    scriptCopieVendute: './src/scriptCopieVendute.ts', //script per gestire la pagina delle copie vendute
    scriptElencoCompletoCopie: './src/scriptElencoCompletoCopie.ts', //script per gestire la pagina che mostra tutte le copie
    scriptCarrello: './src/scriptCarrello.ts', //script che gestisce il carrello
    scriptRicevutaAcquisto: './src/scriptRicevutaAcquisto.ts' //script che genera la ricevuta di acquisto
  },
  output: {
    filename: '[name].js', // nome basato sul file di output
    path: path.resolve(__dirname, 'out')  // Salva il file in /out
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
