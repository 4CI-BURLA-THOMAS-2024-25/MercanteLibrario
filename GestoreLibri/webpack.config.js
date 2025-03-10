const path = require('path');

module.exports = {
    mode: "production",
  entry: './src/script.ts',  // Punto di ingresso principale
  output: {
    filename: 'scriptUnico.js',
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
