const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const readline = require('readline');
const filePath = path.join(__dirname, 'mots.csv');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier:', err);
    return;
  }

  parse(data, {
    delimiter: ',',
  }, (err, records) => {
    if (err) {
      console.error('Erreur lors du parsing du CSV:', err);
      return;
    }
    console.log(records[0].slice(1).join(' | '));
    rl.question('Entrez le nom du thème choisi : ', (input) => {
      const themeChoice = input.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
      const themeIndex = records[0].findIndex(theme => theme.toLowerCase() === themeChoice);

      if (themeIndex !== -1) {
        let ligneAleatoire = Math.floor(Math.random() * (records.length -1))+1;
        let numeroTheme = themeIndex;
        let motsMystere = records[ligneAleatoire][numeroTheme];

        console.log("Mot mystère choisi : "+ String(motsMystere));
      } else {
        console.log('Choix invalide. Veuillez entrer un nom valide parmi les thèmes.');
      }
      rl.close();
    });
  });
});
