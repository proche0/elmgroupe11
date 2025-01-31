const { matchesGlob } = require("path");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function demanderNombreJoueurs() {
    return new Promise((resolve) => {
        rl.question("Entrez le nombre de joueurs (compris entre 3 et 5) : ", (reponse) => {
            let nombre = parseInt(reponse);
            if (nombre >= 3 && nombre <= 5) {
                resolve(nombre);
            } else {
                console.log("Nombre invalide. Essayez encore.");
                resolve(demanderNombreJoueurs());
            }
        });
    });
}

async function demanderNomsJoueurs(nombreJoueurs) {
    let listeJoueurs = [];

    for (let i = 1; i <= nombreJoueurs; i++) {
        await new Promise((resolve) => {
            rl.question(`Quel est le nom du joueur numéro ${i} ? `, (nom) => {
                listeJoueurs.push(nom);
                resolve();
            });
        });
    }

    return listeJoueurs;
}

async function main() {
    let nombreJoueurs = await demanderNombreJoueurs();
    let listeJoueurs = await demanderNomsJoueurs(nombreJoueurs);

    console.log("Joueurs inscrits :", listeJoueurs);
    rl.close();
}

let JoueurDevine = listeJoueurs[Math.floor(Math.random() * listeJoueurs.length)];
console.log(`${JoueurDevine} devinera le mot des autres joueurs.`)

setTimeout(() => {}, 5000);

let listeIndices = [];
for (let i = 0; i <= nombreJoueurs; i++) {
    await new Promise((resolve) => {
        rl.question(`Quel est ton indice ${listeJoueurs[0]} ? `, (indice) => {
            listeIndices.push(indice);
            resolve();
        });
    });
}



main();
