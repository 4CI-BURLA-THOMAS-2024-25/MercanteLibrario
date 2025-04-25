const path = require('path');

module.exports = {
  mode: "production",
  entry: {
    scriptMainUnico: './src/scriptMain.ts',  // script principale
    scriptGestoreCopieUnico: './src/scriptGestoreCopie.ts', //script pagina popup del gestore copie
    scriptGestoreVenditoriUnico: './src/scriptGestoreVenditori.ts', //script pagina gestore venditori
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
