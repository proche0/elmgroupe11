const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const readline = require('readline');
const filePath = path.join(__dirname, 'mots.csv');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function demanderNombreJoueurs() {
    rl.question("Entrez le nombre de joueurs (compris entre 3 et 5) : ", (reponse) => {
        let nombreJoueurs = parseInt(reponse);
        if (nombreJoueurs >= 3 && nombreJoueurs <= 5) {
            return(nombreJoueurs);
        } else {
            console.log("Nombre invalide. Essayez encore.");
            return(demanderNombreJoueurs());
        }
    });
}

function demanderNomsJoueurs(nombreJoueurs) {
    let listeJoueurs = [];
    for (let i = 1; i <= nombreJoueurs; i++) {
        rl.question(`Quel est le nom du joueur numéro ${i} ? `, (nom) => {
                listeJoueurs.push(nom);
        });
    }
    return listeJoueurs;
}

function Roles(listeJoueurs) {
    let i = Math.floor(Math.random() * listeJoueurs.length);
    let JoueurDevine = listeJoueurs[i];
    let JoueurIndice = listeJoueurs.filter((_, index) => index !== i);
    console.log(`${JoueurDevine} devinera le mot.`);
    return [JoueurDevine, JoueurIndice];
}

function ListeIndices(JoueurIndice, ChoisirMot) {
    let listeIndices = [];
    for (let i = 0; i < JoueurIndice.length; i++) {
        rl.question(`Le mot à deviner est "${ChoisirMot}". ${JoueurIndice[i]}, quel est ton indice ? `, (indice) => {
            listeIndices.push(indice.toLowerCase());
        });
    }
    return listeIndices;
}

function IndicesValides(listeIndices) {
    return listeIndices.filter((indice, index) =>
        listeIndices.indexOf(indice) === listeIndices.lastIndexOf(indice)
    );
}

function Deviner(IndicesValides, JoueurDevine, ChoisirMot) {
    rl.question(`${JoueurDevine}, tes indices sont : ${IndicesValides.join(", ")}. Quel est ton mot ? `, (tentative) => {
        if (tentative.toLowerCase() === ChoisirMot.toLowerCase()) {
            console.log('Félicitations, tu as trouvé le mot !');
            return(true);
        } else {
            console.log('Aïe... Ce n\'était pas le bon mot.');
            return(false);
        }
    });
}

function ChoisirMot(MotsPrecedents) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier:', err);
            reject(err);
            return;
        }
    
        parse(data, {delimiter: ','}, (err, records) => {
            if (err) {
                console.error('Erreur lors du parsing du CSV:', err);
                reject(err);
                return;
            }

            console.log(records[0].slice(1).join(' | '));
        
            rl.question('Entrez le nom du thème choisi : ', (input) => {
                const themeChoice = input.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
                const themeIndex = records[0].findIndex(theme => theme.toLowerCase() === themeChoice);
    
                if (themeIndex !== -1) {
                    let ligneAleatoire;
                    let motsMystere;

                    do {
                        ligneAleatoire = Math.floor(Math.random() * (records.length - 1)) + 1;
                        motsMystere = records[ligneAleatoire][themeIndex];
                    } while (MotsPrecedents.includes(motsMystere));
    
                    console.log("Mot mystère choisi : "+ String(motsMystere));
                    resolve(motsMystere);

                } else {
                    console.log('Choix invalide. Veuillez entrer un nom valide parmi les thèmes.');
                    resolve(ChoisirMot(MotsPrecedents));
                }
            });
        });
    });
}

function demanderNombreManches() {
    rl.question('Combien de tours voulez-vous faire ? ', (nombreManches) => {
        nombreManches = parseInt(nombreManches);
        if (isNaN(nombreManches) || nombreManches <= 0) {
            console.log("Nombre de manches invalide. Veuillez entrer un nombre supérieur à 0.");
            poserQuestion();
        } else {
            return(nombreManches);
        }
    });
};


function main() {
    console.log('Bienvenue au Just One !');
    let score = 0;
    let MotsPrecedents = [];
    const nombreJoueurs = demanderNombreJoueurs();
    const listeJoueurs = demanderNomsJoueurs(nombreJoueurs);
    const nombreManches = demanderNombreManches();

    for (let i = 1; i <= nombreManches; i++) {
        console.log(`\n--- Début de la manche ${i} ---`);
        const [JoueurDevine, JoueurIndice] = Roles(listeJoueurs);
        const motsMystere = ChoisirMot(MotsPrecedents);
        const listeIndices = ListeIndices(JoueurIndice, motsMystere);
        const indicesValides = IndicesValides(listeIndices);
        const resultat = Deviner(indicesValides, JoueurDevine, motsMystere);

        if (resultat) {
            score++;
        }

        MotsPrecedents.push(motsMystere);
        console.log(`Score après la manche ${i}: ${score}\n`);
    }

    console.log(`Fin de la partie ! Score final : ${score} sur ${nombreManches} tours.`);
    rl.close();
}

main();
