const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const readline = require('readline');

const filePath = path.join(__dirname, 'mots.csv');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (texte) => {
    return new Promise((resolve) => {
        rl.question(texte, (reponse) => resolve(reponse));
    });
};

async function demanderNombreJoueurs() {
    while (true) {
        let reponse = await question("Entrez le nombre de joueurs (3 à 5) : ");
        let nombreJoueurs = parseInt(reponse);
        if (nombreJoueurs >= 3 && nombreJoueurs <= 5) {
            return nombreJoueurs;
        }
        console.log("Nombre invalide. Essayez encore.");
    }
}

async function demanderNomsJoueurs(nombreJoueurs) {
    let listeJoueurs = [];
    for (let i = 1; i <= nombreJoueurs; i++) {
        let nom = await question(`Quel est le nom du joueur numéro ${i} ? `);
        listeJoueurs.push(nom);
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

async function ListeIndices(JoueurIndice, ChoisirMot) {
    let listeIndices = [];
    for (let i = 0; i < JoueurIndice.length; i++) {
        let indice = await question(`Le mot à deviner est "${ChoisirMot}". ${JoueurIndice[i]}, quel est ton indice ? `);
        listeIndices.push(indice.toLowerCase());
    }
    return listeIndices;
}

function IndicesValides(listeIndices) {
    return listeIndices.filter((indice, index) =>
        listeIndices.indexOf(indice) === listeIndices.lastIndexOf(indice)
    );
}

async function Deviner(IndicesValides, JoueurDevine, ChoisirMot) {
    let tentative = await question(`${JoueurDevine}, tes indices sont : ${IndicesValides.join(", ")}. Quel est ton mot ? `);
    if (tentative.toLowerCase() === ChoisirMot.toLowerCase()) {
        console.log('Félicitations, tu as trouvé le mot !');
        return [true,tentative]);
    } else {
        console.log('Aïe... Ce n\'était pas le bon mot.');
        return [false,tentative]);
    }
}

function ChoisirMot(MotsPrecedents) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Erreur de lecture du fichier:', err);
                return reject(err);
            }
    
            parse(data, { delimiter: ',' }, async (err, records) => {
                if (err) {
                    console.error('Erreur de parsing du CSV:', err);
                    return reject(err);
                }

                console.log(records[0].slice(1).join(' | '));
                let input = await question('Entrez le nom du thème choisi : ');
                let themeChoice = input.trim().toLowerCase();
                let themeIndex = records[0].findIndex(theme => theme.toLowerCase() === themeChoice);

                if (themeIndex !== -1) {
                    let ligneAleatoire, motsMystere;
                    do {
                        ligneAleatoire = Math.floor(Math.random() * (records.length - 1)) + 1;
                        motsMystere = records[ligneAleatoire][themeIndex];
                    } while (MotsPrecedents.includes(motsMystere));

                    console.log("Mot mystère choisi : " + motsMystere);
                    resolve(motsMystere);
                } else {
                    console.log('Choix invalide. Veuillez entrer un nom valide parmi les thèmes.');
                    resolve(await ChoisirMot(MotsPrecedents));
                }
            });
        });
    });
}

async function demanderNombreManches() {
    while (true) {
        let nombreManches = await question('Combien de tours voulez-vous faire ? ');
        nombreManches = parseInt(nombreManches);
        if (!isNaN(nombreManches) && nombreManches > 0) {
            return nombreManches;
        }
        console.log("Nombre de manches invalide. Veuillez entrer un nombre supérieur à 0.");
    }
}

async function main() {
    partie= {
        manches: [],
    };
    let historique = "historique.json";
    fs.writeFileSync(historique, JSON.stringify(partie, null, 4), 'utf8');
    const contenu = fs.readFileSync(historique, 'utf8');
    data = JSON.parse(contenu);
    
    console.log('Bienvenue au Just One !');
    let score = 0;
    let MotsPrecedents = [];
    const nombreJoueurs = await demanderNombreJoueurs();
    const listeJoueurs = await demanderNomsJoueurs(nombreJoueurs);
    const nombreManches = await demanderNombreManches();

    for (let i = 1; i <= nombreManches; i++) {
        console.log(`\n--- Début de la manche ${i} ---`);
        const [JoueurDevine, JoueurIndice] = Roles(listeJoueurs);
        const motsMystere = await ChoisirMot(MotsPrecedents);
        const listeIndices = await ListeIndices(JoueurIndice, motsMystere);
        const indicesValides = IndicesValides(listeIndices);
        const [resultat, tentative] = await Deviner(indicesValides, JoueurDevine, motsMystere);
        data.manches.push({
            manche: i,
            mot: motsMystere,
            joueur_devine: JoueurDevine,
            joueurs_indices: JoueurIndice,
            indices: listeIndices,
            indicesValides: indicesValides,
            tentative: tentative,
            resultat: resultat
        });
        fs.writeFileSync(historique, JSON.stringify(data, null, 4), 'utf8');

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
